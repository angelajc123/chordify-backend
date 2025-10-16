---
timestamp: 'Thu Oct 16 2025 17:33:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_173335.a63d1bda.md]]'
content_id: 68129a04e2c2d75220aa3faaa7542bfc626851b4bd27ce87d1e9f68956df778d
---

# response:

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import ProgressionBuilderConcept from "./ProgressionBuilderConcept.ts";

// Define a placeholder ID for non-existent progressions for testing error paths
const NON_EXISTENT_PROG_ID = "progression:fake" as ID;

Deno.test("ProgressionBuilderConcept", async (t) => {
  let db: Deno.MongoClient["db"];
  let client: Deno.MongoClient;
  let concept: ProgressionBuilderConcept;

  // Setup: Initialize DB and concept instance once for all steps within this test block
  t.beforeAll(async () => {
    [db, client] = await testDb();
    concept = new ProgressionBuilderConcept(db);
  });

  // Teardown: Close the DB client after all tests in this block are complete
  t.afterAll(async () => {
    await client.close();
  });

  /**
   * @trace Principle: User creates, modifies, and reorders a progression.
   * A user creates a new progression, which starts as an empty sequence, and names it.
   * They can add new slots to extend the sequence, and set chords to slots,
   * remove chords from slots, remove slots, or reorder slots.
   */
  await t.step("Principle: User workflow for building a chord progression", async () => {
    // 1. Create a new progression and name it.
    const createResult = await concept.createProgression({ name: "My Favorite Chords" });
    assertNotEquals("error" in createResult, true, "Should create progression successfully");
    const { progression: pId } = createResult as { progression: ID };
    assertExists(pId, "Progression ID should be returned");

    // Initially, the progression should be empty.
    let fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.name, "My Favorite Chords");
    assertEquals(fetchedProg.progression.chordSequence, [], "New progression should have an empty chord sequence");

    // 2. Add new slots to extend the sequence.
    await concept.addSlot({ progressionId: pId }); // Slot 0
    await concept.addSlot({ progressionId: pId }); // Slot 1
    await concept.addSlot({ progressionId: pId }); // Slot 2
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.chordSequence.length, 3, "Progression should have 3 slots");
    assertEquals(fetchedProg.progression.chordSequence[0].chord, null);
    assertEquals(fetchedProg.progression.chordSequence[1].chord, null);
    assertEquals(fetchedProg.progression.chordSequence[2].chord, null);

    // 3. Set chords to slots.
    await concept.setChord({ progressionId: pId, position: 0, chord: "Cmaj" });
    await concept.setChord({ progressionId: pId, position: 1, chord: "G7" });
    await concept.setChord({ progressionId: pId, position: 2, chord: "Am" });
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.chordSequence[0].chord, "Cmaj");
    assertEquals(fetchedProg.progression.chordSequence[1].chord, "G7");
    assertEquals(fetchedProg.progression.chordSequence[2].chord, "Am");
    // Current sequence: [Cmaj, G7, Am]

    // 4. Remove a chord from a slot (set to null).
    await concept.deleteChord({ progressionId: pId, position: 1 }); // Remove G7
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.chordSequence[0].chord, "Cmaj");
    assertEquals(fetchedProg.progression.chordSequence[1].chord, null); // G7 removed
    assertEquals(fetchedProg.progression.chordSequence[2].chord, "Am");
    // Current sequence: [Cmaj, null, Am]

    // 5. Remove a slot.
    await concept.deleteSlot({ progressionId: pId, position: 1 }); // Remove the null slot
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.chordSequence.length, 2, "Progression should have 2 slots after deletion");
    assertEquals(fetchedProg.progression.chordSequence[0].chord, "Cmaj");
    assertEquals(fetchedProg.progression.chordSequence[1].chord, "Am"); // Am shifted to new position 1
    // Current sequence: [Cmaj, Am]

    // 6. Reorder slots.
    await concept.reorderSlots({ progressionId: pId, oldPosition: 1, newPosition: 0 }); // Move Am (index 1) to index 0
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.chordSequence[0].chord, "Am");
    assertEquals(fetchedProg.progression.chordSequence[1].chord, "Cmaj");
    // Current sequence: [Am, Cmaj]

    // 7. Rename the progression
    await concept.renameProgression({ progressionId: pId, name: "Renamed Progression" });
    fetchedProg = (await concept._getProgression({ progressionId: pId })) as { progression: any };
    assertEquals(fetchedProg.progression.name, "Renamed Progression");

    // 8. Delete the progression
    await concept.deleteProgression({ progressionId: pId });
    const deletedProgResult = await concept._getProgression({ progressionId: pId });
    assertEquals("error" in deletedProgResult, true, "Deleted progression should no longer be found");
  });

  await t.step("Action: createProgression", async (t) => {
    await t.step("should create a new empty progression with the given name", async () => {
      const createResult = await concept.createProgression({ name: "Jazz Chords" });
      assertNotEquals("error" in createResult, true, "createProgression should not return an error");
      const { progression: jazzProgId } = createResult as { progression: ID };
      assertExists(jazzProgId, "A progression ID should be returned");

      const fetchedProg = (await concept._getProgression({ progressionId: jazzProgId })) as { progression: any };
      assertEquals(fetchedProg.progression.name, "Jazz Chords");
      assertEquals(fetchedProg.progression.chordSequence, [], "New progression's chord sequence should be empty");
    });
  });

  await t.step("Action: addSlot", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Ensure a fresh progression for each 'addSlot' test case
      const createResult = await concept.createProgression({ name: "Temp Prog for Slot" });
      pId = (createResult as { progression: ID }).progression;
    });

    await t.step("should append a new null slot to an existing progression", async () => {
      await concept.addSlot({ progressionId: pId });
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence.length, 1);
      assertEquals(fetched.progression.chordSequence[0].chord, null);

      await concept.addSlot({ progressionId: pId });
      fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence.length, 2);
      assertEquals(fetched.progression.chordSequence[1].chord, null);
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.addSlot({ progressionId: NON_EXISTENT_PROG_ID });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: setChord", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Ensure a fresh progression with slots for each 'setChord' test case
      const createResult = await concept.createProgression({ name: "Temp Prog for Chord" });
      pId = (createResult as { progression: ID }).progression;
      await concept.addSlot({ progressionId: pId }); // pos 0
      await concept.addSlot({ progressionId: pId }); // pos 1
    });

    await t.step("should set a chord at a valid position", async () => {
      await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, "C");
      assertEquals(fetched.progression.chordSequence[1].chord, null);
    });

    await t.step("should update an existing chord at a valid position", async () => {
      await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
      await concept.setChord({ progressionId: pId, position: 0, chord: "Cmaj7" });
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, "Cmaj7");
    });

    await t.step("should return an error for an invalid position (negative)", async () => {
      const result = await concept.setChord({ progressionId: pId, position: -1, chord: "D" });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: -1. Index out of bounds.");
    });

    await t.step("should return an error for an invalid position (out of bounds)", async () => {
      const result = await concept.setChord({ progressionId: pId, position: 2, chord: "E" }); // Max index is 1
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: 2. Index out of bounds.");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.setChord({ progressionId: NON_EXISTENT_PROG_ID, position: 0, chord: "F" });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: deleteChord", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Ensure a fresh progression with a chord for each 'deleteChord' test case
      const createResult = await concept.createProgression({ name: "Temp Prog for Del Chord" });
      pId = (createResult as { progression: ID }).progression;
      await concept.addSlot({ progressionId: pId });
      await concept.setChord({ progressionId: pId, position: 0, chord: "Am" });
    });

    await t.step("should set chord to null at a valid position", async () => {
      await concept.deleteChord({ progressionId: pId, position: 0 });
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, null);
    });

    await t.step("should return an error for an invalid position", async () => {
      const result = await concept.deleteChord({ progressionId: pId, position: 1 }); // Max index is 0
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: 1. Index out of bounds.");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.deleteChord({ progressionId: NON_EXISTENT_PROG_ID, position: 0 });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: deleteSlot", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Setup a progression with multiple slots and chords
      const createResult = await concept.createProgression({ name: "Temp Prog for Del Slot" });
      pId = (createResult as { progression: ID }).progression;
      await concept.addSlot({ progressionId: pId }); // pos 0 (C)
      await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
      await concept.addSlot({ progressionId: pId }); // pos 1 (F)
      await concept.setChord({ progressionId: pId, position: 1, chord: "F" });
      await concept.addSlot({ progressionId: pId }); // pos 2 (G)
      await concept.setChord({ progressionId: pId, position: 2, chord: "G" });
    }); // Initial sequence: [C, F, G]

    await t.step("should delete a slot at a valid position (middle)", async () => {
      await concept.deleteSlot({ progressionId: pId, position: 1 }); // Delete F
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence.length, 2);
      assertEquals(fetched.progression.chordSequence[0].chord, "C");
      assertEquals(fetched.progression.chordSequence[1].chord, "G"); // G shifted from pos 2 to 1
    }); // Sequence: [C, G]

    await t.step("should delete a slot at a valid position (start)", async () => {
      await concept.deleteSlot({ progressionId: pId, position: 0 }); // Delete C
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence.length, 2);
      assertEquals(fetched.progression.chordSequence[0].chord, "F"); // F shifted from pos 1 to 0
      assertEquals(fetched.progression.chordSequence[1].chord, "G"); // G shifted from pos 2 to 1
    }); // Sequence: [F, G]

    await t.step("should delete a slot at a valid position (end)", async () => {
      await concept.deleteSlot({ progressionId: pId, position: 2 }); // Delete G
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence.length, 2);
      assertEquals(fetched.progression.chordSequence[0].chord, "C");
      assertEquals(fetched.progression.chordSequence[1].chord, "F");
    }); // Sequence: [C, F]

    await t.step("should return an error for an invalid position", async () => {
      const result = await concept.deleteSlot({ progressionId: pId, position: 3 }); // Max index is 2
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: 3. Index out of bounds.");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.deleteSlot({ progressionId: NON_EXISTENT_PROG_ID, position: 0 });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: reorderSlots", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Setup a progression with slots and chords
      const createResult = await concept.createProgression({ name: "Temp Prog for Reorder" });
      pId = (createResult as { progression: ID }).progression;
      await concept.addSlot({ progressionId: pId }); // pos 0 (C)
      await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
      await concept.addSlot({ progressionId: pId }); // pos 1 (F)
      await concept.setChord({ progressionId: pId, position: 1, chord: "F" });
      await concept.addSlot({ progressionId: pId }); // pos 2 (G)
      await concept.setChord({ progressionId: pId, position: 2, chord: "G" });
    }); // Initial sequence: [C, F, G]

    await t.step("should reorder slots correctly (move middle to start)", async () => {
      await concept.reorderSlots({ progressionId: pId, oldPosition: 1, newPosition: 0 }); // Move F to start
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, "F");
      assertEquals(fetched.progression.chordSequence[1].chord, "C");
      assertEquals(fetched.progression.chordSequence[2].chord, "G");
    }); // Expected sequence: [F, C, G]

    await t.step("should reorder slots correctly (move start to end)", async () => {
      await concept.reorderSlots({ progressionId: pId, oldPosition: 0, newPosition: 2 }); // Move C to end
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, "F");
      assertEquals(fetched.progression.chordSequence[1].chord, "G");
      assertEquals(fetched.progression.chordSequence[2].chord, "C");
    }); // Expected sequence: [F, G, C]

    await t.step("should reorder slots correctly (no effective change)", async () => {
      await concept.reorderSlots({ progressionId: pId, oldPosition: 1, newPosition: 1 }); // Move F to same position
      let fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.chordSequence[0].chord, "C");
      assertEquals(fetched.progression.chordSequence[1].chord, "F");
      assertEquals(fetched.progression.chordSequence[2].chord, "G");
    }); // Expected sequence: [C, F, G]

    await t.step("should return an error for an invalid oldPosition", async () => {
      const result = await concept.reorderSlots({ progressionId: pId, oldPosition: -1, newPosition: 0 });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: -1. Index out of bounds.");
    });

    await t.step("should return an error for an invalid newPosition", async () => {
      const result = await concept.reorderSlots({ progressionId: pId, oldPosition: 0, newPosition: 3 }); // Max index is 2
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, "Invalid position: 3. Index out of bounds.");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.reorderSlots({ progressionId: NON_EXISTENT_PROG_ID, oldPosition: 0, newPosition: 1 });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: deleteProgression", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Create a progression to be deleted
      const createResult = await concept.createProgression({ name: "To Delete" });
      pId = (createResult as { progression: ID }).progression;
    });

    await t.step("should delete an existing progression", async () => {
      const deleteResult = await concept.deleteProgression({ progressionId: pId });
      assertEquals("error" in deleteResult, false, "Should delete progression successfully");
      const fetched = await concept._getProgression({ progressionId: pId });
      assertEquals("error" in fetched, true, "Deleted progression should no longer be found");
      assertEquals((fetched as { error: string }).error, `Progression with ID ${pId} not found.`);
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.deleteProgression({ progressionId: NON_EXISTENT_PROG_ID });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Action: renameProgression", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Create a progression to be renamed
      const createResult = await concept.createProgression({ name: "Old Name" });
      pId = (createResult as { progression: ID }).progression;
    });

    await t.step("should rename an existing progression", async () => {
      await concept.renameProgression({ progressionId: pId, name: "New Name" });
      const fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression.name, "New Name");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept.renameProgression({ progressionId: NON_EXISTENT_PROG_ID, name: "Failed Name" });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Query: _getProgression", async (t) => {
    let pId: ID;
    t.beforeEach(async () => {
      // Create a progression to be queried
      const createResult = await concept.createProgression({ name: "Query Prog" });
      pId = (createResult as { progression: ID }).progression;
      await concept.addSlot({ progressionId: pId });
      await concept.setChord({ progressionId: pId, position: 0, chord: "Em" });
    });

    await t.step("should retrieve an existing progression by its ID", async () => {
      const fetched = (await concept._getProgression({ progressionId: pId })) as { progression: any };
      assertEquals(fetched.progression._id, pId);
      assertEquals(fetched.progression.name, "Query Prog");
      assertEquals(fetched.progression.chordSequence[0].chord, "Em");
    });

    await t.step("should return an error for a non-existent progression ID", async () => {
      const result = await concept._getProgression({ progressionId: NON_EXISTENT_PROG_ID });
      assertEquals("error" in result, true);
      assertEquals((result as { error: string }).error, `Progression with ID ${NON_EXISTENT_PROG_ID} not found.`);
    });
  });

  await t.step("Query: _listProgressions", async (t) => {
    await t.step("should return an empty list if no progressions exist", async () => {
      // Clear all progressions before this test
      await concept.progressions.deleteMany({});
      const result = await concept._listProgressions();
      assertEquals(result.progressionIdentifiers.length, 0);
    });

    await t.step("should return a list of all progression identifiers and names", async () => {
      // Create a few progressions
      const { progression: p1 } = (await concept.createProgression({ name: "List Prog 1" })) as { progression: ID };
      const { progression: p2 } = (await concept.createProgression({ name: "List Prog 2" })) as { progression: ID };

      const result = await concept._listProgressions();
      assertEquals(result.progressionIdentifiers.length, 2);

      // Extract names and IDs, then sort for consistent comparison
      const names = result.progressionIdentifiers.map((p) => p.name).sort();
      const ids = result.progressionIdentifiers.map((p) => p.id).sort();

      assertEquals(names, ["List Prog 1", "List Prog 2"]);
      assertEquals(ids, [p1, p2].sort());
    });
  });
});
```
