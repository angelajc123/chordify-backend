---
timestamp: 'Thu Oct 16 2025 16:02:10 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_160210.401ef404.md]]'
content_id: 2ff095f1fd1d6eb3e64b88b0d6b2a61a0060ff63788af5e74e6b7b9b9cee69e6
---

# concept: PlayBack

* **concept**: PlayBack \[Progression]

* **purpose**: allow users to listen to sequences of musical units easily, enabling rapid feedbackand iteration during composition.

* **principle**: A user can set play back settings such as instrument and seconds per chord. The user can play sequences of chords or a single chord.

* **state**:
  * A set of `ProgressionPlaybackSettings` with
    * A `progression` of type `Progression`
    * An `instrument` of type `String`, default `Grand Piano`
    * A `secondsPerChord` of type `Number`, default `1`

* **actions**:
  * `initializeSettings(progression: Progression) : (progressionPlaybackSettings: ProgressionPlaybackSettings)`
    * **requires**: `progression` does not exist in ProgressionPlaybackSettings
    * **effect**: creates a new `ProgressionPlaybackSettings` for `progression` with default values for `instrument`, `secondsPerChord`.
  * `setInstrument(progression: Progression, instrument: String)`
    * **requires**: `progression` exists in `ProgressionPlaybackSettings`, `instrument` is a valid instrument
    * **effect**: updates the `ProgressionPlaybackSettings` for `progression` with the given `instrument`.
  * `setSecondsPerChord(progression: Progression, secondsPerChord: Number)`
    * **requires**: `progression` exists in `ProgressionPlaybackSettings`, `secondsPerChord > 0`
    * **effect**: updates the `ProgressionPlaybackSettings` for `progression` with the given `secondsPerChord`.
  * `getProgressionSettings(progression: Progression): (progressionSettings: ProgressionPlaybackSettings)`
    * **effect**: returns the `ProgressionPlaybackSettings` for `progression`.
  * `playChord(progression: Progression, chord: String)`
    * **requires**: `progression` exists in `ProgressionPlaybackSettings`, `chord` is a valid chord in standard music notation
    * **effect**: plays the given `chord` using the settings in `ProgressionPlaybackSettings` for `progression`.
  * `playProgression(progression: Progression, chordSequence: (String | null)[])`
    * **requires**: `progression` exists in `ProgressionPlaybackSettings`, every chord in `chordSequence` is in standard music notation or null
    * **effect**: plays the given `chordSequence` using the settings in `ProgressionPlaybackSettings` for `progression`.
