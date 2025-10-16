---
timestamp: 'Thu Oct 16 2025 15:56:08 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_155608.b5d530c2.md]]'
content_id: dd81bf1e5113629ea6731d0b82eacc75382d87248d643d21608862632e860a28
---

# concept: PlayBack

* **concept**: PlayBack

* **purpose**: allow users to listen to sequences of musical units easily, enabling rapid feedbackand iteration during composition.

* **principle**: A user can set play back settings such as instrument and seconds per chord. The user can play sequences of chords or a single chord.

* **state**:
  * A set of `ProgressionPlaybackSettings` with
    * A `id` of type `Number`
    * An `instrument` of type `String`, default `Grand Piano`
    * A `secondsPerChord` of type `Number`, default `1`

* **actions**:
  * `initializeSettings(id: Number)`
    * **requires**: `id` does not exist in ProgressionPlaybackSettings
    * **effect**: creates a new `ProgressionPlaybackSettings` with the given `id` and default values for `instrument`, `secondsPerChord`.
  * `setInstrument(id: Number, instrument: String)`
    * **requires**: `id` exists in `ProgressionPlaybackSettings`, `instrument` is a valid instrument
    * **effect**: updates the `ProgressionPlaybackSettings` with the given `id` with the given `instrument`.
  * `setSecondsPerChord(id: Number, secondsPerChord: Number)`
    * **requires**: `id` exists in `ProgressionPlaybackSettings`, `secondsPerChord > 0`
    * **effect**: updates the `ProgressionPlaybackSettings` with the given `id` with the given `secondsPerChord`.
  * `getProgressionSettings(id: Number): (progressionSettings: ProgressionPlaybackSettings)`
    * **effect**: returns the `ProgressionPlaybackSettings` with the given `id`.
  * `playChord(id: Number, chord: String)`
    * **requires**: `id` exists in `ProgressionPlaybackSettings`, `chord` is a valid chord in standard music notation
    * **effect**: plays the given `chord` using the settings in `ProgressionPlaybackSettings` with the given `id`.
  * `playProgression(id: Number, chordSequence: (String | null)[])`
    * **requires**: `id` exists in `ProgressionPlaybackSettings`, every chord in `chordSequence` is in standard music notation or null
    * **effect**: plays the given `chordSequence` using the settings in `ProgressionPlaybackSettings` with the given `id`.
