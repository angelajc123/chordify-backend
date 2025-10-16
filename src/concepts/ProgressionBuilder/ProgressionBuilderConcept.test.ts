import { assertEquals, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import ProgressionBuilderConcept from "./ProgressionBuilderConcept.ts";

Deno.test("ProgressionBuilderConcept: Initial state and _getProgression", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const initialState = await concept._getProgression();
    assertEquals(initialState.slots.length, 0, "Initially, slots should be empty.");
    assertEquals(initialState.selectedSlotIdx, null, "Initially, no slot should be selected.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: addSlot() effects", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Add first slot
    await concept.addSlot();
    let state = await concept._getProgression();
    assertEquals(state.slots.length, 1, "Should have 1 slot after adding one.");
    assertEquals(state.slots[0], { chord: null }, "First slot should be empty.");
    assertEquals(state.selectedSlotIdx, 0, "First slot should be selected.");

    // Add second slot
    await concept.addSlot();
    state = await concept._getProgression();
    assertEquals(state.slots.length, 2, "Should have 2 slots after adding two.");
    assertEquals(state.slots[1], { chord: null }, "Second slot should be empty.");
    assertEquals(state.selectedSlotIdx, 1, "Second slot should be selected.");

    // Add third slot
    await concept.addSlot();
    state = await concept._getProgression();
    assertEquals(state.slots.length, 3, "Should have 3 slots after adding three.");
    assertEquals(state.slots[2], { chord: null }, "Third slot should be empty.");
    assertEquals(state.selectedSlotIdx, 2, "Third slot should be selected.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: selectSlot() requirements and effects", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Requires: 0 <= slotIdx < Slots.length
    const error1 = await concept.selectSlot(0);
    assertEquals("error" in error1, true, "Cannot select slot if progression is empty.");

    await concept.addSlot(); // adds slot at index 0, selects it
    await concept.addSlot(); // adds slot at index 1, selects it (state: [{},{}], selected: 1)

    // Test out-of-bounds
    const error2 = await concept.selectSlot(-1);
    assertEquals("error" in error2, true, "Selecting negative index should fail.");
    const error3 = await concept.selectSlot(2);
    assertEquals("error" in error3, true, "Selecting index >= length should fail.");

    // Effect: sets selectedSlotIdx to slotIdx if slotIdx is different
    let state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, 1, "Initially, slot 1 should be selected.");
    await concept.selectSlot(0);
    state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, 0, "Slot 0 should be selected after explicit selection.");

    // Effect: sets selectedSlotIdx to null if slotIdx is the same (toggles off)
    await concept.selectSlot(0); // Select 0 again
    state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, null, "Selecting the same slot should toggle selection off.");

    await concept.selectSlot(1); // Select slot 1
    state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, 1, "Slot 1 should be selected.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: setChord() requirements and effects", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Requires: selectedSlotIdx not null
    const error1 = await concept.setChord("Cmaj");
    assertEquals("error" in error1, true, "Cannot set chord if no slot is selected.");

    await concept.addSlot(); // slots: [{chord:null}], selected: 0
    await concept.addSlot(); // slots: [{chord:null}, {chord:null}], selected: 1
    await concept.selectSlot(0); // slots: [{chord:null}, {chord:null}], selected: 0

    // Effect: sets the Slot at selectedSlotIdx’s chord
    await concept.setChord("Cmaj7");
    let state = await concept._getProgression();
    assertEquals(state.slots[0].chord, "Cmaj7", "Chord should be set in selected slot.");
    assertEquals(state.slots[1].chord, null, "Other slot should remain null.");

    // Test changing an existing chord
    await concept.setChord("G7");
    state = await concept._getProgression();
    assertEquals(state.slots[0].chord, "G7", "Chord should be updated.");

    // Test setting to null
    await concept.setChord(null);
    state = await concept._getProgression();
    assertEquals(state.slots[0].chord, null, "Chord should be set to null.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: deleteChord() requirements and effects", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Requires: selectedSlotIdx not null
    const error1 = await concept.deleteChord();
    assertEquals("error" in error1, true, "Cannot delete chord if no slot is selected.");

    await concept.addSlot(); // slots: [{chord:null}], selected: 0
    await concept.setChord("Am"); // slots: [{chord:"Am"}], selected: 0

    // Effect: sets chord at the Slot at selectedSlotIdx to null
    await concept.deleteChord();
    let state = await concept._getProgression();
    assertEquals(state.slots[0].chord, null, "Chord should be deleted (set to null).");

    // Test deleting from a slot that already has null (should still succeed)
    const result = await concept.deleteChord();
    assertNotEquals("error" in result, true, "Deleting null chord should not return an error.");
    state = await concept._getProgression();
    assertEquals(state.slots[0].chord, null, "Chord remains null after deleting an already null chord.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: deleteSlot() requirements and effects", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Requires: selectedSlotIdx not null
    const error1 = await concept.deleteSlot();
    assertEquals("error" in error1, true, "Cannot delete slot if no slot is selected.");

    // Setup a progression: [C, D, E]
    await concept.addSlot(); await concept.setChord("C"); // slots: [{C}], selected: 0
    await concept.addSlot(); await concept.setChord("D"); // slots: [{C}, {D}], selected: 1
    await concept.addSlot(); await concept.setChord("E"); // slots: [{C}, {D}, {E}], selected: 2

    // Delete a middle slot (index 1, 'D')
    await concept.selectSlot(1); // Select 'D'
    await concept.deleteSlot();
    let state = await concept._getProgression();
    assertEquals(state.slots.length, 2, "Should have 2 slots after deleting one.");
    assertEquals(state.slots[0].chord, "C", "First slot should still be 'C'.");
    assertEquals(state.slots[1].chord, "E", "Third slot should shift to index 1 and be 'E'.");
    assertEquals(state.selectedSlotIdx, null, "Selected slot should be null after deletion.");

    // Delete the first slot (index 0, 'C')
    await concept.selectSlot(0); // Select 'C'
    await concept.deleteSlot();
    state = await concept._getProgression();
    assertEquals(state.slots.length, 1, "Should have 1 slot left.");
    assertEquals(state.slots[0].chord, "E", "Remaining slot should be 'E'.");
    assertEquals(state.selectedSlotIdx, null, "Selected slot should be null after deletion.");

    // Delete the last (and only) slot (index 0, 'E')
    await concept.selectSlot(0); // Select 'E'
    await concept.deleteSlot();
    state = await concept._getProgression();
    assertEquals(state.slots.length, 0, "Should have 0 slots after deleting all.");
    assertEquals(state.selectedSlotIdx, null, "Selected slot should be null after deletion.");
  } finally {
    await client.close();
  }
});

Deno.test("ProgressionBuilderConcept: Principle - Build, modify, and manage selection", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // Principle: A user begins with an empty sequence.
    let state = await concept._getProgression();
    assertEquals(state.slots.length, 0, "Start with an empty sequence.");
    assertEquals(state.selectedSlotIdx, null);

    // Principle: They add new slots to extend the sequence
    await concept.addSlot(); // slot 0, selected 0
    state = await concept._getProgression();
    assertEquals(state.slots.length, 1);
    assertEquals(state.selectedSlotIdx, 0);

    // Principle: select a slot to edit, set a chord in that slot
    await concept.setChord("Cmaj");
    state = await concept._getProgression();
    assertEquals(state.slots[0].chord, "Cmaj");

    // Add another slot, which also makes it selected
    await concept.addSlot(); // slot 1, selected 1
    state = await concept._getProgression();
    assertEquals(state.slots.length, 2);
    assertEquals(state.selectedSlotIdx, 1);
    assertEquals(state.slots[1].chord, null);

    // Set a chord in the new slot
    await concept.setChord("G7");
    state = await concept._getProgression();
    assertEquals(state.slots[1].chord, "G7");

    // Principle: and can later remove either the chord...
    await concept.selectSlot(0); // Select Cmaj slot, toggles off old selection
    state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, 0);
    await concept.deleteChord();
    state = await concept._getProgression();
    assertEquals(state.slots[0].chord, null);

    // ...or the entire slot.
    await concept.selectSlot(1); // Select G7 slot
    state = await concept._getProgression();
    assertEquals(state.selectedSlotIdx, 1);
    await concept.deleteSlot();
    state = await concept._getProgression();
    assertEquals(state.slots.length, 1); // Only the first (now empty) slot remains
    assertEquals(state.slots[0].chord, null);
    assertEquals(state.selectedSlotIdx, null, "Selection should be null after deleting slot.");

    // Principle: At any time one slot is designated as selected for editing.
    // This has been implicitly tested and verified throughout the sequence.
  } finally {
    await client.close();
  }
});