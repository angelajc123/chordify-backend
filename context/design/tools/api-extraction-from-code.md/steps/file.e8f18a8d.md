---
timestamp: 'Sat Oct 25 2025 15:49:14 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251025_154914.08c92e9f.md]]'
content_id: e8f18a8dea11448079ba30fbecc58c3722a98640a511728b2aec11169c3c20e5
---

# file: src/concepts/PlayBack/PlayBack.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "../../utils/types.ts";
import * as Tonal from "npm:tonal";
import { INSTRUMENTS, MIN_SECONDS_PER_CHORD, MAX_SECONDS_PER_CHORD } from "@shared/constants.ts";

const PREFIX = "PlayBack" + ".";

type Progression = ID;

interface PlaybackSettings {
  _id: Progression;
  instrument: string;
  secondsPerChord: number;
};

export default class PlayBackConcept {
  private settings: Collection<PlaybackSettings>;

  constructor(private readonly db: Db) {
    this.settings = this.db.collection(PREFIX + "settings");
  }

  async initializeSettings(
    { progressionId }: { progressionId: Progression }
  ): Promise<{ settings: PlaybackSettings } | {error: string}> {
    const existingSettings = await this.settings.findOne({ _id: progressionId });
    if (existingSettings) {
      return {
        error: `Playback settings already exist for progression ID ${progressionId}.`,
      };
    }

    const defaultSettings: PlaybackSettings = {
      _id: progressionId,
      instrument: "Piano",
      secondsPerChord: 1,
    };

    await this.settings.insertOne(defaultSettings);
    return { settings: defaultSettings };
  }

  async setInstrument(
    { progressionId, instrument }: {
      progressionId: Progression;
      instrument: string;
    },
  ): Promise<Empty | { error: string }> {
    if (!INSTRUMENTS.includes(instrument)) {
      return { error: `Instrument must be one of ${INSTRUMENTS.join(", ")}.` };
    }

    const result = await this.settings.updateOne(
      { _id: progressionId },
      { $set: { instrument } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Playback settings for progression ID ${progressionId} not found.`,
      };
    }
    return {};
  }

  async setSecondsPerChord(
    { progressionId, secondsPerChord }: {
      progressionId: Progression;
      secondsPerChord: number;
    },
  ): Promise<Empty | { error: string }> {
    if (secondsPerChord < MIN_SECONDS_PER_CHORD || secondsPerChord > MAX_SECONDS_PER_CHORD) {
      return { error: `secondsPerChord must be between ${MIN_SECONDS_PER_CHORD} and ${MAX_SECONDS_PER_CHORD}.` };
    }

    const result = await this.settings.updateOne(
      { _id: progressionId },
      { $set: { secondsPerChord } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Playback settings for progression ID ${progressionId} not found.`,
      };
    }
    return {};
  }

  async getPlayBackSettings(
    { progressionId }: { progressionId: Progression }
  ): Promise<{ settings: PlaybackSettings } | { error: string }> {
    const settings = await this.settings.findOne({ _id: progressionId });
    if (!settings) {
      return {
        error: `Playback settings for progression ID ${progressionId} not found.`,
      };
    }
    return { settings: settings };
  }

  async getChordNotes(
    { chord }: { chord: string }
  ): Promise<{ notes: string[] } | { error: string }> {
    const notes = Tonal.Chord.get(chord).notes;
    if (notes.length === 0) {
      return { error: `Invalid chord specified: '${chord}'.` };
    }
    return { notes: notes };
  }

  async getProgressionNotes(
    { progression }: { progression: string[] }
  ): Promise<{ notes: string[][] } | { error: string }> {
    const notes: string[][] = [];
    for (const chord of progression) {
      const response = await this.getChordNotes({ chord });
      if ("error" in response) {
        return { error: response.error };
      }
      notes.push(response.notes);
    }
    return { notes: notes };
  }
}
```
