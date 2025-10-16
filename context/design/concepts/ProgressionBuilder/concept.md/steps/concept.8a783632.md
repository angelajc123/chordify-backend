---
timestamp: 'Thu Oct 16 2025 14:21:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_142132.05ebb2f9.md]]'
content_id: 8a7836324e343574a284203b7aab201dc382130511bf7d358f95fdea4f6a58c8
---

# concept: ProgressionBuilder

* **concept**: ProgressionBuilder
* **purpose**: enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
* **principle**: A user begins with an empty sequence. They add new slots to extend the sequence, select a slot to edit, set a chord in that slot, and can later remove either the chord or the entire slot. At any time one slot is designated as selected for editing.
* **state**:
  * A sequence of `Slots` with
    * a `chord` of type `String`, or `null` if no chord is set
  * A `selectedSlotIdx` of type `Number`, referencing the index of the currently selected slot in the sequence or `null` if no slot is selected
* **actions**:
  * `selectSlot(slotIdx: Number)`
    * **requires**: `0 <= slotIdx < Slots.length` and not `null`
    * **effect**: sets `selectedSlotIdx` to `slotIdx` if `slotIdx != selectedSlotIdx`, sets `selectedSlotIdx` to `null` if `slotIdx == selectedSlotIdx`
  * `addSlot()`
    * **effect**: appends a new empty `Slot` to the sequence and set `selectedSlotIdx` as its index
  * `setChord(chord: String)`
    * **requires**: `0 <= selectedSlotIdx < Slots.length` and not `null`, `chord` is a chord in standard music notation
    * **effect**: sets the `Slot` at `selectedSlotIdx`’s `chord` to `chord`
  * `deleteChord()`
    * **requires**: `0 <= selectedSlotIdx < Slots.length` and not `null`
    * **effect**: sets `chord` at the `Slot` at `selectedSlotIdx` to `null`
  * `deleteSlot()`
    * **requires**: `0 <= selectedSlotIdx < Slots.length` and not `null`
    * **effect**: removes the `Slot` at `selectedSlotIdx` from the sequence, sets `selectedSlotIdx` to `null`
