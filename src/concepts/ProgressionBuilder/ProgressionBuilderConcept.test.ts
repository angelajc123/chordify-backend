import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import ProgressionBuilderConcept from "./ProgressionBuilderConcept.ts";

Deno.test("Principle: User creates, modifies, and views a chord progression", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // 1. User creates a new empty progression and names it.
    const createResult = await concept.createProgression({
      name: "My First Progression",
    });
    assertNotEquals("error" in createResult, true, "Progression creation failed.");
    const { progression: createdProgression } = createResult as { progression: any };
    assertExists(createdProgression);
    const progressionId = createdProgression._id;

    // Verify initial state
    let progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    let progression = (progressionResult as { progression: any }).progression;
    assertExists(progression);
    assertEquals(progression.name, "My First Progression");
    assertEquals(progression.chordSequence.length, 0);

    // 2. User adds new slots to extend the sequence.
    await concept.addSlot({ progressionId });
    await concept.addSlot({ progressionId });
    await concept.addSlot({ progressionId });

    // Verify slots were added
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.chordSequence.length, 3);
    assertEquals(progression.chordSequence[0].chord, null);
    assertEquals(progression.chordSequence[1].chord, null);
    assertEquals(progression.chordSequence[2].chord, null);

    // 3. User sets chords to slots.
    await concept.setChord({ progressionId, position: 0, chord: "Cmaj" });
    await concept.setChord({ progressionId, position: 2, chord: "G7" });

    // Verify chords are set
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.chordSequence[0].chord, "Cmaj");
    assertEquals(progression.chordSequence[1].chord, null);
    assertEquals(progression.chordSequence[2].chord, "G7");

    // 4. User reorders slots. (e.g., move Cmaj from 0 to 1)
    await concept.reorderSlots({ progressionId, oldPosition: 0, newPosition: 1 });

    // Verify reorder
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.chordSequence[0].chord, null); // Original pos 1 is now 0
    assertEquals(progression.chordSequence[1].chord, "Cmaj"); // Original pos 0 is now 1
    assertEquals(progression.chordSequence[2].chord, "G7"); // Remains at pos 2

    // 5. User removes a chord from a slot (sets to null).
    await concept.deleteChord({ progressionId, position: 1 }); // Remove Cmaj

    // Verify chord removal
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.chordSequence[1].chord, null);

    // 6. User removes a slot.
    await concept.deleteSlot({ progressionId, position: 0 }); // Remove first null slot

    // Verify slot removal
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.chordSequence.length, 2);
    assertEquals(progression.chordSequence[0].chord, null); // Was pos 1, now 0
    assertEquals(progression.chordSequence[1].chord, "G7"); // Was pos 2, now 1

    // 7. User renames the progression.
    await concept.renameProgression({ progressionId, name: "My Renamed Progression" });
    progressionResult = await concept._getProgression({ progressionId });
    assertNotEquals("error" in progressionResult, true);
    progression = (progressionResult as { progression: any }).progression;
    assertEquals(progression.name, "My Renamed Progression");

    // 8. User lists progressions.
    const listResult = await concept._listProgressions();
    assertEquals(listResult.progressionIdentifiers.length, 1);
    assertEquals(listResult.progressionIdentifiers[0].name, "My Renamed Progression");

    // 9. User deletes the progression.
    await concept.deleteProgression({ progressionId });
    const deletedProgression = await concept._getProgression({ progressionId });
    assertEquals("error" in deletedProgression, true, "Deleted progression should not be found.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: createProgression successfully creates a new progression", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const createResult = await concept.createProgression({ name: "New One" });
    assertNotEquals("error" in createResult, true);
    const { progression } = createResult as { progression: any };
    assertExists(progression);
    const id = progression._id;

    const retrieved = await concept._getProgression({ progressionId: id });
    assertNotEquals("error" in retrieved, true);
    const retrievedProg = (retrieved as { progression: any }).progression;
    assertEquals(retrievedProg.name, "New One");
    assertEquals(retrievedProg.chordSequence.length, 0);
  } finally {
    await client.close();
  }
});

Deno.test("Action: addSlot appends a null slot and requires valid progression ID", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Test Prog",
    })) as { progression: any };
    const pId = progression._id;

    // Valid case
    await concept.addSlot({ progressionId: pId });
    let progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    let prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence.length, 1);
    assertEquals(prog.chordSequence[0].chord, null);

    await concept.addSlot({ progressionId: pId });
    progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence.length, 2);
    assertEquals(prog.chordSequence[1].chord, null);

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult = await concept.addSlot({ progressionId: invalidId });
    assertEquals("error" in errorResult, true);
    assertEquals(
      (errorResult as { error: string }).error,
      `Progression with ID ${invalidId} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setChord updates a slot and requires valid progression ID and position", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Test Prog",
    })) as { progression: any };
    const pId = progression._id;
    await concept.addSlot({ progressionId: pId });
    await concept.addSlot({ progressionId: pId });

    // Valid case
    await concept.setChord({ progressionId: pId, position: 0, chord: "Am" });
    let progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    let prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence[0].chord, "Am");
    assertEquals(prog.chordSequence[1].chord, null);

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult1 = await concept.setChord({
      progressionId: invalidId,
      position: 0,
      chord: "C",
    });
    assertEquals("error" in errorResult1, true);

    // Invalid position (out of bounds)
    const errorResult2 = await concept.setChord({
      progressionId: pId,
      position: 2,
      chord: "C",
    });
    assertEquals("error" in errorResult2, true);
    assertEquals(
      (errorResult2 as { error: string }).error,
      "Invalid position: 2. Index out of bounds.",
    );

    const errorResult3 = await concept.setChord({
      progressionId: pId,
      position: -1,
      chord: "C",
    });
    assertEquals("error" in errorResult3, true);
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteChord sets chord to null and requires valid progression ID and position", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Test Prog",
    })) as { progression: any };
    const pId = progression._id;
    await concept.addSlot({ progressionId: pId });
    await concept.setChord({ progressionId: pId, position: 0, chord: "Am" });

    // Valid case
    await concept.deleteChord({ progressionId: pId, position: 0 });
    const progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    const prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence[0].chord, null);

    // Invalid progression ID (already tested indirectly by other actions, but good to cover)
    const invalidId = "prog:fake" as ID;
    const errorResult1 = await concept.deleteChord({
      progressionId: invalidId,
      position: 0,
    });
    assertEquals("error" in errorResult1, true);

    // Invalid position
    const errorResult2 = await concept.deleteChord({
      progressionId: pId,
      position: 100,
    });
    assertEquals("error" in errorResult2, true);
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteSlot removes a slot and requires valid progression ID and position", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Test Prog",
    })) as { progression: any };
    const pId = progression._id;
    await concept.addSlot({ progressionId: pId }); // pos 0: null
    await concept.addSlot({ progressionId: pId }); // pos 1: null
    await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
    await concept.setChord({ progressionId: pId, position: 1, chord: "G" });

    // Valid case
    await concept.deleteSlot({ progressionId: pId, position: 0 }); // Delete 'C'
    let progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    let prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence.length, 1);
    assertEquals(prog.chordSequence[0].chord, "G"); // 'G' should now be at position 0

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult1 = await concept.deleteSlot({
      progressionId: invalidId,
      position: 0,
    });
    assertEquals("error" in errorResult1, true);

    // Invalid position
    const errorResult2 = await concept.deleteSlot({
      progressionId: pId,
      position: 100,
    });
    assertEquals("error" in errorResult2, true);
  } finally {
    await client.close();
  }
});

Deno.test("Action: reorderSlots reorders slots and requires valid progression ID and positions", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Test Prog",
    })) as { progression: any };
    const pId = progression._id;
    await concept.addSlot({ progressionId: pId }); // 0: null
    await concept.addSlot({ progressionId: pId }); // 1: null
    await concept.addSlot({ progressionId: pId }); // 2: null
    await concept.setChord({ progressionId: pId, position: 0, chord: "C" });
    await concept.setChord({ progressionId: pId, position: 1, chord: "G" });
    await concept.setChord({ progressionId: pId, position: 2, chord: "Am" });
    // Current: [C, G, Am]

    // Valid case: Move C (pos 0) to end (pos 2)
    await concept.reorderSlots({
      progressionId: pId,
      oldPosition: 0,
      newPosition: 2,
    });
    let progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    let prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence.map((s: any) => s.chord), ["G", "Am", "C"]);

    // Valid case: Move Am (pos 1) to start (pos 0)
    await concept.reorderSlots({
      progressionId: pId,
      oldPosition: 1,
      newPosition: 0,
    });
    progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    prog = (progResult as { progression: any }).progression;
    assertEquals(prog.chordSequence.map((s: any) => s.chord), ["Am", "G", "C"]);

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult1 = await concept.reorderSlots({
      progressionId: invalidId,
      oldPosition: 0,
      newPosition: 1,
    });
    assertEquals("error" in errorResult1, true);

    // Invalid oldPosition
    const errorResult2 = await concept.reorderSlots({
      progressionId: pId,
      oldPosition: 100,
      newPosition: 0,
    });
    assertEquals("error" in errorResult2, true);

    // Invalid newPosition
    const errorResult3 = await concept.reorderSlots({
      progressionId: pId,
      oldPosition: 0,
      newPosition: 100,
    });
    assertEquals("error" in errorResult3, true);
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteProgression removes a progression and requires valid ID", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression: prog1 } = (await concept.createProgression({
      name: "Prog 1",
    })) as { progression: any };
    const pId1 = prog1._id;
    const { progression: prog2 } = (await concept.createProgression({
      name: "Prog 2",
    })) as { progression: any };
    const pId2 = prog2._id;

    // Valid case
    await concept.deleteProgression({ progressionId: pId1 });
    const prog1Result = await concept._getProgression({ progressionId: pId1 });
    assertEquals("error" in prog1Result, true, "Progression 1 should be deleted.");

    const prog2Result = await concept._getProgression({ progressionId: pId2 });
    assertNotEquals("error" in prog2Result, true, "Progression 2 should still exist.");

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult = await concept.deleteProgression({
      progressionId: invalidId,
    });
    assertEquals("error" in errorResult, true);
    assertEquals(
      (errorResult as { error: string }).error,
      `Progression with ID ${invalidId} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: renameProgression renames a progression and requires valid ID", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Old Name",
    })) as { progression: any };
    const pId = progression._id;

    // Valid case
    await concept.renameProgression({ progressionId: pId, name: "New Name" });
    const progResult = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in progResult, true);
    const prog = (progResult as { progression: any }).progression;
    assertEquals(prog.name, "New Name");

    // Invalid progression ID
    const invalidId = "prog:fake" as ID;
    const errorResult = await concept.renameProgression({
      progressionId: invalidId,
      name: "Another Name",
    });
    assertEquals("error" in errorResult, true);
    assertEquals(
      (errorResult as { error: string }).error,
      `Progression with ID ${invalidId} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getProgression retrieves a progression or returns error for invalid ID", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    const { progression } = (await concept.createProgression({
      name: "Query Prog",
    })) as { progression: any };
    const pId = progression._id;

    // Valid case
    const result = await concept._getProgression({ progressionId: pId });
    assertNotEquals("error" in result, true);
    const resultProg = (result as { progression: any }).progression;
    assertEquals(resultProg.name, "Query Prog");

    // Invalid ID
    const invalidId = "prog:nonexistent" as ID;
    const errorResult = await concept._getProgression({
      progressionId: invalidId,
    });
    assertEquals("error" in errorResult, true);
    assertEquals(
      (errorResult as { error: string }).error,
      `Progression with ID ${invalidId} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Query: _listProgressions returns all progression identifiers and names", async () => {
  const [db, client] = await testDb();
  const concept = new ProgressionBuilderConcept(db);

  try {
    // No progressions
    let listResult = await concept._listProgressions();
    assertEquals(listResult.progressionIdentifiers.length, 0);

    // One progression
    const { progression: prog1 } = (await concept.createProgression({
      name: "List Prog 1",
    })) as { progression: any };
    const pId1 = prog1._id;
    listResult = await concept._listProgressions();
    assertEquals(listResult.progressionIdentifiers.length, 1);
    assertEquals(listResult.progressionIdentifiers[0].id, pId1);
    assertEquals(listResult.progressionIdentifiers[0].name, "List Prog 1");

    // Multiple progressions
    const { progression: prog2 } = (await concept.createProgression({
      name: "List Prog 2",
    })) as { progression: any };
    const pId2 = prog2._id;
    listResult = await concept._listProgressions();
    assertEquals(listResult.progressionIdentifiers.length, 2);
    const names = listResult.progressionIdentifiers.map((p) => p.name).sort();
    assertEquals(names, ["List Prog 1", "List Prog 2"]);
  } finally {
    await client.close();
  }
});