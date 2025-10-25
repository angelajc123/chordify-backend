[@api-extraction-from-spec](api-extraction-from-spec.md)

# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementations and generate the API documentation based on these instructions.

[@concept-implementation-playback](../../src/concepts/PlayBack/PlayBack.ts)

[@concept-implementation-progression-builder](../../src/concepts/ProgressionBuilder/ProgressionBuilder.ts)

[@concept-implementation-suggest-chord](../../src/concepts/SuggestChord/SuggestChord.ts)
# response:

# API Specification: PlayBack Concept

**Purpose:** Manages and retrieves playback settings for musical chord progressions, and provides musical information about chords.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Initializes default playback settings for a given progression ID.

**Requirements:**
- Playback settings for the `progressionId` must not already exist.

**Effects:**
- A new `PlaybackSettings` entry is created with default instrument "Piano" and `secondsPerChord` of 1. The new settings are returned.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "settings": {
    "_id": "ID",
    "instrument": "string",
    "secondsPerChord": "number"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/setInstrument

**Description:** Sets the instrument for playback of a specified progression.

**Requirements:**
- The `instrument` must be one of the predefined valid instruments (e.g., "Piano", "Guitar").
- Playback settings for the `progressionId` must exist.

**Effects:**
- The `instrument` for the `progressionId`'s playback settings is updated.

**Request Body:**
```json
{
  "progressionId": "ID",
  "instrument": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/setSecondsPerChord

**Description:** Sets the duration, in seconds, for each chord in a specified progression.

**Requirements:**
- `secondsPerChord` must be between `MIN_SECONDS_PER_CHORD` and `MAX_SECONDS_PER_CHORD`.
- Playback settings for the `progressionId` must exist.

**Effects:**
- The `secondsPerChord` for the `progressionId`'s playback settings is updated.

**Request Body:**
```json
{
  "progressionId": "ID",
  "secondsPerChord": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/getPlayBackSettings

**Description:** Retrieves the current playback settings for a specific progression.

**Requirements:**
- Playback settings for the `progressionId` must exist.

**Effects:**
- Returns the `PlaybackSettings` object for the given `progressionId`.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "settings": {
    "_id": "ID",
    "instrument": "string",
    "secondsPerChord": "number"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/getChordNotes

**Description:** Retrieves the individual notes that comprise a given chord symbol.

**Requirements:**
- The `chord` string must represent a valid chord (e.g., "Cmaj7", "Am").

**Effects:**
- Returns an array of notes (e.g., "C", "E", "G") for the specified `chord`.

**Request Body:**
```json
{
  "chord": "string"
}
```

**Success Response Body (Action):**
```json
{
  "notes": [
    "string"
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/getProgressionNotes

**Description:** Retrieves the notes for each chord in a provided progression sequence.

**Requirements:**
- All chords in the `progression` array must be valid chord symbols.

**Effects:**
- Returns a nested array where each inner array contains the notes for a corresponding chord in the `progression`.

**Request Body:**
```json
{
  "progression": [
    "string"
  ]
}
```

**Success Response Body (Action):**
```json
{
  "notes": [
    [
      "string"
    ]
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: ProgressionBuilder Concept

**Purpose:** Allows users to create, modify, and manage musical chord progressions.

---

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Creates a new empty chord progression with a given name.

**Requirements:**
- `name` should be a non-empty string.

**Effects:**
- A new `Progression` object is created with a unique ID and an empty list of chords.
- The newly created `Progression` is returned.

**Request Body:**
```json
{
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progression": {
    "_id": "ID",
    "name": "string",
    "chords": []
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/addSlot

**Description:** Adds an empty chord slot to the end of a specified progression.

**Requirements:**
- The `progressionId` must correspond to an existing progression.

**Effects:**
- A new slot with a `null` chord value is appended to the `chords` array of the progression.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/setChord

**Description:** Sets a chord at a specific position within a progression.

**Requirements:**
- The `progressionId` must correspond to an existing progression.
- The `position` must be a valid zero-indexed number within the progression's chord slots (i.e., `0 <= position < chords.length`).
- The `chord` string must represent a valid chord symbol (e.g., "Cmaj7", "Am").

**Effects:**
- The chord at the specified `position` in the `progressionId`'s `chords` array is updated to the new `chord` value.

**Request Body:**
```json
{
  "progressionId": "ID",
  "position": "number",
  "chord": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/deleteChord

**Description:** Clears the chord at a specific position within a progression, setting it to null.

**Requirements:**
- The `progressionId` must correspond to an existing progression.
- The `position` must be a valid zero-indexed number within the progression's chord slots.

**Effects:**
- The chord at the specified `position` in the `progressionId`'s `chords` array is set to `null`.

**Request Body:**
```json
{
  "progressionId": "ID",
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/deleteSlot

**Description:** Removes a chord slot entirely from a progression at a specific position.

**Requirements:**
- The `progressionId` must correspond to an existing progression.
- The `position` must be a valid zero-indexed number within the progression's chord slots.

**Effects:**
- The slot at the specified `position` is removed from the `chords` array of the progression, and subsequent slots are shifted.

**Request Body:**
```json
{
  "progressionId": "ID",
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/reorderSlots

**Description:** Changes the position of a chord slot within a progression.

**Requirements:**
- The `progressionId` must correspond to an existing progression.
- Both `oldPosition` and `newPosition` must be valid zero-indexed numbers within the progression's chord slots.

**Effects:**
- The chord slot originally at `oldPosition` is moved to `newPosition`, and other slots are shifted accordingly to maintain sequence.

**Request Body:**
```json
{
  "progressionId": "ID",
  "oldPosition": "number",
  "newPosition": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/deleteProgression

**Description:** Deletes an entire chord progression.

**Requirements:**
- The `progressionId` must correspond to an existing progression.

**Effects:**
- The `Progression` identified by `progressionId` is removed from the system.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/renameProgression

**Description:** Renames an existing chord progression.

**Requirements:**
- The `progressionId` must correspond to an existing progression.
- `name` should be a non-empty string.

**Effects:**
- The `name` of the `Progression` identified by `progressionId` is updated to the new `name`.

**Request Body:**
```json
{
  "progressionId": "ID",
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/getProgression

**Description:** Retrieves the full details of a specific chord progression, including its name and all chord slots.

**Requirements:**
- The `progressionId` must correspond to an existing progression.

**Effects:**
- Returns the `Progression` object for the given `progressionId`.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "progression": {
    "_id": "ID",
    "name": "string",
    "chords": [
      {
        "chord": "string | null"
      }
    ]
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/listProgressions

**Description:** Lists all available chord progressions by their ID and name.

**Requirements:**
- None.

**Effects:**
- Returns an object containing an array of progression identifiers, each with an `id` and `name`.

**Request Body:**
```json
{}
```

**Success Response Body (Action):**
```json
{
  "progressionIdentifiers": [
    {
      "id": "ID",
      "name": "string"
    }
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: SuggestChord Concept

**Purpose:** Provides AI-powered chord and progression suggestions based on user preferences.

---

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Initializes default chord suggestion preferences for a given progression ID.

**Requirements:**
- Suggestion preferences for the `progressionId` must not already exist.

**Effects:**
- A new `SuggestionPreferences` entry is created with default genre "Pop", complexity "Simple", and key "C".
- The newly created preferences are returned.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "preferences": {
    "_id": "ID",
    "genre": "string",
    "complexity": "string",
    "key": "string"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/setGenre

**Description:** Sets the preferred genre for chord suggestions for a specified progression.

**Requirements:**
- The `genre` must be one of the predefined valid genres (e.g., "Pop", "Jazz").
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- The `genre` for the `progressionId`'s suggestion preferences is updated.

**Request Body:**
```json
{
  "progressionId": "ID",
  "genre": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/setComplexity

**Description:** Sets the preferred complexity level for chord suggestions for a specified progression.

**Requirements:**
- The `complexity` must be one of the predefined valid complexity levels (e.g., "Simple", "Intermediate", "Advanced").
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- The `complexity` for the `progressionId`'s suggestion preferences is updated.

**Request Body:**
```json
{
  "progressionId": "ID",
  "complexity": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/setKey

**Description:** Sets the musical key for chord suggestions for a specified progression.

**Requirements:**
- The `key` must be a valid major or minor musical key (e.g., "C", "Am", "Eb").
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- The `key` for the `progressionId`'s suggestion preferences is updated.

**Request Body:**
```json
{
  "progressionId": "ID",
  "key": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/getSuggestionPreferences

**Description:** Retrieves the current chord suggestion preferences for a specific progression.

**Requirements:**
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- Returns the `SuggestionPreferences` object for the given `progressionId`.

**Request Body:**
```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**
```json
{
  "preferences": {
    "_id": "ID",
    "genre": "string",
    "complexity": "string",
    "key": "string"
  }
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/suggestChord

**Description:** Requests AI-powered suggestions for a chord at a specific position within a given progression, considering current preferences.

**Requirements:**
- The `position` must be a valid zero-indexed number within the `chords` array.
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- Returns an array of suggested chord symbols based on LLM analysis, filtered for validity and limited to a predefined number of suggestions.

**Request Body:**
```json
{
  "progressionId": "ID",
  "chords": [
    "string | null"
  ],
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedChords": [
    "string"
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/suggestProgression

**Description:** Requests AI-powered suggestions for an entire chord progression of a specified length, considering current preferences.

**Requirements:**
- The `length` must be a positive number greater than 0.
- Suggestion preferences for the `progressionId` must exist.

**Effects:**
- Returns an array of chord symbols forming a suggested progression of the specified `length`, based on LLM analysis.

**Request Body:**
```json
{
  "progressionId": "ID",
  "length": "number"
}
```

**Success Response Body (Action):**
```json
{
  "chordSequence": [
    "string"
  ]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---