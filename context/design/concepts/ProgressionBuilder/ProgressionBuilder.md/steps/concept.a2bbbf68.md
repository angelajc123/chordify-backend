---
timestamp: 'Wed Oct 15 2025 23:55:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_235507.ec542608.md]]'
content_id: a2bbbf68d13383c5018f7524db94818c165ec05cd814ca33fad59d3b83e02f1d
---

# concept: ProgressionBuilder

* **concept**: ProgressionBuilder
* **purpose**: enable users to construct and modify a sequence of musical units by adding, setting, or removing elements.
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
