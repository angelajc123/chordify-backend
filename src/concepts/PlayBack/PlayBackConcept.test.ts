import { assertEquals, assertNotEquals, assertExists } from "jsr:@std/assert";
import { testDb } from "../../utils/database.ts";
import { ID } from "../../utils/types.ts";
import PlayBackConcept from "./PlayBackConcept.ts";
import * as Tonal from "npm:tonal";

const progA = "progression:alpha" as ID;
const progB = "progression:beta" as ID;
const progNonExistent = "progression:nonexistent" as ID;

Deno.test("PlayBack Concept Principle: User sets settings and plays chords/progressions", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    // 1. Initialize settings for progA
    const initResult = await playbackConcept.initializeSettings({ progressionId: progA });
    assertNotEquals("error" in initResult, true, "Initialization should succeed");
    
    const initialSettings = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in initialSettings, true);
    if (!("error" in initialSettings)) {
        assertEquals(initialSettings.settings.instrument, "Piano");
        assertEquals(initialSettings.settings.secondsPerChord, 1);
    } else {
        throw new Error("Expected initial settings to be retrieved");
    }

    // 2. Set instrument and seconds per chord
    const setInstrumentResult = await playbackConcept.setInstrument({
      progressionId: progA,
      instrument: "Guitar",
    });
    assertNotEquals("error" in setInstrumentResult, true, "Setting instrument should succeed");

    const setSecondsResult = await playbackConcept.setSecondsPerChord({
      progressionId: progA,
      secondsPerChord: 2,
    });
    assertNotEquals("error" in setSecondsResult, true, "Setting seconds per chord should succeed");

    const updatedSettings = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.settings.instrument, "Guitar");
        assertEquals(updatedSettings.settings.secondsPerChord, 2);
    } else {
        throw new Error("Expected updated settings to be retrieved");
    }

    // 3. Get chord notes
    const chordNotesResult = await playbackConcept.getChordNotes({ chord: "Cmaj7" });
    assertNotEquals("error" in chordNotesResult, true, "Getting chord notes should succeed");
    if (!("error" in chordNotesResult)) {
        assertEquals(chordNotesResult.notes.sort(), ["B4", "C4", "E4", "G4"]);
    } else {
        throw new Error("Expected notes in playChordResult");
    }


    // 4. Get progression notes
    const progression = ["Cmaj7", "Fmaj7", "G7"];
    const progressionNotesResult = await playbackConcept.getProgressionNotes({ progression });
    assertNotEquals("error" in progressionNotesResult, true, "Getting progression notes should succeed");
    if (!("error" in progressionNotesResult)) {
        assertEquals(progressionNotesResult.notes.length, 3);
        assertEquals(progressionNotesResult.notes[0].sort(), ["B4", "C4", "E4", "G4"]);
        assertEquals(progressionNotesResult.notes[1].sort(), ["A4", "C4", "E4", "F4"]);
        assertEquals(progressionNotesResult.notes[2].sort(), ["B4", "D4", "F4", "G4"]);
    } else {
        throw new Error("Expected notes in progressionNotesResult");
    }

  } finally {
    await client.close();
  }
});

Deno.test("Action: initializeSettings successfully creates default settings", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.initializeSettings({ progressionId: progB });
    assertNotEquals("error" in result, true, "Initialization should succeed");
    if (!("error" in result)) {
        assertEquals(result.settings._id, progB);
        assertEquals(result.settings.instrument, "Piano");
        assertEquals(result.settings.secondsPerChord, 1);

        const settingsInDb = await playbackConcept.getPlayBackSettings({ progressionId: progB });
        assertNotEquals("error" in settingsInDb, true);
        if (!("error" in settingsInDb)) {
            assertEquals(settingsInDb.settings.instrument, "Piano");
            assertEquals(settingsInDb.settings.secondsPerChord, 1);
        } else {
            throw new Error("Expected settings to be retrieved from DB");
        }
    } else {
        throw new Error("Expected initialized settings to be returned");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: initializeSettings returns error if settings already exist", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings({ progressionId: progB }); // First time succeeds
    const result = await playbackConcept.initializeSettings({ progressionId: progB }); // Second time fails
    assertEquals("error" in result, true, "Should return an error if settings already exist");
    assertEquals(
      (result as { error: string }).error,
      `Playback settings already exist for progression ID ${progB}.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setInstrument successfully updates instrument", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings({ progressionId: progA });
    const result = await playbackConcept.setInstrument({
      progressionId: progA,
      instrument: "Synthesizer",
    });
    assertNotEquals("error" in result, true, "Setting instrument should succeed");

    const updatedSettings = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.settings.instrument, "Synthesizer");
    } else {
        throw new Error("Expected updated settings to be retrieved");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: setInstrument returns error if progression settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.setInstrument({
      progressionId: progNonExistent,
      instrument: "Piano",
    });
    assertEquals("error" in result, true, "Should return an error if settings not found");
    assertEquals(
      (result as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setSecondsPerChord successfully updates duration", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings({ progressionId: progA });
    const result = await playbackConcept.setSecondsPerChord({
      progressionId: progA,
      secondsPerChord: 5.5,
    });
    assertNotEquals("error" in result, true, "Setting duration should succeed");

    const updatedSettings = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.settings.secondsPerChord, 5.5);
    } else {
        throw new Error("Expected updated settings to be retrieved");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: setSecondsPerChord returns error if progression settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.setSecondsPerChord({
      progressionId: progNonExistent,
      secondsPerChord: 2,
    });
    assertEquals("error" in result, true, "Should return an error if settings not found");
    assertEquals(
      (result as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setSecondsPerChord returns error for invalid duration", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings({ progressionId: progA });

    let result = await playbackConcept.setSecondsPerChord({
      progressionId: progA,
      secondsPerChord: 0,
    });
    assertEquals("error" in result, true, "Should return error for duration below minimum");
    assertEquals((result as {error: string}).error, "secondsPerChord must be between 1 and 10.");

    result = await playbackConcept.setSecondsPerChord({
      progressionId: progA,
      secondsPerChord: 11,
    });
    assertEquals("error" in result, true, "Should return error for duration above maximum");
    assertEquals((result as {error: string}).error, "secondsPerChord must be between 1 and 10.");

  } finally {
    await client.close();
  }
});

Deno.test("Query: getPlayBackSettings retrieves existing settings", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const initResult = await playbackConcept.initializeSettings({ progressionId: progA });
    assertNotEquals("error" in initResult, true);

    const settings = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in settings, true, "Retrieving settings should succeed");
    if (!("error" in settings)) {
        assertEquals(settings.settings._id, progA);
        assertEquals(settings.settings.instrument, "Piano");
        assertEquals(settings.settings.secondsPerChord, 1);
    } else {
        throw new Error("Expected settings to be retrieved");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Query: getPlayBackSettings returns error if settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const settings = await playbackConcept.getPlayBackSettings({ progressionId: progNonExistent });
    assertEquals("error" in settings, true, "Should return an error if settings not found");
    assertEquals(
      (settings as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: getChordNotes returns correct notes for a valid chord", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.getChordNotes({ chord: "Dmin7" });
    assertNotEquals("error" in result, true, "Getting chord notes should succeed");
    if (!("error" in result)) {
        assertEquals(result.notes.sort(), ["A4", "C4", "D4", "F4"]);
    } else {
        throw new Error("Expected notes in result");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: setInstrument returns error for invalid instrument", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings({ progressionId: progA });
    const result = await playbackConcept.setInstrument({
      progressionId: progA,
      instrument: "Drums",
    });
    assertEquals("error" in result, true, "Should return error for invalid instrument");
    assertEquals(
      (result as { error: string }).error,
      "Instrument must be one of Piano, Guitar, Synthesizer.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: getChordNotes returns error for an invalid chord string", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.getChordNotes({ chord: "InvalidChordXYZ" });
    assertEquals("error" in result, true, "Should return error for invalid chord");
    assertEquals(
      (result as { error: string }).error,
      "Invalid chord specified: 'InvalidChordXYZ'.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: getProgressionNotes returns correct notes for a valid progression", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const progression = ["Cmaj", "G7", "Am"];
    const result = await playbackConcept.getProgressionNotes({ progression });
    assertNotEquals("error" in result, true, "Getting progression notes should succeed");
    if (!("error" in result)) {
        assertEquals(result.notes.length, 3);
        assertEquals(result.notes[0].sort(), ["C4", "E4", "G4"]);
        assertEquals(result.notes[1].sort(), ["B4", "D4", "F4", "G4"]);
        assertEquals(result.notes[2].sort(), ["A4", "C4", "E4"]);
    } else {
        throw new Error("Expected notes in result");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: getProgressionNotes returns error for an invalid chord in progression", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const progression = ["Cmaj", "InvalidChord", "G7"];
    const result = await playbackConcept.getProgressionNotes({ progression });
    assertEquals("error" in result, true, "Should return error for invalid chord in progression");
    assertEquals(
      (result as { error: string }).error,
      "Invalid chord specified: 'InvalidChord'.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteSettings successfully removes settings", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    // Initialize settings
    await playbackConcept.initializeSettings({ progressionId: progA });
    
    // Verify settings exist
    let getResult = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertNotEquals("error" in getResult, true, "Settings should exist before deletion");

    // Delete settings
    const deleteResult = await playbackConcept.deleteSettings({ progressionId: progA });
    assertNotEquals("error" in deleteResult, true, "Deletion should succeed");

    // Verify settings no longer exist
    getResult = await playbackConcept.getPlayBackSettings({ progressionId: progA });
    assertEquals("error" in getResult, true, "Settings should not exist after deletion");
    assertEquals(
      (getResult as { error: string }).error,
      `Playback settings for progression ID ${progA} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: deleteSettings returns error if settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.deleteSettings({ progressionId: progNonExistent });
    assertEquals("error" in result, true, "Should return error if settings not found");
    assertEquals(
      (result as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});