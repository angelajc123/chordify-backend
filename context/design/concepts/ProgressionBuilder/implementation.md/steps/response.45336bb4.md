---
timestamp: 'Thu Oct 16 2025 16:16:23 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_161623.ff4cc2ac.md]]'
content_id: 45336bb4b23c26cc56c24828a121f81cde0bec920b1829c73d84e465935b8b2c
---

# response:

Here's the TypeScript implementation for the `ProgressionBuilder` concept, following the provided concept design principles and implementation guidelines:

```typescript
// file: src/progressionBuilder/ProgressionBuilderConcept.ts

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * @concept ProgressionBuilder
 * @purpose enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
 */
export default class ProgressionBuilderConcept {
  /**
   * @principle A user creates a new progression, which starts as an empty sequence, and names it.
   * They can add new slots to extend the sequence, and set chords to slots, remove chords from slots,
   * remove slots, or reorder slots.
   */

  // Declare collection prefix, use concept name
  private static readonly PREFIX = "ProgressionBuilder" + ".";

  /**
   * A concept-specific ID type for progressions, aliased from the generic ID.
   * This helps in maintaining type clarity while adhering to the generic ID type.
   */
  type ProgressionId = ID;

  /**
   * @state
   * A `Slot` represents a position in a chord sequence, holding a chord or being empty.
   */
  interface Slot {
    chord: string | null;
  }

  /**
   * @state
   * A `Progression` document, representing a chord progression built by the user.
   * It includes an ID, a name, and a sequence of chord slots.
   *
   * A set of `Progressions` with
   *   An `id` of type `ID` (branded string)
   *   A `name` of type `String`
   *   A `chordSequence` of type sequence of `Slots`
   */
  interface Progression {
    _id: ProgressionId;
    name: string;
    chordSequence: Slot[];
  }

  // MongoDB collection for progressions
  private progressions: Collection<Progression>;

  /**
   * Constructs a new ProgressionBuilderConcept instance.
   * @param db The MongoDB database instance to use for storing progression data.
   */
  constructor(private readonly db: Db) {
    this.progressions = this.db.collection(
      ProgressionBuilderConcept.PREFIX + "progressions",
    );
  }

  /**
   * @action createProgression
   * @requires true
   * @effects Creates a new, empty progression with the given name, and unique id, and returns that id.
   * @param {Object} args - The arguments for the action.
   * @param {string} args.name - The name of the new progression.
   * @returns {{progressionId: ProgressionId}} An object containing the ID of the newly created progression, or an error.
   */
  async createProgression(
    { name }: { name: string },
  ): Promise<{ progressionId: ProgressionId } | { error: string }> {
    const newProgression: Progression = {
      _id: freshID(),
      name,
      chordSequence: [],
    };
    try {
      await this.progressions.insertOne(newProgression);
      return { progressionId: newProgression._id };
    } catch (e) {
      console.error("Error creating progression:", e);
      return { error: "Failed to create progression." };
    }
  }

  /**
   * @action addSlot
   * @requires `progressionId` is a valid id of a progression.
   * @effects appends a null `Slot` to `chordSequence` of the progression with id `progressionId`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to add a slot to.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async addSlot(
    { progressionId }: { progressionId: ProgressionId },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $push: { chordSequence: { chord: null } } },
    );
    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return {};
  }

  /**
   * @action setChord
   * @requires `progressionId` is a valid id of a progression,
   * `position` is a valid index of `chordSequence` of the progression with id `progressionId`,
   * `chord` is a chord in standard music notation.
   * @effects sets the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`’s `chord` to `chord`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The zero-based index of the slot to set the chord.
   * @param {string} args.chord - The chord string to set.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async setChord(
    { progressionId, position, chord }: {
      progressionId: ProgressionId;
      position: number;
      chord: string;
    },
  ): Promise<Empty | { error: string }> {
    if (position < 0) {
      return { error: "Position cannot be negative." };
    }

    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    if (position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression with ${progression.chordSequence.length} slots.`,
      };
    }

    // Update specific element in array
    const updateKey = `chordSequence.${position}.chord`;
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [updateKey]: chord } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` }; // Should not happen if previous findOne was successful
    }
    return {};
  }

  /**
   * @action deleteChord
   * @requires `progressionId` is a valid id of a progression,
   * `position` is a valid index of `chordSequence` of the progression with id `progressionId`.
   * @effects sets `chord` at the `Slot` at `position` of `chordSequence` of the progression with id `progressionId` to `null`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The zero-based index of the slot to clear the chord.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async deleteChord(
    { progressionId, position }: {
      progressionId: ProgressionId;
      position: number;
    },
  ): Promise<Empty | { error: string }> {
    if (position < 0) {
      return { error: "Position cannot be negative." };
    }

    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    if (position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression with ${progression.chordSequence.length} slots.`,
      };
    }

    // Set chord to null
    const updateKey = `chordSequence.${position}.chord`;
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [updateKey]: null } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return {};
  }

  /**
   * @action deleteSlot
   * @requires `progressionId` is a valid id of a progression,
   * `position` is a valid index of `chordSequence` of the progression with id `progressionId`.
   * @effects removes the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to modify.
   * @param {number} args.position - The zero-based index of the slot to remove.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async deleteSlot(
    { progressionId, position }: {
      progressionId: ProgressionId;
      position: number;
    },
  ): Promise<Empty | { error: string }> {
    if (position < 0) {
      return { error: "Position cannot be negative." };
    }

    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    if (position >= progression.chordSequence.length) {
      return {
        error:
          `Position ${position} is out of bounds for progression with ${progression.chordSequence.length} slots.`,
      };
    }

    // Use $unset to remove the element, then $pull to clean up nulls.
    // This is a common pattern for removing array elements by index in MongoDB.
    // The alternative is to read, modify, and write the array, which is less atomic.
    const unsetKey = `chordSequence.${position}`;
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $unset: { [unsetKey]: 1 } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }

    // Now pull the null/missing elements to re-index the array
    await this.progressions.updateOne(
      { _id: progressionId },
      { $pull: { chordSequence: null } },
    );

    return {};
  }

  /**
   * @action reorderSlots
   * @requires `progressionId` is a valid id of a progression,
   * `oldPosition` is a valid index of `chordSequence`,
   * `newPosition` is a valid index of `chordSequence`.
   * @effects moves the `Slot` at `oldPosition` of `chordSequence` of the progression with id `progressionId` to `newPosition`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to modify.
   * @param {number} args.oldPosition - The original zero-based index of the slot.
   * @param {number} args.newPosition - The target zero-based index for the slot.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async reorderSlots(
    { progressionId, oldPosition, newPosition }: {
      progressionId: ProgressionId;
      oldPosition: number;
      newPosition: number;
    },
  ): Promise<Empty | { error: string }> {
    if (oldPosition < 0 || newPosition < 0) {
      return { error: "Positions cannot be negative." };
    }

    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    if (
      oldPosition >= progression.chordSequence.length ||
      newPosition >= progression.chordSequence.length
    ) {
      return {
        error:
          `One or both positions (${oldPosition}, ${newPosition}) are out of bounds ` +
          `for progression with ${progression.chordSequence.length} slots.`,
      };
    }

    const { chordSequence } = progression;
    const [movedSlot] = chordSequence.splice(oldPosition, 1);
    chordSequence.splice(newPosition, 0, movedSlot);

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: chordSequence } },
    );

    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return {};
  }

  /**
   * @action deleteProgression
   * @requires `progressionId` is a valid id of a progression.
   * @effects removes the progression with id `progressionId`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to delete.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async deleteProgression(
    { progressionId }: { progressionId: ProgressionId },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.deleteOne({ _id: progressionId });
    if (result.deletedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return {};
  }

  /**
   * @action renameProgression
   * @requires `progressionId` is a valid id of a progression.
   * @effects sets the name of the progression with id `progressionId` to `name`.
   * @param {Object} args - The arguments for the action.
   * @param {ProgressionId} args.progressionId - The ID of the progression to rename.
   * @param {string} args.name - The new name for the progression.
   * @returns {Empty} An empty object on success, or an error object.
   */
  async renameProgression(
    { progressionId, name }: { progressionId: ProgressionId; name: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { name: name } },
    );
    if (result.matchedCount === 0) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return {};
  }

  /**
   * @query getProgression
   * @requires `progressionId` is a valid id of a progression.
   * @effects returns the progression with id `progressionId`.
   * @param {Object} args - The arguments for the query.
   * @param {ProgressionId} args.progressionId - The ID of the progression to retrieve.
   * @returns {{progression: Progression}} An object containing the found progression, or an error.
   */
  async _getProgression(
    { progressionId }: { progressionId: ProgressionId },
  ): Promise<{ progression: Progression } | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID '${progressionId}' not found.` };
    }
    return { progression };
  }

  /**
   * @query listProgressions
   * @requires true
   * @effects returns a list of all progression names and ids.
   * @param {Empty} args - An empty object as this query takes no arguments.
   * @returns {{progressionIdentifiers: Array<{id: ProgressionId, name: string}>}} An object containing a list of progression identifiers.
   */
  async _listProgressions(
    _: Empty = {},
  ): Promise<{ progressionIdentifiers: Array<{ id: ProgressionId; name: string }> } | {
    error: string;
  }> {
    try {
      const identifiers = await this.progressions.find({}, {
        projection: { _id: 1, name: 1 },
      }).toArray();
      // Map _id to id for consistency with the spec's return type
      const formattedIdentifiers = identifiers.map((p) => ({ id: p._id, name: p.name }));
      return { progressionIdentifiers: formattedIdentifiers };
    } catch (e) {
      console.error("Error listing progressions:", e);
      return { error: "Failed to list progressions." };
    }
  }
}
```
