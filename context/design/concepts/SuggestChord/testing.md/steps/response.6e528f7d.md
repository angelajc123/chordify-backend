---
timestamp: 'Thu Oct 16 2025 19:06:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_190651.208deace.md]]'
content_id: 6e528f7db9e5f9397e403a1b37a11aaf6d50290047c3839c595740bec4e5c748
---

# response:

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import SuggestChordConcept from "./SuggestChordConcept.ts";
import { GeminiLLM } from "@utils/gemini-llm.ts"; // Import the real LLM class to extend it for mocking

// Mock GeminiLLM for predictable testing outcomes
class MockGeminiLLM extends GeminiLLM {
  private mockResponses: Map<string, string> = new Map();
  private errorToThrow: Error | null = null;

  constructor() {
    // Pass a dummy config, as the mock will not make actual API calls
    super({ apiKey: "mock-api-key" });
  }

  /**
   * Sets a mock response for a specific prompt or a prompt containing a substring.
   * @param promptKey A substring of the expected prompt or the full prompt.
   * @param response The string response to return for that prompt.
   */
  setMockResponse(promptKey: string, response: string) {
    this.mockResponses.set(promptKey, response);
  }

  /**
   * Configures the mock to throw a specific error on the next `executeLLM` call.
   */
  setError(error: Error) {
    this.errorToThrow = error;
  }

  async executeLLM(prompt: string): Promise<string> {
    if (this.errorToThrow) {
      const error = this.errorToThrow;
      this.errorToThrow = null; // Reset for subsequent calls
      throw error;
    }

    // Try to find a response based on substring matching
    for (const [key, response] of this.mockResponses.entries()) {
      if (prompt.includes(key)) {
        return Promise.resolve(response);
      }
    }

    // Fallback if no specific mock response is found
    console.warn("No specific mock response found for prompt:", prompt);
    // Provide a generic, plausible default to avoid test failures due to unmocked LLM calls
    if (prompt.includes("Suggest 16 musically appropriate chords")) {
        return Promise.resolve("C,G,Am,F,Dm,E7,A7,D7,G7,Cm,Eb,Ab,Bb,Fm,Db,Gb");
    } else if (prompt.includes("Generate a distinct, musically coherent chord progression")) {
        return Promise.resolve("C,G,Am,F");
    }
    return Promise.resolve(""); // Return empty for unhandled cases
  }
}

// Define some IDs for testing purposes
const progA = "progression:A" as ID;
const progB = "progression:B" as ID;
const progC = "progression:C" as ID;

Deno.test("Principle: User initializes preferences, sets context, and gets suggestions", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  // Set mock responses for LLM calls based on prompt content
  mockLlm.setMockResponse(
    "Suggest 16 musically appropriate chords",
    "C,G,Am,F,Dm,E7,A7,D7,G7,Cm,Eb,Ab,Bb,Fm,Db,Gb",
  );
  mockLlm.setMockResponse(
    "Generate a distinct, musically coherent chord progression",
    "C,G,Am,F",
  );

  try {
    // 1. Initialize preferences for a progression
    const initResult = await concept.initializePreferences({ progression: progA });
    assertNotEquals("error" in initResult, true, "Initialization should succeed");
    const { _id: progressionId } = initResult as { _id: ID };
    assertEquals(progressionId, progA, "Initialized progression ID should match input");
    assertEquals(
      (initResult as any).preferredGenre,
      "Pop",
      "Default genre should be 'Pop'",
    ); // Check default values

    // 2. User sets their preferred genre, complexity, and key
    await concept.setPreferredGenre({ progression: progA, preferredGenre: "Jazz" });
    await concept.setComplexityLevel({ progression: progA, complexityLevel: "Advanced" });
    await concept.setKey({ progression: progA, key: "Dmin" });

    // Verify preferences were set correctly using getProgressionPreferences
    const getPrefsResult = await concept.getProgressionPreferences({ progression: progA });
    assertNotEquals("error" in getPrefsResult, true, "Getting preferences should succeed");
    const { progressionPreferences } = getPrefsResult as any;
    assertEquals(progressionPreferences.preferredGenre, "Jazz", "Genre should be updated to Jazz");
    assertEquals(
      progressionPreferences.complexityLevel,
      "Advanced",
      "Complexity level should be updated to Advanced",
    );
    assertEquals(progressionPreferences.key, "Dmin", "Key should be updated to Dmin");

    // 3. User generates a whole progression
    const suggestProgressionResult = await concept.suggestProgression({
      progression: progA,
      length: 4,
    });
    assertNotEquals("error" in suggestProgressionResult, true, "Progression suggestion should succeed");
    const { chordSequence } = suggestProgressionResult as { chordSequence: string[] };
    assertArrayIncludes(chordSequence, ["C", "G", "Am", "F"], "Suggested progression should match mock"); // Based on mock LLM response

    // 4. User generates suggestions for a single chord in the progression
    const currentChords: (string | null)[] = ["C", null, "G", "Am"];
    const suggestChordResult = await concept.suggestChord({ progression: progA, chords: currentChords, position: 1 });
    assertNotEquals("error" in suggestChordResult, true, "Chord suggestion should succeed");
    const { suggestedChords } = suggestChordResult as { suggestedChords: string[] };
    assertExists(suggestedChords, "Suggested chords array should exist");
    assertArrayIncludes(
      suggestedChords,
      ["C", "G", "Am", "F", "Dm", "E7", "A7", "D7", "G7", "Cm", "Eb", "Ab", "Bb", "Fm", "Db", "Gb"],
      "Suggested chords should match mock",
    ); // Based on mock LLM response
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
    const result1 = await concept.initializePreferences({ progression: progA });
    assertNotEquals("error" in result1, true, "Should initialize successfully for progA");
    const { _id: createdProgressionId } = result1 as { _id: ID };
    assertEquals(createdProgressionId, progA, "Created progression ID should be progA");
    assertEquals((result1 as any).preferredGenre, "Pop", "Default genre should be Pop"); // Check default values

    // Attempt to initialize again for progA (should fail)
    const result2 = await concept.initializePreferences({ progression: progA });
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

Deno.test("Action: setPreferredGenre - successful update and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progression: progA }); // Setup preferences for progA

    // Success case: Update genre for progA
    const setResult = await concept.setPreferredGenre({ progression: progA, preferredGenre: "Rock" });
    assertNotEquals("error" in setResult, true, "Should update genre successfully for progA");

    // Verify the update
    const getResult = await concept.getProgressionPreferences({ progression: progA });
    assertEquals((getResult as any).progressionPreferences.preferredGenre, "Rock", "Genre should be updated to Rock");

    // Non-existent progression: Attempt to update genre for progB
    const nonExistentResult = await concept.setPreferredGenre({ progression: progB, preferredGenre: "Blues" });
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

Deno.test("Action: setComplexityLevel - successful update and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progression: progA }); // Setup preferences for progA

    // Success case: Update complexity for progA
    const setResult = await concept.setComplexityLevel({ progression: progA, complexityLevel: "Intermediate" });
    assertNotEquals("error" in setResult, true, "Should update complexity successfully for progA");

    // Verify the update
    const getResult = await concept.getProgressionPreferences({ progression: progA });
    assertEquals(
      (getResult as any).progressionPreferences.complexityLevel,
      "Intermediate",
      "Complexity level should be updated to Intermediate",
    );

    // Non-existent progression: Attempt to update complexity for progB
    const nonExistentResult = await concept.setComplexityLevel({ progression: progB, complexityLevel: "Advanced" });
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
    await concept.initializePreferences({ progression: progA }); // Setup preferences for progA

    // Success case: Update key for progA
    const setResult = await concept.setKey({ progression: progA, key: "Gmaj" });
    assertNotEquals("error" in setResult, true, "Should update key successfully for progA");

    // Verify the update
    const getResult = await concept.getProgressionPreferences({ progression: progA });
    assertEquals((getResult as any).progressionPreferences.key, "Gmaj", "Key should be updated to Gmaj");

    // Non-existent progression: Attempt to update key for progB
    const nonExistentResult = await concept.setKey({ progression: progB, key: "Amin" });
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

Deno.test("Action: getProgressionPreferences - successful retrieval and non-existent progression", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  try {
    await concept.initializePreferences({ progression: progA });
    await concept.setPreferredGenre({ progression: progA, preferredGenre: "Classical" });

    // Success case: Retrieve preferences for progA
    const getResult = await concept.getProgressionPreferences({ progression: progA });
    assertNotEquals("error" in getResult, true, "Should retrieve preferences successfully");
    const { progressionPreferences } = getResult as any;
    assertEquals(progressionPreferences._id, progA, "Retrieved progression ID should be progA");
    assertEquals(
      progressionPreferences.preferredGenre,
      "Classical",
      "Retrieved genre should match the updated value",
    );

    // Non-existent progression: Attempt to retrieve preferences for progB
    const nonExistentResult = await concept.getProgressionPreferences({ progression: progB });
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

  // Set a simplified mock response for chord suggestions
  mockLlm.setMockResponse("Suggest 16 musically appropriate chords", "C,F,G");

  try {
    await concept.initializePreferences({ progression: progA });
    await concept.setPreferredGenre({ progression: progA, preferredGenre: "Pop" }); // Set some preferences

    const chords: (string | null)[] = ["C", null, "Am", "F"];

    // Requires: progression exists - suggest for non-existent progB
    const nonExistentProgressionResult = await concept.suggestChord({
      progression: progB,
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
      progression: progA,
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
      progression: progA,
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
      progression: progA,
      chords,
      position: 1,
    });
    assertNotEquals("error" in validSuggestion, true, "Valid suggestion should succeed");
    const { suggestedChords } = validSuggestion as { suggestedChords: string[] };
    assertArrayIncludes(suggestedChords, ["C", "F", "G"], "Suggested chords should match mock response"); // Based on mock LLM response

    // Test with a progression containing `null` values, ensuring prompt formatting handles it
    const chordsWithManyNulls: (string | null)[] = [null, null, "Am", null];
    const validSuggestionWithNulls = await concept.suggestChord({
      progression: progA,
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

  // Set a simplified mock response for progression suggestions
  mockLlm.setMockResponse("Generate a distinct, musically coherent chord progression", "C,G,Am,F");

  try {
    await concept.initializePreferences({ progression: progA });
    await concept.setComplexityLevel({ progression: progA, complexityLevel: "Basic" }); // Set some preferences

    // Requires: progression exists - suggest for non-existent progB
    const nonExistentProgressionResult = await concept.suggestProgression({
      progression: progB,
      length: 4,
    });
    assertEquals("error" in nonExistentProgressionResult, true, "Should fail for non-existent progression");
    assertEquals(
      (nonExistentProgressionResult as any).error,
      `Preferences for progression ${progB} not found.`,
      "Error message for non-existent progression mismatch",
    );

    // Requires: length >= 0 - test with negative length
    const invalidLength = await concept.suggestProgression({
      progression: progA,
      length: -1,
    });
    assertEquals("error" in invalidLength, true, "Should fail for negative length");
    assertEquals(
      (invalidLength as any).error,
      `Invalid length: -1. Must be non-negative.`,
      "Error message for negative length mismatch",
    );

    // Effects: returns chord sequence for a valid scenario
    const validSuggestion = await concept.suggestProgression({
      progression: progA,
      length: 4,
    });
    assertNotEquals("error" in validSuggestion, true, "Valid suggestion should succeed");
    const { chordSequence } = validSuggestion as { chordSequence: string[] };
    assertArrayIncludes(chordSequence, ["C", "G", "Am", "F"], "Suggested chord sequence should match mock response"); // Based on mock LLM response

    // Test with length 0
    mockLlm.setMockResponse("Progression Length: 0", ""); // Mock LLM returning empty string for length 0
    const emptyProgression = await concept.suggestProgression({
      progression: progA,
      length: 0,
    });
    assertNotEquals("error" in emptyProgression, true, "Suggestion for length 0 should succeed");
    assertEquals(
      (emptyProgression as any).chordSequence.length,
      0,
      "Chord sequence for length 0 should be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("LLM Error Handling: suggestChord returns error on LLM failure", async () => {
  const [db, client] = await testDb();
  const mockLlm = new MockGeminiLLM();
  const concept = new SuggestChordConcept(db, mockLlm);

  // Configure the mock LLM to throw an error
  mockLlm.setError(new Error("LLM API call failed during chord suggestion"));

  try {
    await concept.initializePreferences({ progression: progA });
    const chords: (string | null)[] = ["C", null, "Am", "F"];

    const result = await concept.suggestChord({ progression: progA, chords, position: 1 });
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

  // Configure the mock LLM to throw an error
  mockLlm.setError(new Error("LLM API call failed during progression suggestion"));

  try {
    await concept.initializePreferences({ progression: progA });
    const result = await concept.suggestProgression({ progression: progA, length: 4 });
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

  // Configure the mock LLM to return an empty string
  mockLlm.setMockResponse("Suggest 16 musically appropriate chords", "");

  try {
    await concept.initializePreferences({ progression: progA });
    const chords: (string | null)[] = ["C", null, "Am", "F"];

    const result = await concept.suggestChord({ progression: progA, chords, position: 1 });
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

  // Configure the mock LLM to return an empty string
  mockLlm.setMockResponse("Generate a distinct, musically coherent chord progression", "");

  try {
    await concept.initializePreferences({ progression: progA });
    const result = await concept.suggestProgression({ progression: progA, length: 4 });
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
```
