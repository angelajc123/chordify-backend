---
timestamp: 'Wed Oct 15 2025 18:29:02 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_182902.d266b169.md]]'
content_id: 0baf58899aa6c393e1d6e3416d7b1c72223be1f54e3c79758ac7206b0bb4fe0c
---

# response:

```typescript
import { assertEquals, assertExists, assertNotEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import ProgressionBuilderConcept from "./ProgressionBuilderConcept.ts";
import { ID } from "@utils/types.ts";

Deno.test("ProgressionBuilder Concept", async (t) => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  Deno.test(t, "should initialize with an empty progression", async () => {
    const progression = await concept._getProgressionState();
    assertEquals(progression.slots.length, 0);
    assertEquals(progression.selectedSlotId, null);
  });

  Deno.test(t, "addSlot() should add a new slot and select it", async () => {
    await concept.addSlot();
    const progression = await concept._getProgressionState();

    assertEquals(progression.slots.length, 1);
    assertExists(progression.selectedSlotId);
    assertEquals(progression.slots[0].id, progression.selectedSlotId);
    assertEquals(progression.slots[0].chord, null);

    // Add another slot
    await concept.addSlot();
    const progression2 = await concept._getProgressionState();
    assertEquals(progression2.slots.length, 2);
    assertExists(progression2.selectedSlotId);
    assertNotEquals(progression2.slots[0].id, progression2.selectedSlotId); // The first slot is no longer selected
    assertEquals(progression2.slots[1].id, progression2.selectedSlotId); // The *newest* slot is selected
  });

  Deno.test(t, "selectSlot() should select an existing slot", async () => {
    await concept.addSlot(); // Add slot1
    const slot1Id = (await concept._getProgressionState()).selectedSlotId!;
    await concept.addSlot(); // Add slot2, now selected

    const selectResult = await concept.selectSlot({ slot: slot1Id });
    assertEquals(selectResult, {}); // Expect success

    const progression = await concept._getProgressionState();
    assertEquals(progression.selectedSlotId, slot1Id);
  });

  Deno.test(t, "selectSlot() should return an error if slot does not exist", async () => {
    const nonExistentSlotId = "nonExistent" as ID;
    const selectResult = await concept.selectSlot({ slot: nonExistentSlotId });
    assertObjectMatch(selectResult, { error: "Slot with ID nonExistent does not exist in the progression." });
  });

  Deno.test(t, "setChord() should set chord for selected slot", async () => {
    await concept.addSlot(); // Add and select a slot
    const selectedSlotId = (await concept._getProgressionState()).selectedSlotId!;
    const testChord = "Cmaj7";

    await concept.setChord({ chord: testChord });
    const progression = await concept._getProgressionState();
    const slot = progression.slots.find((s) => s.id === selectedSlotId);

    assertExists(slot);
    assertEquals(slot.chord, testChord);
  });

  Deno.test(t, "setChord() should return an error if no slot is selected", async () => {
    // Ensure no slot is selected initially or by removing all slots
    await concept._getProgressionState(); // Initializes if needed
    await concept.deleteSlot(); // Clear any pre-existing selected slot from previous tests if any

    const setResult = await concept.setChord({ chord: "Dmin7" });
    assertObjectMatch(setResult, { error: "No slot is currently selected to set a chord." });
  });

  Deno.test(t, "deleteChord() should remove chord from selected slot", async () => {
    await concept.addSlot(); // Add and select a slot
    const selectedSlotId = (await concept._getProgressionState()).selectedSlotId!;
    await concept.setChord({ chord: "G7" }); // Set a chord

    await concept.deleteChord();
    const progression = await concept._getProgressionState();
    const slot = progression.slots.find((s) => s.id === selectedSlotId);

    assertExists(slot);
    assertEquals(slot.chord, null);
  });

  Deno.test(t, "deleteChord() should return an error if no slot is selected", async () => {
    await concept._getProgressionState(); // Initializes if needed
    await concept.deleteSlot(); // Clear any pre-existing selected slot

    const deleteResult = await concept.deleteChord();
    assertObjectMatch(deleteResult, { error: "No slot is currently selected to delete its chord." });
  });

  Deno.test(t, "deleteSlot() should remove selected slot and deselect it", async () => {
    await concept.addSlot(); // Add slot1
    const slot1Id = (await concept._getProgressionState()).selectedSlotId!;
    await concept.addSlot(); // Add slot2, now selected
    const slot2Id = (await concept._getProgressionState()).selectedSlotId!;

    await concept.deleteSlot(); // Delete slot2
    const progression = await concept._getProgressionState();

    assertEquals(progression.slots.length, 1);
    assertEquals(progression.slots[0].id, slot1Id); // slot1 remains
    assertEquals(progression.selectedSlotId, null); // No slot should be selected

    // Verify slot2 is indeed gone
    const deletedSlot = progression.slots.find((s) => s.id === slot2Id);
    assertEquals(deletedSlot, undefined);
  });

  Deno.test(t, "deleteSlot() should return an error if no slot is selected", async () => {
    await concept._getProgressionState(); // Initializes if needed
    await concept.deleteSlot(); // Clear any pre-existing selected slot

    const deleteResult = await concept.deleteSlot();
    assertObjectMatch(deleteResult, { error: "No slot is currently selected to delete." });
  });

  Deno.test(t, "queries should accurately reflect state", async () => {
    await concept.addSlot(); // Slot 1 selected
    const slot1Id = (await concept._getProgressionState()).selectedSlotId!;
    await concept.setChord({ chord: "Am" });

    await concept.addSlot(); // Slot 2 selected
    const slot2Id = (await concept._getProgressionState()).selectedSlotId!;
    await concept.setChord({ chord: "D7" });

    // _getProgressionState
    const fullState = await concept._getProgressionState();
    assertEquals(fullState.slots.length, 2);
    assertEquals(fullState.selectedSlotId, slot2Id);

    // _getSelectedSlotId
    const selectedId = await concept._getSelectedSlotId();
    assertEquals(selectedId, slot2Id);

    // _getAllSlots
    const allSlots = await concept._getAllSlots();
    assertEquals(allSlots.length, 2);
    assertObjectMatch(allSlots[0], { id: slot1Id, chord: "Am" });
    assertObjectMatch(allSlots[1], { id: slot2Id, chord: "D7" });

    // _findSlotById
    const foundSlot1 = await concept._findSlotById(slot1Id);
    assertObjectMatch(foundSlot1!, { id: slot1Id, chord: "Am" });
    const foundSlot2 = await concept._findSlotById(slot2Id);
    assertObjectMatch(foundSlot2!, { id: slot2Id, chord: "D7" });
    const notFoundSlot = await concept._findSlotById("nonExistent" as ID);
    assertEquals(notFoundSlot, null);
  });

  await client.close(); // Close the database client after all tests in this file
});

// --- Principle Trace ---
Deno.test("Principle Trace: ProgressionBuilder", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  // 1. A user begins with an empty sequence.
  let progression = await concept._getProgressionState();
  assertEquals(progression.slots.length, 0);
  assertEquals(progression.selectedSlotId, null);

  // 2. They add new slots to extend the sequence,
  await concept.addSlot(); // Add first slot (Slot A)
  progression = await concept._getProgressionState();
  assertEquals(progression.slots.length, 1);
  const slotAId = progression.selectedSlotId!; // Slot A should be selected
  assertEquals(progression.slots[0].id, slotAId);
  assertEquals(progression.slots[0].chord, null);

  // 3. select a slot to edit, (Slot A is already selected, so let's add another and then select A)
  await concept.addSlot(); // Add second slot (Slot B)
  progression = await concept._getProgressionState();
  assertEquals(progression.slots.length, 2);
  const slotBId = progression.selectedSlotId!; // Slot B should be selected
  assertEquals(progression.slots[1].id, slotBId);
  assertEquals(progression.slots[1].chord, null);

  await concept.selectSlot({ slot: slotAId }); // Select Slot A
  progression = await concept._getProgressionState();
  assertEquals(progression.selectedSlotId, slotAId);

  // 4. set a musical unit in that slot, (Set chord for Slot A)
  await concept.setChord({ chord: "Cmaj" });
  progression = await concept._getProgressionState();
  assertEquals(progression.slots.find(s => s.id === slotAId)!.chord, "Cmaj");
  assertEquals(progression.slots.find(s => s.id === slotBId)!.chord, null); // Slot B should still be empty

  // 5. and can later remove either the unit or the entire slot.
  // First, remove the unit (chord) from Slot A
  await concept.deleteChord();
  progression = await concept._getProgressionState();
  assertEquals(progression.slots.find(s => s.id === slotAId)!.chord, null);

  // Now, select Slot B and remove the entire slot
  await concept.selectSlot({ slot: slotBId });
  progression = await concept._getProgressionState();
  assertEquals(progression.selectedSlotId, slotBId);

  await concept.deleteSlot(); // Delete Slot B
  progression = await concept._getProgressionState();
  assertEquals(progression.slots.length, 1); // Only Slot A remains
  assertEquals(progression.slots[0].id, slotAId);
  assertEquals(progression.selectedSlotId, null); // No slot should be selected after deletion

  await client.close();
});
```
