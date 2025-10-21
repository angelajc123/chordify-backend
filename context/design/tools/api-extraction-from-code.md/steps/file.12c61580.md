---
timestamp: 'Tue Oct 21 2025 14:53:38 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_145338.433bff10.md]]'
content_id: 12c61580b6d201d13fdfa5938753298c0e82b7d977b0cf630262d2410f5a6df4
---

# file: src/concepts/ProgressionBuilder/ProgressionBuilderConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Collection prefix
const PREFIX = "ProgressionBuilder" + ".";

// Generic type for concept's external dependencies
type Progression = ID;

/**
 * State: a single slot in a chord sequence, holding a chord or null.
 */
interface Slot {
  chord: string | null;
}

/**
 * State: a set of progressions with an id, name, and chord sequence.
 */
interface ProgressionDoc {
  _id: Progression;
  name: string;
  chordSequence: Slot[];
}

/**
 * @concept ProgressionBuilder
 * @purpose To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
 */
export default class ProgressionBuilderConcept {
  progressions: Collection<ProgressionDoc>;

  constructor(private readonly db: Db) {
    this.progressions = this.db.collection(PREFIX + "progressions");
  }

  private async validateProgression(progressionId: Progression)
  : Promise<{ progression: ProgressionDoc } | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return { progression };
  }

  private async validateProgressionAndPosition(
    progressionId: Progression,
    position: number,
  ): Promise<{ progression: ProgressionDoc } | { error: string }> {
    const validation = await this.validateProgression(progressionId);
    if ("error" in validation) {
      return validation;
    }

    const { progression } = validation;
    if (position < 0 || position >= progression.chordSequence.length) {
      return { error: `Invalid position: ${position}. Index out of bounds.` };
    }
    
    return { progression };
  }

  /**
   * Action: Creates a new, empty progression with the given name.
   * @effects A new progression is created with a unique ID, the given name, and an empty chord sequence.
   */
  async createProgression(
    { name }: { name: string },
  ): Promise<{ progression: ProgressionDoc } | { error: string }> {
    const progressionId = freshID() as Progression;
    const progression = {
      _id: progressionId,
      name,
      chordSequence: [],
    }
    const result = await this.progressions.insertOne(progression);

    if (!result.acknowledged) {
      return { error: "Failed to create progression." };
    }

    return { progression: progression };
  }

  /**
   * Action: Appends a null Slot to the chordSequence of the specified progression.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects A new slot with a null chord is appended to the progression's chord sequence.
   */
  async addSlot(
    { progressionId }: { progressionId: Progression },
  ): Promise<Empty | { error: string }> {
    const validation = await this.validateProgression(progressionId);
    if ("error" in validation) {
      return validation;
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $push: { chordSequence: { chord: null } } },
    );

    if (result.matchedCount === 0) {
      return { error: `Failed to add slot to progression with ID ${progressionId}.` };
    }

    return {};
  }

  /**
   * Action: Sets the chord of the Slot at the given position in a progression's chordSequence.
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
    const validation = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in validation) {
      return validation;
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chordSequence.${position}.chord`]: chord } },
    );

    if (result.matchedCount === 0) {
      return { error: `Failed to set chord for progression ${progressionId}.` };
    }

    return {};
  }

  /**
   * Action: Sets the chord of the Slot at the given position to null.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `position` is a valid index within the `chordSequence` of the progression.
   * @effects The `chord` field of the slot at `position` in `chordSequence` is set to `null`.
   */
  async deleteChord(
    { progressionId, position }: { progressionId: Progression; position: number },
  ): Promise<Empty | { error: string }> {
    const validation = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in validation) {
      return validation;
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
   * @requires `progressionId` is a valid ID of an existing progression.
   * @requires `position` is a valid index within the `chordSequence` of the progression.
   * @effects The slot at `position` is removed from the progression's chord sequence.
   */
  async deleteSlot(
    { progressionId, position }: { progressionId: Progression; position: number },
  ): Promise<Empty | { error: string }> {
    const validation = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in validation) {
      return validation;
    }

    const { progression } = validation;
    const newSequence = [...progression.chordSequence];
    newSequence.splice(position, 1);
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chordSequence: newSequence } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to delete slot for progression ${progressionId}.`,
      };
    }

    return {};
  }

  /**
   * Action: Reorders slots within a progression's chordSequence.
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
    const validation = await this.validateProgressionAndPosition(progressionId, oldPosition);
    if ("error" in validation) {
      return validation;
    }
    const validation2 = await this.validateProgressionAndPosition(progressionId, newPosition);
    if ("error" in validation2) {
      return validation2;
    }

    const { progression } = validation;
    const newSequence = [...progression.chordSequence];
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
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects The progression with the given ID is removed from the state.
   */
  async deleteProgression(
    { progressionId }: { progressionId: Progression },
  ): Promise<Empty | { error: string }> {
    const validation = await this.validateProgression(progressionId);
    if ("error" in validation) {
      return validation;
    }
    
    const result = await this.progressions.deleteOne({ _id: progressionId });

    if (result.deletedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    return {};
  }

  /**
   * Action: Renames an existing progression.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects The `name` field of the progression with ID `progressionId` is updated to `name`.
   */
  async renameProgression(
    { progressionId, name }: { progressionId: Progression; name: string },
  ): Promise<Empty | { error: string }> {
    const validation = await this.validateProgression(progressionId);
    if ("error" in validation) {
      return validation;
    }
    
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
   * Query: Retrieves a specific progression by its ID.
   * @requires `progressionId` is a valid ID of an existing progression.
   * @effects Returns the progression with id `progressionId`.
   */
  async _getProgression(
    { progressionId }: { progressionId: Progression },
  ): Promise<{ progression: ProgressionDoc } | { error: string }> {
    return this.validateProgression(progressionId);
  }

  /**
   * Query: Returns a list of all progression identifiers and their names.
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
