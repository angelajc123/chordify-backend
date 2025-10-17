---
timestamp: 'Fri Oct 17 2025 00:33:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_003351.c182db60.md]]'
content_id: 73d7d774f577906024715d3cb89fbab158c1070f3446d65893112d8557cd27c6
---

# file: src/concepts/PlayBack/PlayBackConcept.test.ts

```typescript
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
    const initResult = await playbackConcept.initializeSettings(progA);
    assertNotEquals("error" in initResult, true, "Initialization should succeed");
    
    const initialSettings = await playbackConcept.getProgressionSettings(progA);
    assertNotEquals("error" in initialSettings, true);
    if (!("error" in initialSettings)) {
        assertEquals(initialSettings.instrument, "Grand Piano");
        assertEquals(initialSettings.secondsPerChord, 1);
    } else {
        throw new Error("Expected initial settings to be retrieved");
    }

    // 2. Set instrument and seconds per chord
    const setInstrumentResult = await playbackConcept.setInstrument({
      progression: progA,
      instrument: "Electric Guitar",
    });
    assertNotEquals("error" in setInstrumentResult, true, "Setting instrument should succeed");

    const setSecondsResult = await playbackConcept.setSecondsPerChord({
      progression: progA,
      secondsPerChord: 0.75,
    });
    assertNotEquals("error" in setSecondsResult, true, "Setting seconds per chord should succeed");

    const updatedSettings = await playbackConcept.getProgressionSettings(progA);
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.instrument, "Electric Guitar");
        assertEquals(updatedSettings.secondsPerChord, 0.75);
    } else {
        throw new Error("Expected updated settings to be retrieved");
    }

    // 3. Play a single chord
    const playChordResult = await playbackConcept.playChord({
      progression: progA,
      chord: "Cmaj7",
    });
    assertNotEquals("error" in playChordResult, true, "Playing single chord should succeed");
    if (!("error" in playChordResult)) {
        assertEquals(playChordResult.notes.sort(), Tonal.Chord.get("Cmaj7").notes.sort());
        assertEquals(playChordResult.instrument, "Electric Guitar");
        assertEquals(playChordResult.duration, 0.75);
    } else {
        throw new Error("Expected notes in playChordResult");
    }


    // 4. Play a progression
    const chordSequence = ["Cmaj7", "Fmaj7", null, "G7"];
    const playProgressionResult = await playbackConcept.playProgression({
      progression: progA,
      chordSequence,
    });
    assertNotEquals("error" in playProgressionResult, true, "Playing progression should succeed");
    if (!("error" in playProgressionResult)) {
        assertEquals(playProgressionResult.instrument, "Electric Guitar");
        assertEquals(playProgressionResult.sequence.length, 4);
        
        // Check first chord
        const firstItem = playProgressionResult.sequence[0];
        if ('notes' in firstItem) {
            assertEquals(firstItem.notes.sort(), Tonal.Chord.get("Cmaj7").notes.sort());
            assertEquals(firstItem.duration, 0.75);
        } else {
            throw new Error("Expected first item to be a chord");
        }

        // Check rest
        const thirdItem = playProgressionResult.sequence[2];
        if ('rest' in thirdItem) {
            assertEquals(thirdItem.rest, true);
            assertEquals(thirdItem.duration, 0.75);
        } else {
            throw new Error("Expected third item to be a rest");
        }
    } else {
        throw new Error("Expected sequence in playProgressionResult");
    }

  } finally {
    await client.close();
  }
});

Deno.test("Action: initializeSettings successfully creates default settings", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const result = await playbackConcept.initializeSettings(progB);
    assertNotEquals("error" in result, true, "Initialization should succeed");
    if (!("error" in result)) {
        assertEquals(result._id, progB);
        assertEquals(result.instrument, "Grand Piano");
        assertEquals(result.secondsPerChord, 1);

        const settingsInDb = await playbackConcept.getProgressionSettings(progB);
        assertNotEquals("error" in settingsInDb, true);
        if (!("error" in settingsInDb)) {
            assertEquals(settingsInDb.instrument, "Grand Piano");
            assertEquals(settingsInDb.secondsPerChord, 1);
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
    await playbackConcept.initializeSettings(progB); // First time succeeds
    const result = await playbackConcept.initializeSettings(progB); // Second time fails
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
    await playbackConcept.initializeSettings(progA);
    const result = await playbackConcept.setInstrument({
      progression: progA,
      instrument: "Synthesizer",
    });
    assertNotEquals("error" in result, true, "Setting instrument should succeed");

    const updatedSettings = await playbackConcept.getProgressionSettings(progA);
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.instrument, "Synthesizer");
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
      progression: progNonExistent,
      instrument: "Drums",
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
    await playbackConcept.initializeSettings(progA);
    const result = await playbackConcept.setSecondsPerChord({
      progression: progA,
      secondsPerChord: 1.5,
    });
    assertNotEquals("error" in result, true, "Setting duration should succeed");

    const updatedSettings = await playbackConcept.getProgressionSettings(progA);
    assertNotEquals("error" in updatedSettings, true);
    if (!("error" in updatedSettings)) {
        assertEquals(updatedSettings.secondsPerChord, 1.5);
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
      progression: progNonExistent,
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
    await playbackConcept.initializeSettings(progA);

    let result = await playbackConcept.setSecondsPerChord({
      progression: progA,
      secondsPerChord: 0,
    });
    assertEquals("error" in result, true, "Should return error for zero duration");
    assertEquals((result as {error: string}).error, "secondsPerChord must be a positive number.");

    result = await playbackConcept.setSecondsPerChord({
      progression: progA,
      secondsPerChord: -1,
    });
    assertEquals("error" in result, true, "Should return error for negative duration");
    assertEquals((result as {error: string}).error, "secondsPerChord must be a positive number.");

  } finally {
    await client.close();
  }
});

Deno.test("Query: getProgressionSettings retrieves existing settings", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const initResult = await playbackConcept.initializeSettings(progA);
    assertNotEquals("error" in initResult, true);

    const settings = await playbackConcept.getProgressionSettings(progA);
    assertNotEquals("error" in settings, true, "Retrieving settings should succeed");
    if (!("error" in settings)) {
        assertEquals(settings._id, progA);
        assertEquals(settings.instrument, "Grand Piano");
        assertEquals(settings.secondsPerChord, 1);
    } else {
        throw new Error("Expected settings to be retrieved");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Query: getProgressionSettings returns error if settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const settings = await playbackConcept.getProgressionSettings(progNonExistent);
    assertEquals("error" in settings, true, "Should return an error if settings not found");
    assertEquals(
      (settings as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: playChord returns correct playback data for a valid chord", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings(progA);
    await playbackConcept.setInstrument({ progression: progA, instrument: "Organ" });
    await playbackConcept.setSecondsPerChord({ progression: progA, secondsPerChord: 0.5 });

    const playResult = await playbackConcept.playChord({
      progression: progA,
      chord: "Dmin7",
    });
    assertNotEquals("error" in playResult, true, "Playing valid chord should succeed");
    if (!("error" in playResult)) {
        assertEquals(playResult.notes.sort(), Tonal.Chord.get("Dmin7").notes.sort());
        assertEquals(playResult.instrument, "Organ");
        assertEquals(playResult.duration, 0.5);
    } else {
        throw new Error("Expected notes in playResult");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: playChord returns error if progression settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const playResult = await playbackConcept.playChord({
      progression: progNonExistent,
      chord: "C",
    });
    assertEquals("error" in playResult, true, "Should return error if settings not found");
    assertEquals(
      (playResult as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: playChord returns error for an invalid chord string", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings(progA);
    const playResult = await playbackConcept.playChord({
      progression: progA,
      chord: "InvalidChordXYZ",
    });
    assertEquals("error" in playResult, true, "Should return error for invalid chord");
    assertEquals(
      (playResult as { error: string }).error,
      "Invalid chord specified: 'InvalidChordXYZ'.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: playProgression returns correct playback data for a valid sequence with rests", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings(progA);
    await playbackConcept.setInstrument({ progression: progA, instrument: "Piano" });
    await playbackConcept.setSecondsPerChord({ progression: progA, secondsPerChord: 1.2 });

    const chordSequence = ["Cmaj", null, "G7", "Am"];
    const playResult = await playbackConcept.playProgression({
      progression: progA,
      chordSequence,
    });
    assertNotEquals("error" in playResult, true, "Playing valid progression should succeed");
    if (!("error" in playResult)) {
        assertEquals(playResult.instrument, "Piano");
        assertEquals(playResult.sequence.length, 4);

        // Check Cmaj
        const firstItem = playResult.sequence[0];
        if ('notes' in firstItem) {
            assertEquals(firstItem.notes.sort(), Tonal.Chord.get("Cmaj").notes.sort());
            assertEquals(firstItem.duration, 1.2);
        } else {
            throw new Error("Expected first item to be a chord");
        }

        // Check null (rest)
        const secondItem = playResult.sequence[1];
        if ('rest' in secondItem) {
            assertEquals(secondItem.rest, true);
            assertEquals(secondItem.duration, 1.2);
        } else {
            throw new Error("Expected second item to be a rest");
        }

        // Check G7
        const thirdItem = playResult.sequence[2];
        if ('notes' in thirdItem) {
            assertEquals(thirdItem.notes.sort(), Tonal.Chord.get("G7").notes.sort());
            assertEquals(thirdItem.duration, 1.2);
        } else {
            throw new Error("Expected third item to be a chord");
        }

        // Check Am
        const fourthItem = playResult.sequence[3];
        if ('notes' in fourthItem) {
            assertEquals(fourthItem.notes.sort(), Tonal.Chord.get("Am").notes.sort());
            assertEquals(fourthItem.duration, 1.2);
        } else {
            throw new Error("Expected fourth item to be a chord");
        }
    } else {
        throw new Error("Expected sequence in playResult");
    }
  } finally {
    await client.close();
  }
});

Deno.test("Action: playProgression returns error if progression settings not found", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    const playResult = await playbackConcept.playProgression({
      progression: progNonExistent,
      chordSequence: ["C", "G"],
    });
    assertEquals("error" in playResult, true, "Should return error if settings not found");
    assertEquals(
      (playResult as { error: string }).error,
      `Playback settings for progression ID ${progNonExistent} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: playProgression returns error for an invalid chord string in sequence", async () => {
  const [db, client] = await testDb();
  const playbackConcept = new PlayBackConcept(db);

  try {
    await playbackConcept.initializeSettings(progA);
    const chordSequence = ["Cmaj", "InvalidChord", "G7"];
    const playResult = await playbackConcept.playProgression({
      progression: progA,
      chordSequence,
    });
    assertEquals("error" in playResult, true, "Should return error for invalid chord in sequence");
    assertEquals(
      (playResult as { error: string }).error,
      "Invalid chord specified in sequence: 'InvalidChord'.",
    );
  } finally {
    await client.close();
  }
});
```
