import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import SuggestChordConcept from "./SuggestChordConcept.ts";
import { GeminiLLM } from "@utils/gemini-llm.ts";

class MockGeminiLLM extends GeminiLLM {
  private mockResponses: Map<string, string> = new Map();
  private errorToThrow: Error | null = null;

  constructor() {
    super({ apiKey: "mock-api-key" });
  }

  setMockResponse(promptKey: string, response: string) {
    this.mockResponses.set(promptKey, response);
  }

  setError(error: Error) {
    this.errorToThrow = error;
  }

  override async executeLLM(prompt: string): Promise<string> {
    if (this.errorToThrow) {
      const error = this.errorToThrow;
      this.errorToThrow = null; // Reset for subsequent calls
      throw error;
    }

    for (const [key, response] of this.mockResponses.entries()) {
      if (prompt.includes(key)) {
        return Promise.resolve(response);
      }
    }

    console.warn("No specific mock response found for prompt:", prompt);
    if (prompt.includes("Suggest 48 musically appropriate chords")) {
        return Promise.resolve("C,G,Am,F,Dm,E7,A7,D7,G7,Cm,Eb,Ab,Bb,Fm,Db,Gb,C7,Gm,Fmaj7,Em,Bm,D,A,E");
    } else if (prompt.includes("Generate 6 distinct, musically coherent chord progressions")) {
        return Promise.resolve("C G Am F\nDm G C Am\nF G C Am");
    }
    return Promise.resolve("");
  }
}

const progA = "progression:A" as ID;
const progB = "progression:B" as ID;
const progC = "progression:C" as ID;

Deno.test("Principle: User initializes preferences, sets context, and gets suggestions", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setMockResponse(
    "Suggest 48 musically appropriate chords",
    "C,G,Am,F,Dm,E7,A7,D7,G7,Cm,Eb,Ab,Bb,Fm,Db,Gb,C7,Gm,Fmaj7,Em,Bm,D,A,E",
  );
  mockLlm.setMockResponse(
    "Generate 6 distinct, musically coherent chord progressions",
    "C G Am F\nDm G C Am\nF G C Am",
  );

  try {
    // 1. Initialize preferences for a progression
    const initResult = await concept.initializePreferences({ progressionId: progA });
    assertNotEquals("error" in initResult, true, "Initialization should succeed");
    const { preferences } = initResult as { preferences: any };
    assertEquals(preferences._id, progA, "Initialized progression ID should match input");
    assertEquals(
      preferences.genre,
      "Pop",
      "Default genre should be 'Pop'",
    );

    // 2. User sets their preferred genre, complexity, and key
    await concept.setGenre({ progressionId: progA, genre: "Jazz" });
    await concept.setComplexity({ progressionId: progA, complexity: "Advanced" });
    await concept.setKey({ progressionId: progA, key: "D" });

    const getPrefsResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertNotEquals("error" in getPrefsResult, true, "Getting preferences should succeed");
    const { preferences: updatedPrefs } = getPrefsResult as any;
    assertEquals(updatedPrefs.genre, "Jazz", "Genre should be updated to Jazz");
    assertEquals(
      updatedPrefs.complexity,
      "Advanced",
      "Complexity level should be updated to Advanced",
    );
    assertEquals(updatedPrefs.key, "D", "Key should be updated to D");

    // 3. User generates a whole progression
    const suggestProgressionResult = await concept.suggestProgression({
      progressionId: progA,
      length: 4,
    });
    assertNotEquals("error" in suggestProgressionResult, true, "Progression suggestion should succeed");
    const { suggestedProgressions } = suggestProgressionResult as { suggestedProgressions: string[][] };
    assertEquals(suggestedProgressions.length > 0, true, "Should return at least one progression");
    assertArrayIncludes(suggestedProgressions[0], ["C", "G", "Am", "F"], "First suggested progression should match mock"); // Based on mock LLM response

    // 4. User generates suggestions for a single chord in the progression
    const currentChords: (string | null)[] = ["C", null, "G", "Am"];
    const suggestChordResult = await concept.suggestChord({ progressionId: progA, chords: currentChords, position: 1 });
    assertNotEquals("error" in suggestChordResult, true, "Chord suggestion should succeed");
    const { suggestedChords } = suggestChordResult as { suggestedChords: string[] };
    assertExists(suggestedChords, "Suggested chords array should exist");
    assertArrayIncludes(
      suggestedChords,
      ["C", "G", "Am", "F", "Dm", "E7", "A7", "D7"],
      "Suggested chords should match mock",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: initializePreferences - successful creation and existing progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    // Success case: Initialize for progA
    const result1 = await concept.initializePreferences({ progressionId: progA });
    assertNotEquals("error" in result1, true, "Should initialize successfully for progA");
    const { preferences: prefs1 } = result1 as { preferences: any };
    assertEquals(prefs1._id, progA, "Created progression ID should be progA");
    assertEquals(prefs1.genre, "Pop", "Default genre should be Pop"); // Check default values

    // Attempt to initialize again for progA (should fail)
    const result2 = await concept.initializePreferences({ progressionId: progA });
    assertEquals("error" in result2, true, "Should fail if preferences for progression already exist");
    assertEquals(
      (result2 as any).error,
      `Preferences for progression ${progA} already exist.`,
      "Error message for existing preferences mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setGenre - successful update and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progressionId: progA });

    // Success case: Update genre for progA
    const setResult = await concept.setGenre({ progressionId: progA, genre: "Rock" });
    assertNotEquals("error" in setResult, true, "Should update genre successfully for progA");

    // Verify the update
    const getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertEquals((getResult as any).preferences.genre, "Rock", "Genre should be updated to Rock");

    // Non-existent progression: Attempt to update genre for progB
    const nonExistentResult = await concept.setGenre({ progressionId: progB, genre: "Rock" });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setComplexity - successful update and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progressionId: progA });

    // Success case: Update complexity for progA
    const setResult = await concept.setComplexity({ progressionId: progA, complexity: "Intermediate" });
    assertNotEquals("error" in setResult, true, "Should update complexity successfully for progA");

    // Verify the update
    const getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertEquals(
      (getResult as any).preferences.complexity,
      "Intermediate",
      "Complexity level should be updated to Intermediate",
    );

    // Non-existent progression: Attempt to update complexity for progB
    const nonExistentResult = await concept.setComplexity({ progressionId: progB, complexity: "Advanced" });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: setKey - successful update and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progressionId: progA });

    // Success case: Update key for progA
    const setResult = await concept.setKey({ progressionId: progA, key: "G" });
    assertNotEquals("error" in setResult, true, "Should update key successfully for progA");

    // Verify the update
    const getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertEquals((getResult as any).preferences.key, "G", "Key should be updated to G");

    // Non-existent progression: Attempt to update key for progB
    const nonExistentResult = await concept.setKey({ progressionId: progB, key: "A" });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: getSuggestionPreferences - successful retrieval and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progressionId: progA });
    await concept.setGenre({ progressionId: progA, genre: "Classical" });

    // Success case: Retrieve preferences for progA
    const getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertNotEquals("error" in getResult, true, "Should retrieve preferences successfully");
    const { preferences } = getResult as any;
    assertEquals(preferences._id, progA, "Retrieved progression ID should be progA");
    assertEquals(
      preferences.genre,
      "Classical",
      "Retrieved genre should match the updated value",
    );

    // Non-existent progression: Attempt to retrieve preferences for progB
    const nonExistentResult = await concept.getSuggestionPreferences({ progressionId: progB });
    assertEquals("error" in nonExistentResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: suggestChord - requirements and effects", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setMockResponse("Suggest 48 musically appropriate chords", "C,F,G");

  try {
    await concept.initializePreferences({ progressionId: progA });
    await concept.setGenre({ progressionId: progA, genre: "Pop" });

    const chords: (string | null)[] = ["C", null, "Am", "F"];

    // Requires: progression exists - suggest for non-existent progB
    const nonExistentProgressionResult = await concept.suggestChord({
      progressionId: progB,
      chords,
      position: 1,
    });
    assertEquals("error" in nonExistentProgressionResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentProgressionResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );

    // Requires: 0 <= position < chords.length - test with negative position
    const invalidPositionNegative = await concept.suggestChord({
      progressionId: progA,
      chords,
      position: -1,
    });
    assertEquals("error" in invalidPositionNegative, true, "Should fail for negative position");
    assertEquals(
      (invalidPositionNegative as any).error,
      `Invalid position: -1. Must be within 0 and ${chords.length - 1}.`,
      "Error message for negative position mismatch",
    );

    // Requires: 0 <= position < chords.length - test with position out of bounds (chords.length)
    const invalidPositionTooHigh = await concept.suggestChord({
      progressionId: progA,
      chords,
      position: chords.length, // Out of bounds
    });
    assertEquals("error" in invalidPositionTooHigh, true, "Should fail for position out of bounds");
    assertEquals(
      (invalidPositionTooHigh as any).error,
      `Invalid position: ${chords.length}. Must be within 0 and ${chords.length - 1}.`,
      "Error message for out-of-bounds position mismatch",
    );

    // Effects: returns suggested chords for a valid scenario
    const validSuggestion = await concept.suggestChord({
      progressionId: progA,
      chords,
      position: 1,
    });
    assertNotEquals("error" in validSuggestion, true, "Valid suggestion should succeed");
    const { suggestedChords } = validSuggestion as { suggestedChords: string[] };
    assertArrayIncludes(suggestedChords, ["C", "F", "G"], "Suggested chords should match mock response");
    
    // Test with a progression containing `null` values, ensuring prompt formatting handles it
    const chordsWithManyNulls: (string | null)[] = [null, null, "Am", null];
    const validSuggestionWithNulls = await concept.suggestChord({
      progressionId: progA,
      chords: chordsWithManyNulls,
      position: 1,
    });
    assertNotEquals("error" in validSuggestionWithNulls, true, "Valid suggestion with nulls should succeed");
    assertExists((validSuggestionWithNulls as any).suggestedChords, "Suggested chords array should exist");
  } finally {
    await client.close();
  }
});

Deno.test("Action: suggestProgression - requirements and effects", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setMockResponse("Generate 6 distinct, musically coherent chord progressions", "C G Am F\nDm G C Am\nF G C Am");

  try {
    await concept.initializePreferences({ progressionId: progA });
    await concept.setComplexity({ progressionId: progA, complexity: "Simple" });

    // Requires: progression exists - suggest for non-existent progB
    const nonExistentProgressionResult = await concept.suggestProgression({
      progressionId: progB,
      length: 4,
    });
    assertEquals("error" in nonExistentProgressionResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentProgressionResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );

    // Requires: length > 0 - test with negative length
    const invalidLength = await concept.suggestProgression({
      progressionId: progA,
      length: -1,
    });
    assertEquals("error" in invalidLength, true, "Should fail for negative length");
    assertEquals(
      (invalidLength as any).error,
      `Invalid length: -1. Must be greater than 0.`,
      "Error message for negative length mismatch",
    );

    // Requires: length > 0 - test with 0 length
    const invalidLengthZero = await concept.suggestProgression({
      progressionId: progA,
      length: 0,
    });
    assertEquals("error" in invalidLengthZero, true, "Should fail for 0 length");
    assertEquals(
      (invalidLengthZero as any).error,
      `Invalid length: 0. Must be greater than 0.`,
      "Error message for 0 length mismatch",
    );

    // Effects: returns suggested progressions for a valid scenario
    const validSuggestion = await concept.suggestProgression({
      progressionId: progA,
      length: 4,
    });
    assertNotEquals("error" in validSuggestion, true, "Valid suggestion should succeed");
    const { suggestedProgressions } = validSuggestion as { suggestedProgressions: string[][] };
    assertEquals(suggestedProgressions.length > 0, true, "Should return at least one progression");
    assertEquals(suggestedProgressions[0].length, 4, "Each progression should have the requested length");
    assertArrayIncludes(suggestedProgressions[0], ["C", "G", "Am", "F"], "First suggested progression should match mock response"); // Based on mock LLM response
  } finally {
    await client.close();
  }
});

Deno.test("LLM Error Handling: suggestChord returns error on LLM failure", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setError(new Error("LLM API call failed during chord suggestion"));

  try {
    await concept.initializePreferences({ progressionId: progA });
    const chords: (string | null)[] = ["C", null, "Am", "F"];

    const result = await concept.suggestChord({ progressionId: progA, chords, position: 1 });
    assertEquals("error" in result, true, "Should return an error when LLM fails");
    assertEquals(
      (result as any).error,
      "Failed to get chord suggestions: LLM API call failed during chord suggestion",
      "Error message for LLM failure mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("LLM Error Handling: suggestProgression returns error on LLM failure", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setError(new Error("LLM API call failed during progression suggestion"));

  try {
    await concept.initializePreferences({ progressionId: progA });
    const result = await concept.suggestProgression({ progressionId: progA, length: 4 });
    assertEquals("error" in result, true, "Should return an error when LLM fails");
    assertEquals(
      (result as any).error,
      "Failed to get progression suggestion: LLM API call failed during progression suggestion",
      "Error message for LLM failure mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("LLM Empty Response Handling: suggestChord returns error if LLM provides no suggestions", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setMockResponse("Suggest 48 musically appropriate chords", "");

  try {
    await concept.initializePreferences({ progressionId: progA });
    const chords: (string | null)[] = ["C", null, "Am", "F"];

    const result = await concept.suggestChord({ progressionId: progA, chords, position: 1 });
    assertEquals("error" in result, true, "Should return an error when LLM provides empty suggestions");
    assertEquals(
      (result as any).error,
      "LLM did not return valid chord suggestions.",
      "Error message for empty LLM response mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("LLM Empty Response Handling: suggestProgression returns error if LLM provides no progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  mockLlm.setMockResponse("Generate 6 distinct, musically coherent chord progressions", "");

  try {
    await concept.initializePreferences({ progressionId: progA });
    const result = await concept.suggestProgression({ progressionId: progA, length: 4 });
    assertEquals("error" in result, true, "Should return an error when LLM provides empty progression");
    assertEquals(
      (result as any).error,
      "LLM did not return a valid chord progression.",
      "Error message for empty LLM response mismatch",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: deletePreferences successfully removes preferences", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    // Initialize preferences
    await concept.initializePreferences({ progressionId: progA });
    
    // Verify preferences exist
    let getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertNotEquals("error" in getResult, true, "Preferences should exist before deletion");

    // Delete preferences
    const deleteResult = await concept.deletePreferences({ progressionId: progA });
    assertNotEquals("error" in deleteResult, true, "Deletion should succeed");

    // Verify preferences no longer exist
    getResult = await concept.getSuggestionPreferences({ progressionId: progA });
    assertEquals("error" in getResult, true, "Preferences should not exist after deletion");
    assertEquals(
      (getResult as { error: string }).error,
      `Preferences for progression ${progA} not found.`,
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: deletePreferences returns error if preferences not found", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    const result = await concept.deletePreferences({ progressionId: progC });
    assertEquals("error" in result, true, "Should return error if preferences not found");
    assertEquals(
      (result as { error: string }).error,
      `Preferences for progression ${progC} not found.`,
    );
  } finally {
    await client.close();
  }
});