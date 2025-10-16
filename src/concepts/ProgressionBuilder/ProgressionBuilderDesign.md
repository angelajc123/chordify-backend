# ProgressionBuilder Design Changes
- Changed `musical unit` to `chord` for clarity
- Defined all of the types
- Instead of using a `selectedSlot`, I changed it to `selectSlotIdx` in order to avoid redunant fields an improve clarity for how the selected slot was being held
- Updated the actions to reflect the change to `selectSlotIdx`
- Updated `selectSlot` to unselect a slot if the current selected slot is the same as the one being selected. Thought it might be nice for the user to be able to unselect a slot.
- Updated the `setChord` action to require a `chord` that is a valid chord in standard music notation