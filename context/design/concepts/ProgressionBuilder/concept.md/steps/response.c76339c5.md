---
timestamp: 'Thu Oct 16 2025 14:58:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_145819.360dd9aa.md]]'
content_id: c76339c5a104c597fd33627ae241f618b2683b53ffb7b5f30917431a07c521b8
---

# response:

Adding error handling into your concept design, where you want to take different actions for success and failure, is a common and important step. The concept design framework handles this by **overloading actions** with different return types, and using **mutually exclusive preconditions (`requires`)** to determine which variant of the action fires.

Here’s how you would integrate explicit error handling into your `ProgressionBuilder` concept, following the principles outlined in the background document:

### Key Principles for Error Handling in Concept Design:

1. **Overloaded Actions for Success and Failure:** Define multiple versions of an action with the same name but different return types. One type signifies success, and another (typically `(error: String)`) signifies failure.
2. **Mutually Exclusive `requires` Clauses:** The `requires` clause for each overloaded action variant must be carefully crafted so that only *one* variant can fire for any given set of input arguments and state.
   * The "successful" variant's `requires` specifies the conditions under which it proceeds.
   * The "error" variant's `requires` specifies the inverse conditions, under which it produces an error.
3. **Non-Empty Success Return:** If an action has an overloaded error version (e.g., `(error: String)`), the successful version *must* return a non-empty dictionary. A simple `(success: Boolean)` or `(status: String)` is sufficient if no other data needs to be returned.

### Applying to `ProgressionBuilder`

Let's modify the actions of your `ProgressionBuilder` concept. We'll focus on common failure modes like invalid `progressionId` or `position` for now, and ensure successful actions return `(success: Boolean)` when an error variant exists.

***

**concept** ProgressionBuilder

**purpose** enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.

**principle** A user creates a new progession, which starts as an empty sequence, and names it. They can add new slots to extend the sequence, and set chords to slots, remove chords from slots, remove slots, or reorder slots.

**state**
  A set of `Progressions` with
    An `id` of type `Number`
    A `name` of type `String`
    A `chordSequence` of type sequence of `Slots`, each with
      a `chord` of type `String`, or `null` if no chord is set

**actions**

* `createProgression(name: String): (progressionId: Number)`
  * **requires**: `true` (creating a progression should generally always be possible, as there are no obvious preconditions to violate for basic creation)
  * **effects**: Creates a new, empty progression with the given name and unique id. Returns that id.
    *(No explicit error variant needed here, as it has no preconditions to violate and returns data on success).*

* `addSlot(progressionId: Number): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`.
  * **effects**: Appends a null `Slot` to `chordSequence` of the `Progression` with id `progressionId`. `success := true`.

* `addSlot(progressionId: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`.
  * **effects**: `error := "Progression with ID {progressionId} not found."`

* `setChord(progressionId: Number, position: Number, chord: String): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`, AND `position` is a valid index within `chordSequence` of that `Progression`.
  * **effects**: Sets the `Slot` at `position` of `chordSequence` of the `Progression` with id `progressionId`'s `chord` to `chord`. `success := true`.

* `setChord(progressionId: Number, position: Number, chord: String): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`, OR `position` is NOT a valid index within `chordSequence` of the `Progression` with id `progressionId`.
  * **effects**: `error := "Progression with ID {progressionId} not found, or position {position} is out of bounds."`
    *(Note: We are not validating the `chord` string itself here, assuming the concept is not responsible for musical notation correctness, as discussed previously).*

* `deleteChord(progressionId: Number, position: Number): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`, AND `position` is a valid index within `chordSequence` of that `Progression`.
  * **effects**: Sets `chord` at the `Slot` at `position` of `chordSequence` of the `Progression` with id `progressionId` to `null`. `success := true`.

* `deleteChord(progressionId: Number, position: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`, OR `position` is NOT a valid index within `chordSequence` of the `Progression` with id `progressionId`.
  * **effects**: `error := "Progression with ID {progressionId} not found, or position {position} is out of bounds."`

* `deleteSlot(progressionId: Number, position: Number): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`, AND `position` is a valid index within `chordSequence` of that `Progression`.
  * **effects**: Removes the `Slot` at `position` from `chordSequence` of the `Progression` with id `progressionId`. `success := true`.

* `deleteSlot(progressionId: Number, position: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`, OR `position` is NOT a valid index within `chordSequence` of the `Progression` with id `progressionId`.
  * **effects**: `error := "Progression with ID {progressionId} not found, or position {position} is out of bounds."`

* `reorderSlots(progressionId: Number, oldPosition: Number, newPosition: Number): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`, AND `oldPosition` is a valid index within `chordSequence` of that `Progression`, AND `newPosition` is a valid index within `chordSequence` of that `Progression`.
  * **effects**: Moves the `Slot` at `oldPosition` of `chordSequence` of the `Progression` with id `progressionId` to `newPosition`. `success := true`.

* `reorderSlots(progressionId: Number, oldPosition: Number, newPosition: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`, OR `oldPosition` is NOT a valid index, OR `newPosition` is NOT a valid index within `chordSequence` of the `Progression` with id `progressionId`.
  * **effects**: `error := "Progression with ID {progressionId} not found, or one or both positions ({oldPosition}, {newPosition}) are out of bounds."`

* `deleteProgression(progressionId: Number): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`.
  * **effects**: Removes the `Progression` with id `progressionId`. `success := true`.

* `deleteProgression(progressionId: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`.
  * **effects**: `error := "Progression with ID {progressionId} not found."`

* `renameProgression(progressionId: Number, name: String): (success: Boolean)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`.
  * **effects**: Sets the `name` of the `Progression` with id `progressionId` to `name`. `success := true`.

* `renameProgression(progressionId: Number, name: String): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`.
  * **effects**: `error := "Progression with ID {progressionId} not found."`

* `getProgression(progressionId: Number): (progression: Progression)`
  * **requires**: `progressionId` is a valid id of an existing `Progression`.
  * **effects**: Returns the `Progression` with id `progressionId`.

* `getProgression(progressionId: Number): (error: String)`
  * **requires**: `progressionId` is NOT a valid id of an existing `Progression`.
  * **effects**: `error := "Progression with ID {progressionId} not found."`

* `listProgressions(): (progressionIdentifiers: List of (id: Number, name: String))`
  * **requires**: `true`
  * **effects**: Returns a list of all progression names and ids.
    *(No error variant needed, as it always returns a list, potentially empty, which is a valid outcome).*

***

### How this works with Syncs:

When a `sync` rule calls an action, it can use pattern matching on the results to differentiate between success and failure. For example:

```
sync AttemptToAddSlot
when
    Request.addSlot(progressionId: P_ID)
then
    // Try to add the slot
    ProgressionBuilder.addSlot(progressionId: P_ID): (success: S)
    // If successful, log it
    Log.info(message: "Slot added to progression {P_ID}")

sync HandleFailedAddSlot
when
    Request.addSlot(progressionId: P_ID)
then
    // If it failed, log the error and notify the user
    ProgressionBuilder.addSlot(progressionId: P_ID): (error: E)
    Log.error(message: "Failed to add slot to progression {P_ID}: {E}")
    UserNotifications.send(userId: CurrentUser, message: "Failed to add slot: {E}")
```

In this simplified example, the `Request.addSlot` action would trigger *two* potential syncs. Based on the *outcome* of `ProgressionBuilder.addSlot` (which automatically fires either its success or error variant based on its `requires` clause), only one of the `then` blocks (either `AttemptToAddSlot` or `HandleFailedAddSlot`) would actually execute its subsequent actions.

This refined design provides clear, explicit error feedback for interactions with your `ProgressionBuilder` concept, making it more robust and easier to integrate with other concepts via synchronizations.
