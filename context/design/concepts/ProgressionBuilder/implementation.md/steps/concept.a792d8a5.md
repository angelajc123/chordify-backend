---
timestamp: 'Wed Oct 15 2025 18:19:43 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_181943.17d5ebac.md]]'
content_id: a792d8a5124690aad1240bd03ad0e8b825713309f039d7e9ce9932b44f11c9d5
---

# concept: ProgressionBuilder

* **concept**: ProgressionBuilder
* **purpose**: enable users to construct and modify a sequence of musical units by adding, setting, or removing elements.
* **principle**: A user begins with an empty sequence. They add new slots to extend the sequence, select a slot to edit, set a musical unit in that slot, and can later remove either the unit or the entire slot. At any time one slot is designated as selected for editing.
* **state**:
  * A sequence of `Slots` with
    * an optional `chord` of type `Chord`
  * A `selectedSlot` of type `Slot`, referencing one slot in the sequence or `null`
* **actions**:
  * `selectSlot(slot: Slot)`
    * **requires**: `slot` to exist in the sequence
    * **effect**: sets `selectedSlot` to `slot`
  * `addSlot()`
    * **effect**: appends a new empty `Slot` to the sequence and sets it as `selectedSlot`
  * `setChord(chord: Chord)`
    * **requires**: `selectedSlot` to exist
    * **effect**: sets the `selectedSlot`’s `chord` to `chord`
  * `deleteChord()`
    * **requires**: `selectedSlot` to exist
    * **effect**: removes `chord` from `selectedSlot`
  * `deleteSlot()`
    * **requires**: `selectedSlot` to exist
    * **effect**: removes `selectedSlot` from the sequence, sets `selectedSlot` to `null`
