---
timestamp: 'Thu Oct 16 2025 16:50:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_165051.9a18d7da.md]]'
content_id: f00bcd08639776d88149172b244af298ae4d57278764a1eae32660979ed76816
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "ProgressionBuilder" + ".";

// Generic types for the concept's external dependencies
// Per implementation guidelines, all IDs are `ID` (string)
type Progression = ID;

/**
 * Represents a single slot in a chord sequence, holding a chord or null.
 */
interface Slot {
  chord: string | null;
}

/**
 * @interface ProgressionDoc
 * @description
 * State: A set of Progressions with an ID, a name, and a chord sequence.
 * @property {Progression} _id - The unique identifier of the progression.
 * @property {string} name - The name of the progression.
 * @property {Slot[]} chordSequence - An ordered array of slots, each potentially holding a chord.
 */
interface ProgressionDoc {
  _id: Progression;
  name: string;
  chordSequence: Slot[];
}

/**
 * @concept ProgressionBuilder
 * @purpose To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
 * @principle A user creates a new progression, which starts as an empty sequence, and names it. They can add new slots to extend the sequence, and set chords to slots, remove chords from slots, remove slots, or reorder slots.
 */
export default class ProgressionBuilderConcept {
  progressions: Collection<ProgressionDoc>;

  constructor(private readonly db: Db) {
    this.progressions = this.db.collection(PREFIX + "progressions");
  }

  /**
   * Action: Creates a new, empty progression with the given name.
   * @param {string} name - The name for the new progression.
   * @returns {{ progression: Progression } | { error: string }} - The ID of the newly created progression, or an error.
   * @effects A new progression is created with a unique ID, the given name, and an empty chord sequence.
   */
  async createProgression(
    { name }: { name: string },
  ): Promise<{ progression: Progression } | { error: string }> {
    if (!name || name.trim() === "") {
      return { error: "Progression name cannot be empty." };
    }

    const progressionId = freshID() as Progression;
    const result = await this.progressions.insertOne({
      _id: progressionId,
      name: name.trim(),
      chordSequence: [],
    });

    if (!result.acknowledged) {
      return { error: "Failed to create progression." };
    }

    return { progression: progressionId };
  }

  /**
   * Action: Appends a null Slot to the chordSequence of the specified progression.
   * @param {Progression} progressionId - The ID of the progression to modify.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects A new slot with a null chord is appended to the progression's chord sequence.
   */
  async addSlot(
    { progressionId }: { progressionId: Progression },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $push: { chordSequence: { chord: null } } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    return {};
  }

  /**
   * Action: Sets the chord of the Slot at the given position in a progression's chordSequence.
   * @param {Progression} progressionId - The ID of the progression to modify.
   * @param {number} position - The index of the slot to update.
   * @param {string} chord - The chord string to set.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `position` is a valid index within the `chordSequence` of the progression.
   * @effects The `chord` field of the slot at `position` in `chordSequence` is set to `chord`.
   */
  async setChord(
    { progressionId, position, chord }: {
      progressionId: Progression;
      position: number;
      chord: string;
    },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return { error: `Invalid position: ${position}. Index out of bounds.` };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chordSequence.${position}.chord`]: chord } },
    );

    if (result.matchedCount === 0) {
      // This case should ideally not happen if progression was found above, but good safeguard
      return { error: `Failed to set chord for progression ${progressionId}.` };
    }

    return {};
  }

  /**
   * Action: Sets the chord of the Slot at the given position to null.
   * @param {Progression} progressionId - The ID of the progression to modify.
   * @param {number} position - The index of the slot to clear.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `position` is a valid index within the `chordSequence` of the progression.
   * @effects The `chord` field of the slot at `position` in `chordSequence` is set to `null`.
   */
  async deleteChord(
    { progressionId, position }: { progressionId: Progression; position: number },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return { error: `Invalid position: ${position}. Index out of bounds.` };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chordSequence.${position}.chord`]: null } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to delete chord for progression ${progressionId}.`,
      };
    }

    return {};
  }

  /**
   * Action: Removes the Slot at the given position from a progression's chordSequence.
   * @param {Progression} progressionId - The ID of the progression to modify.
   * @param {number} position - The index of the slot to remove.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `position` is a valid index within the `chordSequence` of the progression.
   * @effects The slot at `position` is removed from the progression's chord sequence.
   */
  async deleteSlot(
    { progressionId, position }: { progressionId: Progression; position: number },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return { error: `Invalid position: ${position}. Index out of bounds.` };
    }

    const newChordSequence = [...progression.chordSequence];
    newChordSequence.splice(position, 1);

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: newChordSequence } },
    );

    if (result.matchedCount === 0) {
      return { error: `Failed to delete slot for progression ${progressionId}.` };
    }

    return {};
  }

  /**
   * Action: Reorders slots within a progression's chordSequence.
   * @param {Progression} progressionId - The ID of the progression to modify.
   * @param {number} oldPosition - The current index of the slot to move.
   * @param {number} newPosition - The target index for the slot.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `oldPosition` and `newPosition` are valid indices within the `chordSequence`.
   * @effects The slot at `oldPosition` is moved to `newPosition` in the `chordSequence`.
   */
  async reorderSlots(
    { progressionId, oldPosition, newPosition }: {
      progressionId: Progression;
      oldPosition: number;
      newPosition: number;
    },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    const { chordSequence } = progression;
    if (
      oldPosition < 0 || oldPosition >= chordSequence.length ||
      newPosition < 0 || newPosition >= chordSequence.length
    ) {
      return { error: "Invalid oldPosition or newPosition. Index out of bounds." };
    }

    const newSequence = [...chordSequence];
    const [movedItem] = newSequence.splice(oldPosition, 1);
    newSequence.splice(newPosition, 0, movedItem);

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: newSequence } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to reorder slots for progression ${progressionId}.`,
      };
    }

    return {};
  }

  /**
   * Action: Removes an entire progression.
   * @param {Progression} progressionId - The ID of the progression to delete.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects The progression with the given ID is removed from the state.
   */
  async deleteProgression(
    { progressionId }: { progressionId: Progression },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.deleteOne({ _id: progressionId });

    if (result.deletedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    return {};
  }

  /**
   * Action: Renames an existing progression.
   * @param {Progression} progressionId - The ID of the progression to rename.
   * @param {string} name - The new name for the progression.
   * @returns {Empty | { error: string }} - An empty object on success, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects The `name` field of the progression with ID `progressionId` is updated to `name`.
   */
  async renameProgression(
    { progressionId, name }: { progressionId: Progression; name: string },
  ): Promise<Empty | { error: string }> {
    if (!name || name.trim() === "") {
      return { error: "Progression name cannot be empty." };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { name: name.trim() } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    return {};
  }

  /**
   * Query: Retrieves a specific progression by its ID.
   * @param {Progression} progressionId - The ID of the progression to retrieve.
   * @returns {{ progression: ProgressionDoc } | { error: string }} - The full progression document, or an error.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects Returns the progression with id `progressionId`.
   */
  async _getProgression(
    { progressionId }: { progressionId: Progression },
  ): Promise<{ progression: ProgressionDoc } | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return { progression };
  }

  /**
   * Query: Returns a list of all progression identifiers and their names.
   * @returns {{ progressionIdentifiers: Array<{ id: Progression; name: string }> }} - A list of objects, each containing an ID and name.
   * @effects Returns a list of all progression names and IDs.
   */
  async _listProgressions(): Promise<
    { progressionIdentifiers: Array<{ id: Progression; name: string }> }
  > {
    const identifiers = await this.progressions.find({}, {
      projection: { _id: 1, name: 1 },
    }).toArray();
    return {
      progressionIdentifiers: identifiers.map((doc) => ({
        id: doc._id,
        name: doc.name,
      })),
    };
  }
}
```
