---
timestamp: 'Thu Oct 16 2025 16:49:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_164945.eea9dd25.md]]'
content_id: 68029179e975a522a85ac806fd8af125fe91cfe17485ed08baeb52a4319da171
---

# response:

```typescript
// file: src/ProgressionBuilder/ProgressionBuilderConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "../../utils/types.ts"; // Adjust path as necessary for your project structure
import { freshID } from "../../utils/database.ts"; // Adjust path as necessary for your project structure

// Declare collection prefix, use concept name
const PREFIX = "ProgressionBuilder" + ".";

/**
 * Interface for a Slot in a chord progression.
 * Each slot can hold a chord string or be null if no chord is set.
 */
interface Slot {
  chord: string | null;
}

/**
 * @state
 * A set of `Progressions` with
 *   An `id` of type `ID` (string, as per framework guidelines,
 *     note: spec indicates `Number` but using `ID` for consistency with the provided framework for MongoDB IDs)
 *   A `name` of type `String`
 *   A `chordSequence` of type sequence of `Slots`, each with
 *     a `chord` of type `String`, or `null` if no chord is set
 */
interface Progression {
  _id: ID; // MongoDB's primary key, internally representing the concept's `id`
  name: string;
  chordSequence: Slot[];
}

/**
 * Interface for progression identifiers returned by `_listProgressions`.
 * Note: `id` is `ID` (string) for consistency with internal representation.
 */
interface ProgressionIdentifier {
  id: ID;
  name: string;
}

/**
 * @concept ProgressionBuilder
 * @purpose enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
 * @principle A user creates a new progression, which starts as an empty sequence, and names it.
 * They can add new slots to extend the sequence, and set chords to slots, remove chords from slots,
 * remove slots, or reorder slots.
 */
export default class ProgressionBuilderConcept {
  // The concept's state is stored in a MongoDB collection named 'progressions'.
  private progressions: Collection<Progression>;

  /**
   * Constructs a new ProgressionBuilderConcept instance.
   * @param {Db} db - The MongoDB database instance to use.
   */
  constructor(private readonly db: Db) {
    this.progressions = this.db.collection<Progression>(PREFIX + "progressions");
  }

  /**
   * @action createProgression
   * @effect Creates a new, empty progression with the given name, and unique id, and returns that id.
   * @param {object} args - The action arguments.
   * @param {string} args.name - The name of the new progression.
   * @returns {{progression: Progression} | {error: string}} - The created progression or an error.
   */
  async createProgression({
    name,
  }: {
    name: string;
  }): Promise<{ progression: Progression } | { error: string }> {
    const newId = freshID();
    const newProgression: Progression = {
      _id: newId,
      name,
      chordSequence: [],
    };

    try {
      await this.progressions.insertOne(newProgression);
      return { progression: newProgression };
    } catch (e) {
      return { error: `Failed to create progression: ${e.message}` };
    }
  }

  /**
   * @action addSlot
   * @requires `progressionId` is a valid id of a progression
   * @effect appends a null `Slot` to `chordSequence` of the progression with id `progressionId`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to modify.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async addSlot({
    progressionId,
  }: {
    progressionId: ID;
  }): Promise<Empty | { error: string }> {
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
   * @action setChord
   * @requires `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
   * @effect sets the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`’s `chord` to `chord`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The index of the slot to update.
   * @param {string} args.chord - The chord string to set.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async setChord({
    progressionId,
    position,
    chord,
  }: {
    progressionId: ID;
    position: number;
    chord: string;
  }): Promise<Empty | { error: string }> {
    // Precondition check: Progression must exist and position must be valid.
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error: `Invalid position ${position}. Progression ID ${progressionId} has ${progression.chordSequence.length} slots.`,
      };
    }

    const updateField = `chordSequence.${position}.chord`;
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [updateField]: chord } },
    );

    if (result.matchedCount === 0) {
      return {
        error:
          `Failed to update chord at position ${position} for progression ID ${progressionId}.`,
      };
    }
    return {};
  }

  /**
   * @action deleteChord
   * @requires `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
   * @effect sets `chord` at the `Slot` at `position` of `chordSequence` of the progression with id `progressionId` to `null`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The index of the slot to clear.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async deleteChord({
    progressionId,
    position,
  }: {
    progressionId: ID;
    position: number;
  }): Promise<Empty | { error: string }> {
    // Precondition check: Progression must exist and position must be valid.
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error: `Invalid position ${position}. Progression ID ${progressionId} has ${progression.chordSequence.length} slots.`,
      };
    }

    const updateField = `chordSequence.${position}.chord`;
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [updateField]: null } },
    );

    if (result.matchedCount === 0) {
      return {
        error:
          `Failed to delete chord at position ${position} for progression ID ${progressionId}.`,
      };
    }
    return {};
  }

  /**
   * @action deleteSlot
   * @requires `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
   * @effect removes the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The index of the slot to remove.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async deleteSlot({
    progressionId,
    position,
  }: {
    progressionId: ID;
    position: number;
  }): Promise<Empty | { error: string }> {
    // Precondition check: Progression must exist and position must be valid.
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error: `Invalid position ${position}. Progression ID ${progressionId} has ${progression.chordSequence.length} slots.`,
      };
    }

    // Use $unset to replace the element at 'position' with null, then $pull to remove all nulls
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $unset: { [`chordSequence.${position}`]: 1 } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to mark slot at position ${position} for removal for progression ID ${progressionId}.`,
      };
    }

    // Now, compact the array by pulling out all null elements (which was the removed slot)
    await this.progressions.updateOne(
      { _id: progressionId },
      { $pull: { chordSequence: null } },
    );

    return {};
  }

  /**
   * @action reorderSlots
   * @requires `progressionId` is a valid id of a progression, `oldPosition` is a valid index of `chordSequence` of the progression with id `progressionId`, `newPosition` is a valid index of `chordSequence` of the progression with id `progressionId`
   * @effect moves the `Slot` at `oldPosition` of `chordSequence` of the progression with id `progressionId` to `newPosition`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to modify.
   * @param {number} args.oldPosition - The current index of the slot.
   * @param {number} args.newPosition - The target index for the slot.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async reorderSlots({
    progressionId,
    oldPosition,
    newPosition,
  }: {
    progressionId: ID;
    oldPosition: number;
    newPosition: number;
  }): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    const sequence = progression.chordSequence;
    if (
      oldPosition < 0 || oldPosition >= sequence.length ||
      newPosition < 0 || newPosition >= sequence.length
    ) {
      return {
        error:
          `Invalid oldPosition (${oldPosition}) or newPosition (${newPosition}). Progression ID ${progressionId} has ${sequence.length} slots.`,
      };
    }

    // Perform the reordering in memory
    const [movedSlot] = sequence.splice(oldPosition, 1);
    sequence.splice(newPosition, 0, movedSlot);

    // Update the entire array in MongoDB. This is safe for reasonably sized arrays.
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: sequence } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to reorder slots for progression ID ${progressionId}.`,
      };
    }
    return {};
  }

  /**
   * @action deleteProgression
   * @requires `progressionId` is a valid id of a progression
   * @effect removes the progression with id `progressionId`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to delete.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async deleteProgression({
    progressionId,
  }: {
    progressionId: ID;
  }): Promise<Empty | { error: string }> {
    const result = await this.progressions.deleteOne({ _id: progressionId });
    if (result.deletedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * @action renameProgression
   * @requires `progressionId` is a valid id of a progression
   * @effect sets the name of the progression with id `progressionId` to `name`
   * @param {object} args - The action arguments.
   * @param {ID} args.progressionId - The ID of the progression to rename.
   * @param {string} args.name - The new name for the progression.
   * @returns {Empty | {error: string}} - An empty object on success, or an error.
   */
  async renameProgression({
    progressionId,
    name,
  }: {
    progressionId: ID;
    name: string;
  }): Promise<Empty | { error: string }> {
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { name: name } },
    );
    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * @query _getProgression
   * @requires `progressionId` is a valid id of a progression
   * @effect returns the progression with id `progressionId`
   * @param {object} args - The query arguments.
   * @param {ID} args.progressionId - The ID of the progression to retrieve.
   * @returns {{progression: Progression} | {error: string}} - The found progression or an error.
   */
  async _getProgression({
    progressionId,
  }: {
    progressionId: ID;
  }): Promise<{ progression: Progression } | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return { progression: progression };
  }

  /**
   * @query _listProgressions
   * @effect returns a list of all progression names and ids
   * @returns {{progressionIdentifiers: ProgressionIdentifier[]} | {error: string}} - A list of progression identifiers or an error.
   */
  async _listProgressions(): Promise<
    { progressionIdentifiers: ProgressionIdentifier[] } | { error: string }
  > {
    try {
      const identifiers = await this.progressions.find({}, {
        projection: { _id: 1, name: 1 }, // Only retrieve _id and name
      }).map((doc) => ({ id: doc._id, name: doc.name })) // Map to ProgressionIdentifier structure
        .toArray();
      return { progressionIdentifiers: identifiers };
    } catch (e) {
      return { error: `Failed to list progressions: ${e.message}` };
    }
  }
}
```
