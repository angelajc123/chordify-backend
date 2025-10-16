# concept: ProgressionBuilder
*   **concept**: ProgressionBuilder
*   **purpose**: enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
*   **principle**: A user creates a new progession, which starts as an empty sequence, and names it. They can add new slots to extend the sequence, and set chords to slots, remove chords from slots, remove slots, or reorder slots.
*   **state**:
    *   A set of `Progressions` with
        *   An `id` of type `Number`
        *   A `name` of type `String`
        *   A `chordSequence` of type sequence of `Slots`, each with
            *   a `chord` of type `String`, or `null` if no chord is set
*   **actions**:
    *   `createProgression(name: String): (progression: Progression)`
        *   **effect**: Creates a new, empty progression with the given name, and unique id, and returns that id.
    *   `addSlot(progressionId: Number)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: appends a null `Slot` to `chordSequence` of the progression with id `progressionId`
    *   `setChord(progressionId: Number, position: Number, chord: String)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: sets the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`’s `chord` to `chord`
    *   `deleteChord(progressionId: Number, position: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: sets `chord` at the `Slot` at `position` of `chordSequence` of the progression with id `progressionId` to `null`
    *   `deleteSlot(progressionId: Number, position: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: removes the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`
    *   `reorderSlots(progressionId: Number, oldPosition: Number, newPosition: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `oldPosition` is a valid index of `chordSequence` of the progression with id `progressionId`, `newPosition` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: moves the `Slot` at `oldPosition` of `chordSequence` of the progression with id `progressionId` to `newPosition`
    *   `deleteProgression(progressionId: Number)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: removes the progression with id `progressionId`
    *   `renameProgression(progressionId: Number, name: String)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: sets the name of the progression with id `progressionId` to `name`
    *   `getProgression(progressionId: Number) : (progression: Progression)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: returns the progression with id `progressionId`
    *   `listProgressions() : (progressionIdentifiers: List of (id: Number, name: String))`
        *   **effect**: returns a list of all progression names and ids