---
timestamp: 'Fri Oct 17 2025 00:10:57 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_001057.e57df89a.md]]'
content_id: 3a888e6087593dcdf1ebf6a73961ff77e634d425aba274f957120a5fbc62b885
---

# response:

To enhance the chord parsing logic in the `PlayBackConcept` using `Tonal.js`, we'll integrate the `@tonaljs/tonal`, `@tonaljs/chord`, and `@tonaljs/note` packages. This will make the `_parseChordString` method cleaner, more accurate, and capable of handling a wider range of musical notation.

Here's the updated `PlayBackConcept` implementation:

```typescript
import { Collection, Db } from "npm:mongodb";
import * as Tone from "npm:tone";
import * as Tonal from "npm:@tonaljs/tonal"; // Main Tonal.js package
import { Note } from "npm:@tonaljs/note"; // For specific note parsing
import { Chord } from "npm:@tonaljs/chord"; // For specific chord parsing
import { Empty, ID } from "../../utils/types.ts"; // Adjust path as necessary
import { freshID } from "../../utils/database.ts"; // Adjust path as necessary

const PREFIX = "PlayBack" + ".";
type Progression = ID;

interface PlayBackSettings {
  _id: Progression;
  instrument: string;
  secondsPerChord: number;
}

/**
 * @concept PlayBack
 * @purpose To allow users to listen to sequences of musical units easily, enabling rapid feedback and iteration during composition.
 */
export default class PlayBackConcept {
  progressionPlaybackSettings: Collection<PlayBackSettings>;

  private polySynth: Tone.PolySynth;
  private currentTransportSequence: Tone.Sequence | null = null;
  private isToneStarted: boolean = false; // To track Tone.js AudioContext state

  constructor(private readonly db: Db) {
    this.progressionPlaybackSettings = this.db.collection(
      PREFIX + "progressionPlaybackSettings",
    );

    this.polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    Tone.Transport.bpm.value = 120;
  }

  private async _startTone(): Promise<void> {
    if (!this.isToneStarted) {
      try {
        await Tone.start();
        console.log("Tone.js audio context started.");
        this.isToneStarted = true;
      } catch (e) {
        console.error("Failed to start Tone.js audio context:", e);
      }
    }
  }

  /**
   * Helper function to parse a chord string into an array of Tone.js note strings using Tonal.js.
   * This handles single notes (e.g., "C4", "Eb") and chord names (e.g., "Cmaj", "Dm7").
   *
   * @param musicalUnit The string representing a musical unit (note, chord, or "null")
   * @returns An array of note strings (e.g., ["C4", "E4", "G4"]) or an empty array for rests/invalid inputs.
   */
  private _parseChordString(musicalUnit: string | null): string[] {
    if (!musicalUnit || musicalUnit.toLowerCase() === "null") return [];

    const baseOctave = 4; // Default octave if not specified

    // 1. First, try to parse as a single note (e.g., "C4", "Eb", "F#5")
    const tonalNote = Note.get(musicalUnit);
    if (!tonalNote.empty && tonalNote.name) {
      // If an octave was explicitly given (e.g., "C4"), use it. Otherwise, append the baseOctave.
      const noteWithOctave = tonalNote.octave !== undefined
        ? tonalNote.name + tonalNote.octave
        : tonalNote.name + baseOctave;
      try {
        // Verify if Tone.js can actually play this note. Tone.Midi will throw for invalid notes.
        Tone.Midi(noteWithOctave).toNote();
        return [noteWithOctave];
      } catch (e) {
        console.warn(`Tone.js cannot interpret single note: ${noteWithOctave} from input "${musicalUnit}"`, e);
        return [];
      }
    }

    // 2. If not a single note, try to parse as a chord (e.g., "Cmaj", "Dm7").
    // Tonal.Chord.get parses the chord structure (e.g., root 'C', quality 'major').
    const chordType = Chord.get(musicalUnit);

    if (chordType.empty || !chordType.name) {
      console.warn(`Unrecognized musical unit format: ${musicalUnit}`);
      return [];
    }

    // Determine the root note with an octave.
    // We assume the root is at `baseOctave` by default.
    // If the input string explicitly contains an octave for the root (e.g., "C4maj7"),
    // we extract and use that.
    const potentialRoot = chordType.tonic || chordType.root; // 'tonic' is preferred if available
    let rootWithOctave = `${potentialRoot}${baseOctave}`;

    // Attempt to detect an explicit octave in the original musicalUnit string for the root.
    // This regex looks for the root name (e.g., 'C') followed by an optional octave number.
    if (potentialRoot) {
      const escapedRoot = potentialRoot.replace(/#/g, '\\#').replace(/b/g, '\\b');
      const rootOctaveMatch = musicalUnit.match(new RegExp(`^${escapedRoot}(\\d+)`, 'i'));
      if (rootOctaveMatch && rootOctaveMatch[1]) {
        rootWithOctave = `${potentialRoot}${rootOctaveMatch[1]}`;
      }
    }

    // Use Tonal.Chord.getChord(type, rootNoteWithOctave) to get notes with proper octaves.
    const tonalChord = Chord.getChord(chordType.name, rootWithOctave);

    if (!tonalChord.notes || tonalChord.notes.length === 0) {
      console.warn(`Tonal.js parsed chord "${musicalUnit}" but produced no valid notes with octaves.`);
      return [];
    }

    // Filter and validate notes to ensure Tone.js can interpret them.
    const playableNotes: string[] = tonalChord.notes.filter(note => {
      try {
        Tone.Midi(note).toNote(); // This will throw if the note string is invalid for Tone.js
        return true;
      } catch (e) {
        console.warn(`Tone.js cannot interpret chord note: ${note} from chord input "${musicalUnit}"`, e);
        return false;
      }
    });

    return playableNotes;
  }

  /**
   * Action: Initializes playback settings for a given musical progression.
   * @requires `progression` does not already have settings in the database.
   * @effects Creates new `ProgressionPlaybackSettings` with default instrument ("Grand Piano")
   *          and `secondsPerChord` (1), returning the new settings' ID.
   */
  async initializeSettings(
    { progression }: { progression: Progression },
  ): Promise<{ progressionPlaybackSettings: Progression } | { error: string }> {
    const existingSettings = await this.progressionPlaybackSettings.findOne({
      _id: progression,
    });
    if (existingSettings) {
      return { error: `Settings for progression ${progression} already exist.` };
    }

    const defaultSettings: PlayBackSettings = {
      _id: progression,
      instrument: "Grand Piano",
      secondsPerChord: 1,
    };

    await this.progressionPlaybackSettings.insertOne(defaultSettings);
    return { progressionPlaybackSettings: progression };
  }

  /**
   * Action: Sets the instrument for a specific musical progression's playback.
   * @requires `progression` must exist in `ProgressionPlaybackSettings`.
   * @effects Updates the `instrument` property for the specified `progression` in the database.
   *          (Note: Actual Tone.js instrument change would be more complex and is not
   *          directly handled by this `PolySynth` without further integration).
   */
  async setInstrument(
    { progression, instrument }: { progression: Progression; instrument: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.progressionPlaybackSettings.updateOne(
      { _id: progression },
      { $set: { instrument: instrument } },
    );

    if (result.matchedCount === 0) {
      return { error: `Settings for progression ${progression} not found.` };
    }
    return {};
  }

  /**
   * Action: Sets the duration (in seconds) for each chord in a progression's playback.
   * @requires `progression` must exist in `ProgressionPlaybackSettings`.
   * @effects Updates the `secondsPerChord` property for the specified `progression` in the database.
   */
  async setSecondsPerChord(
    { progression, secondsPerChord }: { progression: Progression; secondsPerChord: number },
  ): Promise<Empty | { error: string }> {
    if (secondsPerChord <= 0) {
      return { error: "secondsPerChord must be a positive number." };
    }

    const result = await this.progressionPlaybackSettings.updateOne(
      { _id: progression },
      { $set: { secondsPerChord: secondsPerChord } },
    );

    if (result.matchedCount === 0) {
      return { error: `Settings for progression ${progression} not found.` };
    }
    return {};
  }

  /**
   * Query: Retrieves the playback settings for a specific musical progression.
   * @effects Returns the `ProgressionPlaybackSettings` document for the `progression` if found, otherwise `null`.
   */
  async _getProgressionSettings(
    { progression }: { progression: Progression },
  ): Promise<PlayBackSettings | null> {
    return await this.progressionPlaybackSettings.findOne({ _id: progression });
  }

  /**
   * Action: Plays a single chord using the settings for the specified progression.
   * @requires `progression` must exist in `ProgressionPlaybackSettings`.
   * @effects Plays the given `chord` string (e.g., "Cmaj", "D4") using the configured instrument
   *          (via the generic `PolySynth`) for a duration equal to `secondsPerChord`.
   *          Starts Tone.js audio context if not already started.
   */
  async playChord(
    { progression, chord }: { progression: Progression; chord: string },
  ): Promise<Empty | { error: string }> {
    await this._startTone();

    const settings = await this.progressionPlaybackSettings.findOne({
      _id: progression,
    });
    if (!settings) {
      return { error: `Settings for progression ${progression} not found.` };
    }

    const notes = this._parseChordString(chord);
    if (notes.length === 0) {
      return { error: `Could not parse or play chord: ${chord}` };
    }

    const duration = settings.secondsPerChord;
    this.polySynth.triggerAttackRelease(notes, duration, Tone.now());

    return {};
  }

  /**
   * Action: Plays a sequence of chords using the settings for the specified progression.
   * @requires `progression` must exist in `ProgressionPlaybackSettings`.
   * @effects Plays the given `chordSequence` array (e.g., ["Cmaj", "Fm", null, "G7"])
   *          with `secondsPerChord` duration for each item, using the configured instrument
   *          (via the generic `PolySynth`). A `null` in the sequence represents a rest.
   *          Starts Tone.js audio context if not already started.
   *          Stops any currently playing sequence for the same progression before starting a new one.
   */
  async playProgression(
    { progression, chordSequence }: {
      progression: Progression;
      chordSequence: (string | null)[];
    },
  ): Promise<Empty | { error: string }> {
    await this._startTone();

    const settings = await this.progressionPlaybackSettings.findOne({
      _id: progression,
    });
    if (!settings) {
      return { error: `Settings for progression ${progression} not found.` };
    }

    const duration = settings.secondsPerChord;
    const interval = `${duration}s`;

    // Stop any existing sequence before starting a new one for clean playback
    if (this.currentTransportSequence) {
      Tone.Transport.stop();
      Tone.Transport.cancel();
      this.currentTransportSequence.dispose();
      this.currentTransportSequence = null;
    }

    const sequenceData: (string[] | null)[] = chordSequence.map((musicalUnit) => {
      if (musicalUnit === null) return null;
      const notes = this._parseChordString(musicalUnit);
      if (notes.length === 0) {
        console.warn(`Skipping unparseable or invalid musical unit in sequence: ${musicalUnit}`);
        return null;
      }
      return notes;
    });

    this.currentTransportSequence = new Tone.Sequence(
      (time, notesToPlay) => {
        if (notesToPlay && notesToPlay.length > 0) {
          this.polySynth.triggerAttackRelease(notesToPlay, duration, time);
        }
      },
      sequenceData,
      interval,
    );

    this.currentTransportSequence.start(0);
    Tone.Transport.start();

    return {};
  }
}
```
