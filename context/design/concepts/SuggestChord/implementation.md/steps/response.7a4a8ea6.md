---
timestamp: 'Thu Oct 16 2025 18:42:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_184246.acd8eb01.md]]'
content_id: 7a4a8ea6f7157a9ed3e2c2815e278a3b5e6171815c00aaded31f6ec4f04103aa
---

# response:

```typescript
// file: src/concepts/SuggestChordConcept.ts

import { Collection, Db, ObjectId } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";
import { GeminiLLM } from "@utils/gemini-llm.ts"; // Import the GeminiLLM class

// Declare collection prefix, use concept name
const PREFIX = "SuggestChord" + ".";

// Generic types of this concept
type Progression = ID;

/**
 * Interface for the state component 'ProgressionSuggestionPreferences'.
 * This maps an external Progression ID to its associated preferences.
 *
 * a set of ProgressionSuggestionPreferences with
 *   a progression of type Progression (this is the _id)
 *   a preferredGenre of type String, default Pop
 *   a complexityLevel of type String, default Basic
 *   a key of type String, default Cmaj
 */
interface ProgressionSuggestionPreferences {
  _id: Progression; // The ID of the progression being referenced
  preferredGenre: string;
  complexityLevel: string;
  key: string;
}

/**
 * @concept SuggestChord
 * @purpose offer users suggestions for suitable chords and progressions based on preferences
 */
export default class SuggestChordConcept {
  private preferences: Collection<ProgressionSuggestionPreferences>;
  private llm: GeminiLLM;

  constructor(db: Db, llm: GeminiLLM) {
    this.preferences = db.collection(PREFIX + "preferences");
    this.llm = llm;
  }

  /**
   * @action initializePreferences
   * @description Creates a new ProgressionSuggestionPreferences for a given progression with default values.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression to initialize preferences for.
   * @returns {Promise<ProgressionSuggestionPreferences | {error: string}>} The newly created preferences or an error.
   * @requires progression does not exist in ProgressionSuggestionPreferences
   * @effects creates a new ProgressionSuggestionPreferences for progression with default values for preferredGenre, complexityLevel, and key.
   */
  async initializePreferences(
    { progression }: { progression: Progression },
  ): Promise<ProgressionSuggestionPreferences | { error: string }> {
    const existing = await this.preferences.findOne({ _id: progression });
    if (existing) {
      return {
        error: `Preferences for progression ${progression} already exist.`,
      };
    }

    const newPreferences: ProgressionSuggestionPreferences = {
      _id: progression,
      preferredGenre: "Pop",
      complexityLevel: "Basic",
      key: "Cmaj",
    };

    await this.preferences.insertOne(newPreferences);
    return newPreferences;
  }

  /**
   * @action setPreferredGenre
   * @description Updates the preferred genre for a given progression's preferences.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression whose preferences to update.
   * @param {string} args.preferredGenre - The new preferred genre.
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error.
   * @requires progression exists in ProgressionSuggestionPreferences
   * @effects updates the ProgressionSuggestionPreferences for progression with the given genre.
   */
  async setPreferredGenre(
    { progression, preferredGenre }: {
      progression: Progression;
      preferredGenre: string;
    },
  ): Promise<Empty | { error: string }> {
    const result = await this.preferences.updateOne(
      { _id: progression },
      { $set: { preferredGenre } },
    );

    if (result.matchedCount === 0) {
      return { error: `Preferences for progression ${progression} not found.` };
    }
    return {};
  }

  /**
   * @action setComplexityLevel
   * @description Updates the complexity level for a given progression's preferences.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression whose preferences to update.
   * @param {string} args.complexityLevel - The new complexity level.
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error.
   * @requires progression exists in ProgressionSuggestionPreferences
   * @effects updates the ProgressionSuggestionPreferences for progression with the given complexityLevel.
   */
  async setComplexityLevel(
    { progression, complexityLevel }: {
      progression: Progression;
      complexityLevel: string;
    },
  ): Promise<Empty | { error: string }> {
    const result = await this.preferences.updateOne(
      { _id: progression },
      { $set: { complexityLevel } },
    );

    if (result.matchedCount === 0) {
      return { error: `Preferences for progression ${progression} not found.` };
    }
    return {};
  }

  /**
   * @action setKey
   * @description Updates the key for a given progression's preferences.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression whose preferences to update.
   * @param {string} args.key - The new key.
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error.
   * @requires progression exists in ProgressionSuggestionPreferences
   * @effects updates the ProgressionSuggestionPreferences for progression with the given key.
   */
  async setKey(
    { progression, key }: { progression: Progression; key: string },
  ): Promise<Empty | { error: string }> {
    const result = await this.preferences.updateOne(
      { _id: progression },
      { $set: { key } },
    );

    if (result.matchedCount === 0) {
      return { error: `Preferences for progression ${progression} not found.` };
    }
    return {};
  }

  /**
   * @action getProgressionPreferences
   * @description Retrieves the progression suggestion preferences for a given progression.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression to retrieve preferences for.
   * @returns {Promise<{progressionPreferences: ProgressionSuggestionPreferences} | {error: string}>} The preferences or an error.
   * @effects returns the ProgressionSuggestionPreferences for progression.
   */
  async getProgressionPreferences(
    { progression }: { progression: Progression },
  ): Promise<
    { progressionPreferences: ProgressionSuggestionPreferences } | {
      error: string;
    }
  > {
    const prefs = await this.preferences.findOne({ _id: progression });
    if (!prefs) {
      return { error: `Preferences for progression ${progression} not found.` };
    }
    return { progressionPreferences: prefs };
  }

  /**
   * @action suggestChord
   * @description Returns a list of suggested chords for a specific position in a progression,
   *              generated by an LLM based on user preferences.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression to suggest for.
   * @param {(string | null)[]} args.chords - The current chord sequence, with null for unknown chords.
   * @param {number} args.position - The position in the sequence for which to suggest chords.
   * @returns {Promise<{suggestedChords: string[]} | {error: string}>} A list of suggested chords or an error.
   * @requires progression exists in ProgressionSuggestionPreferences, 0 <= position < chords.length
   * @effects returns a list of suggested chords to put in position in chords, generated by an LLM
   *          given the context of the ProgressionSuggestionPreferences for progression and the chords before and after it.
   */
  async suggestChord(
    { progression, chords, position }: {
      progression: Progression;
      chords: (string | null)[];
      position: number;
    },
  ): Promise<{ suggestedChords: string[] } | { error: string }> {
    if (position < 0 || position >= chords.length) {
      return { error: `Invalid position: ${position}. Must be within 0 and ${chords.length - 1}.` };
    }

    const prefs = await this.preferences.findOne({ _id: progression });
    if (!prefs) {
      return { error: `Preferences for progression ${progression} not found.` };
    }

    const currentProgressionString = chords.map((c) => c === null ? "[MISSING]" : c).join(" - ");

    const prompt = `
      You are a music theory assistant.
      Given the following preferences for a chord progression:
      - Genre: ${prefs.preferredGenre}
      - Complexity: ${prefs.complexityLevel}
      - Key: ${prefs.key}

      The current progression is: "${currentProgressionString}"
      I need suggestions for the chord at position ${position} (0-indexed), which is currently represented as [MISSING].
      Considering the chords before and after this position, suggest 3 suitable chords.
      Please provide your suggestions as a comma-separated list of chord names (e.g., "Cmaj7, G7, Am").
      Do not include any other text or explanation.
    `;

    try {
      const llmResponse = await this.llm.executeLLM(prompt);
      // Attempt to parse the comma-separated string
      const suggestedChords = llmResponse
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean); // Filter out empty strings

      if (suggestedChords.length === 0) {
        return { error: "LLM did not return valid chord suggestions." };
      }

      return { suggestedChords };
    } catch (e) {
      console.error(`Error during LLM chord suggestion: ${e.message}`);
      return { error: `Failed to get chord suggestions: ${e.message}` };
    }
  }

  /**
   * @action suggestProgression
   * @description Returns a complete chord progression of a specified length,
   *              generated by an LLM based on user preferences.
   * @param {object} args - The arguments for the action.
   * @param {Progression} args.progression - The ID of the progression to suggest for.
   * @param {number} args.length - The desired length of the chord progression.
   * @returns {Promise<{chordSequence: string[]} | {error: string}>} A complete chord sequence or an error.
   * @requires progression exists in ProgressionSuggestionPreferences, length >= 0
   * @effects returns a chord progression of length length, generated by an LLM
   *          given the context of the ProgressionSuggestionPreferences for progression.
   */
  async suggestProgression(
    { progression, length }: { progression: Progression; length: number },
  ): Promise<{ chordSequence: string[] } | { error: string }> {
    if (length < 0) {
      return { error: `Invalid length: ${length}. Must be non-negative.` };
    }

    const prefs = await this.preferences.findOne({ _id: progression });
    if (!prefs) {
      return { error: `Preferences for progression ${progression} not found.` };
    }

    const prompt = `
      You are a music theory assistant.
      Given the following preferences for a chord progression:
      - Genre: ${prefs.preferredGenre}
      - Complexity: ${prefs.complexityLevel}
      - Key: ${prefs.key}

      Generate a complete chord progression of ${length} chords.
      Please provide your progression as a comma-separated list of chord names (e.g., "Cmaj7, G7, Am, Fmaj7").
      Do not include any other text or explanation.
    `;

    try {
      const llmResponse = await this.llm.executeLLM(prompt);
      // Attempt to parse the comma-separated string
      const chordSequence = llmResponse
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean); // Filter out empty strings

      if (chordSequence.length === 0) {
        return { error: "LLM did not return a valid chord progression." };
      }
      if (chordSequence.length !== length) {
          console.warn(`LLM returned ${chordSequence.length} chords but ${length} were requested. Adjusting.`);
          // If LLM doesn't match length, try to truncate/pad. For simplicity, just return what was given.
      }

      return { chordSequence };
    } catch (e) {
      console.error(`Error during LLM progression suggestion: ${e.message}`);
      return { error: `Failed to get progression suggestion: ${e.message}` };
    }
  }
}

```
