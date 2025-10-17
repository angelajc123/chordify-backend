---
timestamp: 'Fri Oct 17 2025 00:37:25 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_003725.7de042d5.md]]'
content_id: 107d9ec4ff31b8403e8363666f13b2917b50e66f2042914c1c6e1b6fd10bfd62
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "../../utils/types.ts"; // Adjusted path
import { freshID } from "../../utils/database.ts"; // Adjusted path
import * as Tonal from "npm:tonal"; // Import Tonal for chord processing
// import * as Tone from "npm:tone"; // Tone.js is a client-side library for Web Audio API.
// In a backend concept, we will provide the data for a client to play the audio.

const PREFIX = "PlayBack" + ".";

type Progression = ID;

interface PlaybackSettings {
  _id: Progression;
  instrument: string;
  secondsPerChord: number;
};

/**
 * @concept PlayBack
 * @purpose To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.
 */
export default class PlayBackConcept {
  private settings: Collection<PlaybackSettings>;

  constructor(private readonly db: Db) {
    this.settings = this.db.collection(PREFIX + "settings");
  }

  /**
   * Action: Initializes playback settings for a given progression.
   * @requires progression does not exist in PlaybackSettings.
   * @effects Creates a new PlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).
   */
  async initializeSettings(
    progression: Progression
  ): Promise<PlaybackSettings | {error: string}> {
    const existingSettings = await this.settings.findOne({ _id: progression });
    if (existingSettings) {
      return {
        error: `Playback settings already exist for progression ID ${progression}.`,
      };
    }

    const defaultSettings: PlaybackSettings = {
      _id: progression,
      instrument: "Grand Piano",
      secondsPerChord: 1,
    };

    await this.settings.insertOne(defaultSettings);
    return defaultSettings;
  }

  /**
   * Action: Sets the instrument for a progression's playback.
   * @requires progression exists in PlaybackSettings.
   * @effects Updates the PlaybackSettings for progression with the given instrument.
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
   * @requires progression exists in PlaybackSettings.
   * @effects Updates the PlaybackSettings for progression with the given secondsPerChord.
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
   * @effects Returns the PlaybackSettings for progression.
   */
  async getProgressionSettings(progression: Progression): Promise<PlaybackSettings | { error: string }> {
    const settings = await this.settings.findOne({ _id: progression });
    if (!settings) {
      return {
        error: `Playback settings for progression ID ${progression} not found.`,
      };
    }
    return settings;
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
   * @requires progression exists in PlaybackSettings.
   * @effects Returns an object containing the notes, instrument, and duration for the chord.
   */
  async playChord(
    { progression, chord }: { progression: Progression; chord: string },
  ): Promise<
    { notes: string[]; instrument: string; duration: number } | { error: string }
  > {
    const settings = await this.getProgressionSettings(progression);
    if ("error" in settings) {
      return settings;
    }
    const { instrument, secondsPerChord } = settings;

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
   * @requires progression exists in PlaybackSettings.
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
    const settings = await this.getProgressionSettings(progression);
    if ("error" in settings) {
      return settings;
    }
    const { instrument, secondsPerChord } = settings;

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
