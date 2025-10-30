---
timestamp: 'Thu Oct 30 2025 16:17:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251030_161704.7080af51.md]]'
content_id: a9fb65e521e673a4dddf5b66fc25e0812461040f0456717a1366000518476921
---

# file: src/concepts/ProgressionBuilder/ProgressionBuilderConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { isValidChord } from "@shared/constants.ts";

const PREFIX = "ProgressionBuilder" + ".";

type ProgressionID = ID;

interface Slot {
  chord: string | null;
}

interface Progression {
  _id: ProgressionID;
  name: string;
  chords: Slot[];
}

export default class ProgressionBuilderConcept {
  private progressions: Collection<Progression>;

  constructor(private readonly db: Db) {
    this.progressions = this.db.collection(PREFIX + "progressions");
  }

  private async validateProgressionAndPosition(
    progressionId: ProgressionID,
    position: number,
  ): Promise<{ progression: Progression } | { error: string }> {
    const response = await this.getProgression({ progressionId });
    if ("error" in response) {
      return response;
    }

    const progression = response.progression;
    if (position < 0 || position >= progression.chords.length) {
      return { error: `Invalid position: ${position}. Index out of bounds.` };
    }
    
    return { progression };
  }

  async createProgression(
    { name }: { name: string },
  ): Promise<{ progression: Progression } | { error: string }> {
    const progression = {
      _id: freshID() as ProgressionID,
      name: name,
      chords: [],
    }

    await this.progressions.insertOne(progression);
    return { progression: progression };
  }

  async addSlot(
    { progressionId }: { progressionId: ProgressionID },
  ): Promise<Empty | { error: string }> {
    const response = await this.getProgression({ progressionId });
    if ("error" in response) {
      return response;
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $push: { chords: { chord: null } } },
    );

    if (result.matchedCount === 0) {
      return { error: `Failed to add slot to progression with ID ${progressionId}.` };
    }

    return {};
  }

  async setChord(
    { progressionId, position, chord }: {
      progressionId: ProgressionID;
      position: number;
      chord: string;
    },
  ): Promise<Empty | { error: string }> {
    const response = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in response) {
      return response;
    }

    const { progression } = response;
    if (!isValidChord(chord)) {
      return { error: `Invalid chord: ${chord}.` };
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chords.${position}.chord`]: chord } },
    );

    if (result.matchedCount === 0) {
      return { error: `Failed to set chord for progression ${progressionId}.` };
    }

    return {};
  }

  async deleteChord(
    { progressionId, position }: { progressionId: ProgressionID; position: number },
  ): Promise<Empty | { error: string }> {
    const response = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in response) {
      return response;
    }

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { [`chords.${position}.chord`]: null } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to delete chord for progression ${progressionId}.`,
      };
    }

    return {};
  }

  async deleteSlot(
    { progressionId, position }: { progressionId: ProgressionID; position: number },
  ): Promise<Empty | { error: string }> {
    const response = await this.validateProgressionAndPosition(progressionId, position);
    if ("error" in response) {
      return response;
    }

    const { progression } = response;
    const newSequence = [...progression.chords];
    newSequence.splice(position, 1);
    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chords: newSequence } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to delete slot for progression ${progressionId}.`,
      };
    }

    return {};
  }
  
  async reorderSlots(
    { progressionId, oldPosition, newPosition }: {
      progressionId: ProgressionID;
      oldPosition: number;
      newPosition: number;
    },
  ): Promise<Empty | { error: string }> {
    const response = await this.validateProgressionAndPosition(progressionId, oldPosition);
    if ("error" in response) {
      return response;
    }
    const response2 = await this.validateProgressionAndPosition(progressionId, newPosition);
    if ("error" in response2) {
      return response2;
    }

    const { progression } = response;
    const newSequence = [...progression.chords];
    const [movedItem] = newSequence.splice(oldPosition, 1);
    newSequence.splice(newPosition, 0, movedItem);

    const result = await this.progressions.updateOne(
      { _id: progressionId },
      { $set: { chords: newSequence } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Failed to reorder slots for progression ${progressionId}.`,
      };
    }

    return {};
  }

  async deleteProgression(
    { progressionId }: { progressionId: ProgressionID },
  ): Promise<Empty | { error: string }> {
    const response = await this.getProgression({ progressionId });
    if ("error" in response) {
      return response;
    }
    
    const result = await this.progressions.deleteOne({ _id: progressionId });

    if (result.deletedCount === 0) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }

    return {};
  }

  async renameProgression(
    { progressionId, name }: { progressionId: ProgressionID; name: string },
  ): Promise<Empty | { error: string }> {
    const response = await this.getProgression({ progressionId });
    if ("error" in response) {
      return response;
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

  async getProgression(
    { progressionId }: { progressionId: ProgressionID },
  ): Promise<{ progression: Progression } | { error: string }> {
    const progression = await this.progressions.findOne({ _id: progressionId });
    if (!progression) {
      return { error: `Progression with ID ${progressionId} not found.` };
    }
    return { progression };
  }

  async listProgressions(): Promise<
    { progressionIdentifiers: Array<{ id: ProgressionID; name: string }> }
  > {
    const identifiers = await this.progressions.find({}, {
      projection: { _id: 1, name: 1 },
      sort: { _id: -1 },
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
