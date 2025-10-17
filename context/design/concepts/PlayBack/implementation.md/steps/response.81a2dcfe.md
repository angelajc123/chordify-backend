---
timestamp: 'Fri Oct 17 2025 00:12:47 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_001247.c7b89f52.md]]'
content_id: 81a2dcfe9f2a42f684762449cc893e17300ab1721453a23f1ce34c199dc1922f
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "../../utils/types.ts"; // Adjusted path
import { freshID } from "../../utils/database.ts"; // Adjusted path
import * as Tonal from "npm:tonal"; // Import Tonal for chord processing
// import * as Tone from "npm:tone"; // Tone.js is a client-side library for Web Audio API.
// In a backend concept, we will provide the data for a client to play the audio.

// Collection prefix to ensure namespace separation
const PREFIX = "PlayBack" + ".";

// Generic types for the concept's external dependencies
type Progression = ID;

// Internal entity types for state
type ProgressionPlaybackSettings = {
  _id: Progression; // The ID of the progression itself is the ID for its settings
  instrument: string;
  secondsPerChord: number;
};

/**
 * @concept PlayBack
 * @purpose To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.
 * @principle A user can set play back settings such as instrument and seconds per chord. The user can play sequences of chords or a single chord.
 */
export default class PlayBackConcept {
  settings: Collection<ProgressionPlaybackSettings>;

  constructor(private readonly db: Db) {
    this.settings = this.db.collection(PREFIX + "settings");
  }

  /**
   * Action: Initializes playback settings for a given progression.
   * @requires progression does not exist in ProgressionPlaybackSettings.
   * @effects Creates a new ProgressionPlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).
   */
  async initializeSettings(
    { progression }: { progression: Progression },
  ): Promise<{ progressionPlaybackSettings: ProgressionPlaybackSettings } | { error: string }> {
    const existingSettings = await this.settings.findOne({ _id: progression });
    if (existingSettings) {
      return {
        error: `Playback settings already exist for progression ID ${progression}.`,
      };
    }

    const defaultSettings: ProgressionPlaybackSettings = {
      _id: progression,
      instrument: "Grand Piano",
      secondsPerChord: 1,
    };

    await this.settings.insertOne(defaultSettings);
    return { progressionPlaybackSettings: defaultSettings };
  }

  /**
   * Action: Sets the instrument for a progression's playback.
   * @requires progression exists in ProgressionPlaybackSettings.
   * @effects Updates the ProgressionPlaybackSettings for progression with the given instrument.
   */
  async setInstrument(
    { progression, instrument }: { progression: Progression; instrument: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.settings.updateOne(
      { _id: progression },
      { $set: { instrument } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Playback settings for progression ID ${progression} not found.`,
      };
    }
    return {};
  }

  /**
   * Action: Sets the duration (in seconds) for each chord in a progression's playback.
   * @requires progression exists in ProgressionPlaybackSettings.
   * @effects Updates the ProgressionPlaybackSettings for progression with the given secondsPerChord.
   */
  async setSecondsPerChord(
    { progression, secondsPerChord }: {
      progression: Progression;
      secondsPerChord: number;
    },
  ): Promise<Empty | { error: string }> {
    if (secondsPerChord <= 0) {
      return { error: "secondsPerChord must be a positive number." };
    }

    const result = await this.settings.updateOne(
      { _id: progression },
      { $set: { secondsPerChord } },
    );

    if (result.matchedCount === 0) {
      return {
        error: `Playback settings for progression ID ${progression} not found.`,
      };
    }
    return {};
  }

  /**
   * Query: Retrieves the playback settings for a specific progression.
   * @effects Returns the ProgressionPlaybackSettings for progression.
   */
  async getProgressionSettings(
    { progression }: { progression: Progression },
  ): Promise<{ progressionSettings: ProgressionPlaybackSettings } | { error: string }> {
    const settings = await this.settings.findOne({ _id: progression });
    if (!settings) {
      return {
        error: `Playback settings for progression ID ${progression} not found.`,
      };
    }
    return { progressionSettings: settings };
  }

  /**
   * Internal Helper: Converts a chord string into an array of notes using Tonal.js.
   * @param chord The chord string (e.g., "Cmaj7", "Am").
   * @returns An array of note names (e.g., ["C4", "E4", "G4", "B4"]) or an empty array if invalid.
   */
  private _getNotesFromChord(chord: string): string[] {
    const chordData = Tonal.Chord.get(chord);
    // Tonal.js returns `notes` as an array of pitches (e.g., ["C4", "E4", "G4"])
    return chordData.notes;
  }

  /**
   * Action: Provides data to play a single chord using the progression's settings.
   * This action does not directly play audio but returns the necessary musical data
   * and settings for a client-side audio engine (e.g., Tone.js) to perform playback.
   * @requires progression exists in ProgressionPlaybackSettings.
   * @effects Returns an object containing the notes, instrument, and duration for the chord.
   */
  async playChord(
    { progression, chord }: { progression: Progression; chord: string },
  ): Promise<
    | { notes: string[]; instrument: string; duration: number }
    | { error: string }
  > {
    const settingsResult = await this.getProgressionSettings({ progression });
    if ("error" in settingsResult) {
      return settingsResult;
    }
    const { instrument, secondsPerChord } = settingsResult.progressionSettings;

    const notes = this._getNotesFromChord(chord);
    if (notes.length === 0) {
      return { error: `Invalid chord specified: '${chord}'.` };
    }

    // In a real application, a client would receive this data and use Tone.js to play it.
    // Example client-side usage:
    // const synth = new Tone.Synth().toDestination();
    // synth.triggerAttackRelease(notes, secondsPerChord);
    return { notes, instrument, duration: secondsPerChord };
  }

  /**
   * Action: Provides data to play a sequence of chords (a progression) using the progression's settings.
   * This action does not directly play audio but returns the necessary musical data
   * and settings for a client-side audio engine (e.g., Tone.js) to perform playback.
   * @requires progression exists in ProgressionPlaybackSettings.
   * @effects Returns an array of objects, each representing a chord or rest with its notes and duration, along with the instrument.
   */
  async playProgression(
    { progression, chordSequence }: {
      progression: Progression;
      chordSequence: (string | null)[];
    },
  ): Promise<
    | {
      sequence: ({ notes: string[]; duration: number } | {
        rest: true;
        duration: number;
      })[];
      instrument: string;
    }
    | { error: string }
  > {
    const settingsResult = await this.getProgressionSettings({ progression });
    if ("error" in settingsResult) {
      return settingsResult;
    }
    const { instrument, secondsPerChord } = settingsResult.progressionSettings;

    const sequenceData: (
      | { notes: string[]; duration: number }
      | { rest: true; duration: number }
    )[] = [];

    for (const chord of chordSequence) {
      if (chord === null) {
        sequenceData.push({ rest: true, duration: secondsPerChord });
      } else {
        const notes = this._getNotesFromChord(chord);
        if (notes.length === 0) {
          return { error: `Invalid chord specified in sequence: '${chord}'.` };
        }
        sequenceData.push({ notes, duration: secondsPerChord });
      }
    }

    // In a real application, a client would receive this data and use Tone.js to play it.
    // Example client-side usage (simplified):
    // const synth = new Tone.Synth().toDestination();
    // let currentTime = Tone.now();
    // for (const item of sequenceData) {
    //   if ('notes' in item) {
    //     synth.triggerAttackRelease(item.notes, item.duration, currentTime);
    //   }
    //   currentTime += item.duration;
    // }
    return { sequence: sequenceData, instrument };
  }
}
```
