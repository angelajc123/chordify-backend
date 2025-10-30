[@api-extraction-from-spec](api-extraction-from-spec.md)

# Extracting from code

The following is an explanation of how concepts are implemented, for the purposes of understanding how to extract an API.

[@implementing-concepts](../background/implementing-concepts.md)

# prompt: 

Now, analyze the following Concept Implementations and generate the API documentation based on these instructions.

[@concept-implementation-playback](../../src/concepts/PlayBack/PlayBackConcept.ts)

[@concept-implementation-progression-builder](../../src/concepts/ProgressionBuilder/ProgressionBuilderConcept.ts)

[@concept-implementation-suggest-chord](../../src/concepts/SuggestChord/SuggestChordConcept.ts)
# response:

Here is the API documentation generated from the provided Concept Implementations:

# API Specification: PlayBack Concept

**Purpose:** Manage settings and retrieve musical notes for chord progressions, enabling playback functionality.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Initializes playback settings for a given progression ID with default values.

**Requirements:**
- Playback settings for `progressionId` must not already exist.

**Effects:**
- Creates new `PlaybackSettings` for `progressionId`.
- Sets the `instrument` to "Piano" and `secondsPerChord` to 1.
- Returns the created settings.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "settings": {
    "_id": "string",
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

**Description:** Sets the instrument for a specific progression's playback.

**Requirements:**
- The `instrument` must be one of the predefined valid instruments (e.g., "Piano", "Guitar").
- Playback settings for `progressionId` must exist.

**Effects:**
- Updates the `instrument` for the `progressionId`'s playback settings.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Sets the duration for each chord in a progression's playback.

**Requirements:**
- `secondsPerChord` must be between `MIN_SECONDS_PER_CHORD` and `MAX_SECONDS_PER_CHORD`.
- Playback settings for `progressionId` must exist.

**Effects:**
- Updates the `secondsPerChord` for the `progressionId`'s playback settings.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Retrieves the current playback settings for a given progression ID.

**Requirements:**
- Playback settings for `progressionId` must exist.

**Effects:**
- Returns the `PlaybackSettings` for the `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "settings": {
    "_id": "string",
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

### POST /api/PlayBack/deleteSettings

**Description:** Deletes the playback settings associated with a specific progression ID.

**Requirements:**
- Playback settings for `progressionId` must exist.

**Effects:**
- Removes the `PlaybackSettings` for the `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
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

### POST /api/PlayBack/getChordNotes

**Description:** Retrieves the individual notes (with octave) that comprise a given chord.

**Requirements:**
- The `chord` must be a valid chord string or `null`. If `null`, an empty array of notes is returned. If not null, it must be a valid chord recognized by the system.

**Effects:**
- Returns an array of note strings (e.g., "C4", "E4", "G4") for the specified chord.

**Request Body:**
```json
{
  "chord": "string | null"
}
```

**Success Response Body (Action):**
```json
{
  "notes": ["string"]
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

**Description:** Retrieves the individual notes (with octave) for each chord in a given progression.

**Requirements:**
- The `progression` must be an array of valid chord strings or `null`. Each chord within the progression must be valid.

**Effects:**
- Returns a 2D array where each inner array contains note strings for a corresponding chord in the progression.

**Request Body:**
```json
{
  "progression": ["string | null"]
}
```

**Success Response Body (Action):**
```json
{
  "notes": [
    ["string"]
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

**Purpose:** Manage the creation, modification, and deletion of chord progressions, including their structure and individual chords.

---

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Creates a new, empty chord progression with a given name.

**Requirements:**
- None.

**Effects:**
- Creates a new `Progression` with a fresh ID, the given `name`, and an empty `chords` array.
- Returns the created progression.

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
    "_id": "string",
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

### POST /api/ProgressionBuilder/addSlot

**Description:** Adds an empty chord slot to an existing progression.

**Requirements:**
- Progression with `progressionId` must exist.

**Effects:**
- Appends a new slot with `chord: null` to the `chords` array of the specified progression.

**Request Body:**
```json
{
  "progressionId": "string"
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

**Description:** Sets the chord for a specific slot within a progression.

**Requirements:**
- Progression with `progressionId` must exist.
- `position` must be a valid index within the progression's chords array.
- `chord` must be a valid chord string.

**Effects:**
- Updates the `chord` at the specified `position` in the progression's `chords` array.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Clears the chord from a specific slot, setting it to `null`.

**Requirements:**
- Progression with `progressionId` must exist.
- `position` must be a valid index within the progression's chords array.

**Effects:**
- Sets the `chord` at the specified `position` in the progression's `chords` array to `null`.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Removes a slot entirely from a progression at a given position.

**Requirements:**
- Progression with `progressionId` must exist.
- `position` must be a valid index within the progression's chords array.

**Effects:**
- Removes the slot at the specified `position` from the progression's `chords` array.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Changes the order of slots within a progression by moving a slot from one position to another.

**Requirements:**
- Progression with `progressionId` must exist.
- `oldPosition` and `newPosition` must be valid indices within the progression's chords array.

**Effects:**
- Reorders the `chords` array of the specified progression by moving the slot from `oldPosition` to `newPosition`.

**Request Body:**
```json
{
  "progressionId": "string",
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
- Progression with `progressionId` must exist.

**Effects:**
- Removes the `Progression` identified by `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
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
- Progression with `progressionId` must exist.

**Effects:**
- Updates the `name` of the `Progression` identified by `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Retrieves a specific chord progression by its ID.

**Requirements:**
- Progression with `progressionId` must exist.

**Effects:**
- Returns the `Progression` object for the `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progression": {
    "_id": "string",
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
- Returns an object containing an array of objects, each with the `id` and `name` of a progression.

**Request Body:**
```json
{}
```

**Success Response Body (Action):**
```json
{
  "progressionIdentifiers": [
    {
      "id": "string",
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

**Purpose:** Provide AI-powered suggestions for individual chords or full progressions based on musical preferences.

---

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Initializes chord suggestion preferences for a given progression ID with default values.

**Requirements:**
- Preferences for `progressionId` must not already exist.

**Effects:**
- Creates new `SuggestionPreferences` for `progressionId`.
- Sets default `genre` to "Pop", `complexity` to "Simple", and `key` to "C".
- Returns the created preferences.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "preferences": {
    "_id": "string",
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

**Description:** Sets the preferred musical genre for chord suggestions for a given progression.

**Requirements:**
- The `genre` must be one of the predefined valid genres.
- Preferences for `progressionId` must exist.

**Effects:**
- Updates the `genre` for the `progressionId`'s suggestion preferences.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Sets the preferred complexity level for chord suggestions for a given progression.

**Requirements:**
- The `complexity` must be one of the predefined valid complexity levels.
- Preferences for `progressionId` must exist.

**Effects:**
- Updates the `complexity` for the `progressionId`'s suggestion preferences.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Sets the musical key for chord suggestions for a given progression.

**Requirements:**
- The `key` must be a valid major or minor key.
- Preferences for `progressionId` must exist.

**Effects:**
- Updates the `key` for the `progressionId`'s suggestion preferences.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Retrieves the current chord suggestion preferences for a given progression ID.

**Requirements:**
- Preferences for `progressionId` must exist.

**Effects:**
- Returns the `SuggestionPreferences` for the `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "preferences": {
    "_id": "string",
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

### POST /api/SuggestChord/deletePreferences

**Description:** Deletes the chord suggestion preferences associated with a specific progression ID.

**Requirements:**
- Preferences for `progressionId` must exist.

**Effects:**
- Removes the `SuggestionPreferences` for the `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
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

### POST /api/SuggestChord/suggestChord

**Description:** Generates a list of suggested chords for a specific position within a progression, based on current preferences.

**Requirements:**
- `position` must be a valid index within the `chords` array (0 to `chords.length - 1`).
- Preferences for `progressionId` must exist.
- The underlying LLM must successfully return valid chord suggestions.

**Effects:**
- Returns an array of suggested chord strings.

**Request Body:**
```json
{
  "progressionId": "string",
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

**Description:** Generates multiple complete chord progressions of a specified length, based on current preferences.

**Requirements:**
- `length` must be greater than 0.
- Preferences for `progressionId` must exist.
- The underlying LLM must successfully return valid chord progressions.

**Effects:**
- Returns a 2D array of suggested chord progressions.

**Request Body:**
```json
{
  "progressionId": "string",
  "length": "number"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedProgressions": [
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