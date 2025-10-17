---
timestamp: 'Thu Oct 16 2025 19:33:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_193352.e2ca6794.md]]'
content_id: 621ce7d1247640a241495586976d10d18a2ddf4b9bd43b914d97c9ad9ac49957
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import * as Tone from "npm:tone";
import { Empty, ID } from "../../utils/types.ts"; // Adjust path as necessary
import { freshID } from "../../utils/database.ts"; // Adjust path as necessary

// Collection prefix to ensure namespace separation
const PREFIX = "PlayBack" + ".";

// Generic types for the concept's external dependencies
type Progression = ID;

// State interfaces
/**
 * @state A set of ProgressionPlaybackSettings
 * @property _id The ID of the musical progression this setting belongs to.
 * @property instrument The name of the instrument to use for playback (e.g., "Grand Piano").
 * @property secondsPerChord The duration each chord in a sequence should play for.
 */
interface ProgressionPlaybackSettingsDoc {
  _id: Progression;
  instrument: string;
  secondsPerChord: number;
}

/**
 * @concept PlayBack
 * @purpose To allow users to listen to sequences of musical units easily, enabling rapid feedback and iteration during composition.
 * @principle A user can set play back settings such as instrument and seconds per chord. The user can play sequences of chords or a single chord.
 */
export default class PlayBackConcept {
  progressionPlaybackSettings: Collection<ProgressionPlaybackSettingsDoc>;

  // Tone.js specific members
  private polySynth: Tone.PolySynth;
  private currentTransportSequence: Tone.Sequence | null = null;
  private isToneStarted: boolean = false; // To track Tone.js AudioContext state

  constructor(private readonly db: Db) {
    this.progressionPlaybackSettings = this.db.collection(
      PREFIX + "progressionPlaybackSettings",
    );

    // Initialize a PolySynth for basic sound generation.
    // NOTE: For a true "Grand Piano" or other specific instruments,
    // Tone.Sampler (requiring sample file loading) or more complex synths
    // would be needed. This PolySynth provides a generic, configurable sound.
    // The 'instrument' setting in the database is currently only a descriptor.
    this.polySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" }, // Default simple sine wave
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    // Set up Tone.js Transport for timing sequences
    // BPM value will affect the internal timing if using musical notation for intervals,
    // but here we primarily use 'seconds' for duration and interval.
    Tone.Transport.bpm.value = 120;
  }

  // Helper to ensure Tone.js audio context is started
  // Tone.js requires a user gesture to start its AudioContext.
  // This method attempts to start it, but actual initiation might require
  // being called from a user-initiated event handler (e.g., button click).
  private async _startTone(): Promise<void> {
    if (!this.isToneStarted) {
      try {
        await Tone.start();
        console.log("Tone.js audio context started.");
        this.isToneStarted = true;
      } catch (e) {
        console.error("Failed to start Tone.js audio context:", e);
        // In a real application, you might want to surface this error to the user
        // or trigger a UI element to prompt a user gesture.
      }
    }
  }

  /**
   * Helper function to parse a chord string into an array of Tone.js note strings.
   * This is a basic implementation, covering single notes and common triads/7ths.
   * Defaults to octave 4 for roots if not specified.
   *
   * @param chord The chord string (e.g., "C4", "Eb", "Cmaj", "Dm7", "null")
   * @returns An array of note strings (e.g., ["C4", "E4", "G4"]) or an empty array for invalid/null chords.
   */
  private _parseChordString(chord: string | null): string[] {
    if (!chord || chord.toLowerCase() === "null") return [];

    const baseOctave = 4; // Default octave if not specified for root

    // 1. Try to parse as a single note with optional octave (e.g., "C4", "Eb", "F#5")
    const singleNoteMatch = chord.match(/^([A-G][b#]?)(-?\d)?$/i);
    if (singleNoteMatch) {
      const noteName = singleNoteMatch[1];
      const octave = singleNoteMatch[2] ? parseInt(singleNoteMatch[2], 10) : baseOctave;
      try {
        // Validate if it's a real note Tone.js can understand
        const validNote = Tone.Midi(`${noteName}${octave}`).toNote();
        return [validNote];
      } catch (e) {
        console.warn(`Invalid single note string: ${chord}`, e);
        return [];
      }
    }

    // 2. Try to parse as a simple chord name (e.g., "Cmaj", "Dm")
    const chordMatch = chord.match(/^([A-G][b#]?)(maj|min|m|M|sus2|sus4|dim|aug|7|maj7|m7|dom7)?$/i);
    if (chordMatch) {
      const rootNoteName = chordMatch[1];
      let quality = chordMatch[2] ? chordMatch[2].toLowerCase() : "maj"; // Default to major if no quality specified

      // Attempt to get root MIDI number. Assume baseOctave for root.
      let rootMidi: number;
      try {
        rootMidi = Tone.Midi(`${rootNoteName}${baseOctave}`).toMidi();
      } catch (e) {
        console.warn(`Could not determine root note from chord string: ${chord}`, e);
        return [];
      }

      const notes: string[] = [];
      notes.push(Tone.Midi(rootMidi).toNote()); // Add root

      switch (quality) {
        case "maj":
        case "": // No quality suffix, assume major
          notes.push(Tone.Midi(rootMidi + 4).toNote()); // Major 3rd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          break;
        case "min":
        case "m": // 'm' for minor
          notes.push(Tone.Midi(rootMidi + 3).toNote()); // Minor 3rd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          break;
        case "7": // Dominant 7th
        case "dom7":
          notes.push(Tone.Midi(rootMidi + 4).toNote()); // Major 3rd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          notes.push(Tone.Midi(rootMidi + 10).toNote()); // Minor 7th
          break;
        case "maj7": // Major 7th
          notes.push(Tone.Midi(rootMidi + 4).toNote()); // Major 3rd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          notes.push(Tone.Midi(rootMidi + 11).toNote()); // Major 7th
          break;
        case "m7": // Minor 7th
          notes.push(Tone.Midi(rootMidi + 3).toNote()); // Minor 3rd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          notes.push(Tone.Midi(rootMidi + 10).toNote()); // Minor 7th
          break;
        case "dim": // Diminished triad (root, m3, d5)
          notes.push(Tone.Midi(rootMidi + 3).toNote()); // Minor 3rd
          notes.push(Tone.Midi(rootMidi + 6).toNote()); // Diminished 5th
          break;
        case "aug": // Augmented triad (root, M3, A5)
          notes.push(Tone.Midi(rootMidi + 4).toNote()); // Major 3rd
          notes.push(Tone.Midi(rootMidi + 8).toNote()); // Augmented 5th
          break;
        case "sus2": // Sus2 triad (root, M2, P5)
          notes.push(Tone.Midi(rootMidi + 2).toNote()); // Major 2nd
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          break;
        case "sus4": // Sus4 triad (root, P4, P5)
          notes.push(Tone.Midi(rootMidi + 5).toNote()); // Perfect 4th
          notes.push(Tone.Midi(rootMidi + 7).toNote()); // Perfect 5th
          break;
        default:
          console.warn(`Unsupported chord quality: ${quality} for chord: ${chord}`);
          return [];
      }
      return notes;
    }

    console.warn(`Unrecognized musical unit format: ${chord}`);
    return [];
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

    const defaultSettings: ProgressionPlaybackSettingsDoc = {
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
  ): Promise<ProgressionPlaybackSettingsDoc | null> {
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
    // Trigger the synth. The 'now' time ensures it plays immediately.
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
    const interval = `${duration}s`; // Interval between sequence steps

    // Stop any existing sequence before starting a new one for clean playback
    if (this.currentTransportSequence) {
      Tone.Transport.stop(); // Stop transport to ensure all events are cleared
      Tone.Transport.cancel(); // Clear all scheduled events
      this.currentTransportSequence.dispose(); // Clean up the old sequence
      this.currentTransportSequence = null;
    }

    // Prepare the sequence data for Tone.Sequence
    const sequenceData: (string[] | null)[] = chordSequence.map((chord) => {
      if (chord === null) return null; // Rest
      const notes = this._parseChordString(chord);
      if (notes.length === 0) {
        console.warn(`Skipping unparseable or invalid chord in sequence: ${chord}`);
        return null; // Treat unparseable chords as rests
      }
      return notes;
    });

    // Create a new Tone.Sequence
    this.currentTransportSequence = new Tone.Sequence(
      (time, notesToPlay) => {
        if (notesToPlay && notesToPlay.length > 0) {
          // Play the notes at the scheduled 'time'
          this.polySynth.triggerAttackRelease(notesToPlay, duration, time);
        }
      },
      sequenceData, // Use the prepared sequence data
      interval, // Time between each step
    );

    // Start the Tone.js Transport and the sequence from the beginning
    this.currentTransportSequence.start(0); // Start the sequence from the beginning of the transport
    Tone.Transport.start(); // Start the global transport

    // Playback is asynchronous, the actual audio is an external effect.
    return {};
  }
}
```
