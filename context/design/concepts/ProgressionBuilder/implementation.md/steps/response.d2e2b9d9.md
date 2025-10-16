---
timestamp: 'Thu Oct 16 2025 16:45:58 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_164558.9ffc73de.md]]'
content_id: d2e2b9d99531a65a7bb2b09c8608fb1085941b37409d31d0d49e830127e51922
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix to ensure namespace separation
const PREFIX = "ProgressionBuilder" + ".";

// Concept state types
interface Slot {
  chord: string | null;
}

interface ProgressionDoc {
  _id: ID; // Represents the unique identifier for a Progression
  name: string;
  chordSequence: Slot[];
}

// Action and Query return types for clarity and type safety
type CreateProgressionResult = { progressionId: ID } | { error: string };
type GetProgressionResult = { progression: ProgressionDoc } | { error: string };
type ListProgressionsResult = {
  progressions: Array<{ id: ID; name: string }>;
};

/**
 * @concept ProgressionBuilder
 * @purpose To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
 * @principle A user creates a new progression, which starts as an empty sequence, and names it. They can add new slots to extend the sequence, and set chords to slots, remove chords from slots, remove slots, or reorder slots.
 * @state
 *   A set of Progressions with
 *     An id of type ID (string)
 *     A name of type String
 *     A chordSequence of type sequence of Slots, each with
 *       a chord of type String, or null if no chord is set
 */
export default class ProgressionBuilderConcept {
  progressions: Collection<ProgressionDoc>;

  constructor(private readonly db: Db) {
    // Initialize the MongoDB collection for progressions
    this.progressions = this.db.collection(PREFIX + "progressions");
  }

  // --- Actions ---

  /**
   * Action: Creates a new, empty progression with the given name.
   * @param {string} name - The name of the new progression.
   * @effects A new progression is created with the given name and an empty chord sequence, and its ID is returned.
   */
  async createProgression(
    { name }: { name: string },
  ): Promise<CreateProgressionResult> {
    const progressionId = freshID() as ID;
    await this.progressions.insertOne({
      _id: progressionId,
      name,
      chordSequence: [],
    });
    return { progressionId };
  }

  /**
   * Action: Appends a new, empty slot to the chord sequence of a progression.
   * @param {ID} progressionId - The ID of the target progression.
   * @requires progressionId is a valid ID of an existing progression.
   * @effects A null Slot is appended to the chordSequence of the specified progression.
   */
  async addSlot(
    { progressionId }: { progressionId: ID },
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
   * Action: Sets the chord at a specific position in a progression's chord sequence.
   * @param {ID} progressionId - The ID of the target progression.
   * @param {number} position - The 0-based index of the slot to update.
   * @param {string} chord - The chord string to set.
   * @requires progressionId is a valid ID of an existing progression.
   * @requires position is a valid index within the progression's chordSequence.
   * @effects The Slot at the given position in the chordSequence of the specified progression has its chord set to the provided chord string.
   */
  async setChord(
    { progressionId, position, chord }: {
      progressionId: ID;
      position: number;
      chord: string;
    },
  ): Promise<Empty | { error: string }> {
    // Precondition: Validate progression existence and position
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression ${progressionId}.`,
      };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chordSequence.${position}.chord`]: chord } },
    );

    if (result.matchedCount === 0) {
      // This case should ideally not be reached if findOne succeeded, but it's a safeguard.
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * Action: Deletes the chord at a specific position in a progression's chord sequence by setting it to null.
   * @param {ID} progressionId - The ID of the target progression.
   * @param {number} position - The 0-based index of the slot to clear.
   * @requires progressionId is a valid ID of an existing progression.
   * @requires position is a valid index within the progression's chordSequence.
   * @effects The chord at the Slot at the given position in the chordSequence of the specified progression is set to null.
   */
  async deleteChord(
    { progressionId, position }: { progressionId: ID; position: number },
  ): Promise<Empty | { error: string }> {
    // Precondition: Validate progression existence and position
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression ${progressionId}.`,
      };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chordSequence.${position}.chord`]: null } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * Action: Deletes a slot (and its chord) at a specific position from a progression's chord sequence.
   * @param {ID} progressionId - The ID of the target progression.
   * @param {number} position - The 0-based index of the slot to remove.
   * @requires progressionId is a valid ID of an existing progression.
   * @requires position is a valid index within the progression's chordSequence.
   * @effects The Slot at the given position is removed from the chordSequence of the specified progression.
   */
  async deleteSlot(
    { progressionId, position }: { progressionId: ID; position: number },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    if (position < 0 || position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression ${progressionId}.`,
      };
    }

    // Effect: Remove the slot by rebuilding the array in application logic
    const newChordSequence = [...progression.chordSequence];
    newChordSequence.splice(position, 1); // Remove 1 element at 'position'

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: newChordSequence } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * Action: Reorders slots within a progression's chord sequence.
   * @param {ID} progressionId - The ID of the target progression.
   * @param {number} oldPosition - The 0-based current index of the slot to move.
   * @param {number} newPosition - The 0-based target index for the slot.
   * @requires progressionId is a valid ID of an existing progression.
   * @requires oldPosition is a valid index within the progression's chordSequence.
   * @requires newPosition is a valid index within the progression's chordSequence.
   * @effects The Slot at oldPosition is moved to newPosition within the chordSequence of the specified progression.
   */
  async reorderSlots(
    { progressionId, oldPosition, newPosition }: {
      progressionId: ID;
      oldPosition: number;
      newPosition: number;
    },
  ): Promise<Empty | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    const len = progression.chordSequence.length;
    if (
      oldPosition < 0 || oldPosition >= len || newPosition < 0 ||
      newPosition >= len
    ) {
      return {
        error:
          `One or both positions (${oldPosition}, ${newPosition}) are out of bounds for progression ${progressionId}.`,
      };
    }
    if (oldPosition === newPosition) {
      return {}; // No change needed if positions are the same
    }

    // Effect: Reorder slots by rebuilding the array in application logic
    const newChordSequence = [...progression.chordSequence];
    const [movedSlot] = newChordSequence.splice(oldPosition, 1); // Remove from old position
    newChordSequence.splice(newPosition, 0, movedSlot); // Insert at new position

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: newChordSequence } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * Action: Deletes an entire progression.
   * @param {ID} progressionId - The ID of the progression to delete.
   * @requires progressionId is a valid ID of an existing progression.
   * @effects The progression with the given ID is removed from the state.
   */
  async deleteProgression(
    { progressionId }: { progressionId: ID },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.deleteOne({ _id: progressionId });

    if (result.deletedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  /**
   * Action: Renames an existing progression.
   * @param {ID} progressionId - The ID of the progression to rename.
   * @param {string} name - The new name for the progression.
   * @requires progressionId is a valid ID of an existing progression.
   * @effects The name of the progression with the given ID is updated.
   */
  async renameProgression(
    { progressionId, name }: { progressionId: ID; name: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { name } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return {};
  }

  // --- Queries ---

  /**
   * Query: Retrieves a specific progression by its ID.
   * @param {ID} progressionId - The ID of the progression to retrieve.
   * @requires progressionId is a valid ID of an existing progression.
   * @effects Returns the progression document or an error if not found.
   */
  async _getProgression(
    { progressionId }: { progressionId: ID },
  ): Promise<GetProgressionResult> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return { progression };
  }

  /**
   * Query: Lists all existing progressions, returning their IDs and names.
   * @effects Returns a list of all progression identifiers (ID and name).
   */
  async _listProgressions(): Promise<ListProgressionsResult> {
    const progressionIdentifiers = await this.progressions.find({}, {
      projection: { _id: 1, name: 1 }, // Only retrieve _id and name
    }).toArray();
    return {
      progressions: progressionIdentifiers.map((p) => ({ id: p._id, name: p.name })),
    };
  }
}
```
