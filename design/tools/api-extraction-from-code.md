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

Here is the API documentation based on the provided Concept Implementations:

# API Specification: PlayBack Concept

**Purpose:** To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Action: Initializes playback settings for a given progression.

**Requirements:**
- progression does not exist in PlaybackSettings.

**Effects:**
- Creates a new PlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).

**Request Body:**
```json
{
  "progression": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
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

**Description:** Action: Sets the instrument for a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given instrument.

**Request Body:**
```json
{
  "progression": "string",
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

**Description:** Action: Sets the duration (in seconds) for each chord in a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given secondsPerChord.

**Request Body:**
```json
{
  "progression": "string",
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

### POST /api/PlayBack/getProgressionSettings

**Description:** Query: Retrieves the playback settings for a specific progression.

**Requirements:**
- (Implicitly in code: settings must exist)

**Effects:**
- Returns the PlaybackSettings for progression.

**Request Body:**
```json
{
  "progression": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/PlayBack/playChord

**Description:** Action: Provides data to play a single chord using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an object containing the notes, instrument, and duration for the chord.

**Request Body:**
```json
{
  "progression": "string",
  "chord": "string"
}
```

**Success Response Body (Action):**
```json
{
  "notes": ["string"],
  "instrument": "string",
  "duration": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/PlayBack/playProgression

**Description:** Action: Provides data to play a sequence of chords (a progression) using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an array of objects, each representing a chord or rest with its notes and duration, along with the instrument.

**Request Body:**
```json
{
  "progression": "string",
  "chordSequence": ["string" | null]
}
```

**Success Response Body (Action):**
```json
{
  "sequence": [
    {
      "notes": ["string"],
      "duration": "number"
    },
    {
      "rest": "boolean",
      "duration": "number"
    }
  ],
  "instrument": "string"
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

**Purpose:** To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.

---

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Action: Creates a new, empty progression with the given name.

**Requirements:**
- (None explicitly stated, but implies name should be valid)

**Effects:**
- A new progression is created with a unique ID, the given name, and an empty chord sequence.

**Request Body:**
```json
{
  "name": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progression": "string"
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

**Description:** Action: Appends a null Slot to the chordSequence of the specified progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- A new slot with a null chord is appended to the progression's chord sequence.

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

**Description:** Action: Sets the chord of the Slot at the given position in a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `chord`.

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

**Description:** Action: Sets the chord of the Slot at the given position to null.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `null`.

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

**Description:** Action: Removes the Slot at the given position from a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The slot at `position` is removed from the progression's chord sequence.

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

**Description:** Action: Reorders slots within a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `oldPosition` and `newPosition` are valid indices within the `chordSequence`.

**Effects:**
- The slot at `oldPosition` is moved to `newPosition` in the `chordSequence`.

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

**Description:** Action: Removes an entire progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The progression with the given ID is removed from the state.

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

**Description:** Action: Renames an existing progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The `name` field of the progression with ID `progressionId` is updated to `name`.

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

### POST /api/ProgressionBuilder/_getProgression

**Description:** Query: Retrieves a specific progression by its ID.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- Returns the progression with id `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "progression": {
      "_id": "string",
      "name": "string",
      "chordSequence": [
        {
          "chord": "string" | null
        }
      ]
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/ProgressionBuilder/_listProgressions

**Description:** Query: Returns a list of all progression identifiers and their names.

**Requirements:**
- (None explicitly stated)

**Effects:**
- Returns a list of all progression names and IDs.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "progressionIdentifiers": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

# API Specification: SuggestChord Concept

**Purpose:** offer users suggestions for suitable chords and progressions based on preferences

---

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Action: Initializes preferences for chord suggestions for a given progression.

**Requirements:**
- progression does not exist in SuggestionPreferences

**Effects:**
- creates a new SuggestionPreferences for progression with default values for preferredGenre, complexityLevel, and key.

**Request Body:**
```json
{
  "progression": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "preferredGenre": "string",
  "complexityLevel": "string",
  "key": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/SuggestChord/setPreferredGenre

**Description:** Action: Sets the preferred genre for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given genre.

**Request Body:**
```json
{
  "progression": "string",
  "preferredGenre": "string"
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

### POST /api/SuggestChord/setComplexityLevel

**Description:** Action: Sets the complexity level for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given complexityLevel.

**Request Body:**
```json
{
  "progression": "string",
  "complexityLevel": "string"
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

**Description:** Action: Sets the musical key for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given key.

**Request Body:**
```json
{
  "progression": "string",
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

### POST /api/SuggestChord/getProgressionPreferences

**Description:** Action: Retrieves the suggestion preferences for a specific progression.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- returns the SuggestionPreferences for progression.

**Request Body:**
```json
{
  "progression": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progressionPreferences": {
    "_id": "string",
    "preferredGenre": "string",
    "complexityLevel": "string",
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

**Description:** Action: Suggests a list of suitable chords for a specific position in a progression, based on user preferences and context.

**Requirements:**
- progression exists in SuggestionPreferences, 0 <= position < chords.length

**Effects:**
- returns a list of suggested chords to put in position in chords, generated by an LLM given the context of the SuggestionPreferences for progression and the chords before and after it.

**Request Body:**
```json
{
  "progression": "string",
  "chords": ["string" | null],
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedChords": ["string"]
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

**Description:** Action: Generates a complete chord progression of a specified length, based on user preferences.

**Requirements:**
- progression exists in SuggestionPreferences, length > 0

**Effects:**
- returns a chord progression of length length, generated by an LLM given the context of the SuggestionPreferences for progression.

**Request Body:**
```json
{
  "progression": "string",
  "length": "number"
}
```

**Success Response Body (Action):**
```json
{
  "chordSequence": ["string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
# response:

```markdown
# API Specification: PlayBack Concept

**Purpose:** To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Action: Initializes playback settings for a given progression.

**Requirements:**
- progression does not exist in PlaybackSettings.

**Effects:**
- Creates a new PlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
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

**Description:** Action: Sets the instrument for a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given instrument.

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

**Description:** Action: Sets the duration (in seconds) for each chord in a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given secondsPerChord.

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

### POST /api/PlayBack/getProgressionSettings

**Description:** Query: Retrieves the playback settings for a specific progression. (Note: Although described as a query, this method does not start with `_` and therefore follows action response rules, returning a single object.)

**Requirements:**
- Playback settings for progressionId must exist.

**Effects:**
- Returns the PlaybackSettings for progression.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/playChord

**Description:** Action: Provides data to play a single chord using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an object containing the notes, instrument, and duration for the chord.

**Request Body:**
```json
{
  "progressionId": "string",
  "chord": "string"
}
```

**Success Response Body (Action):**
```json
{
  "notes": ["string"],
  "instrument": "string",
  "duration": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/playProgression

**Description:** Action: Provides data to play a sequence of chords (a progression) using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an array of objects, each representing a chord or rest with its notes and duration, along with the instrument.

**Request Body:**
```json
{
  "progressionId": "string",
  "chordSequence": ["string" | null]
}
```

**Success Response Body (Action):**
```json
{
  "sequence": [
    {
      "notes": ["string"],
      "duration": "number"
    },
    {
      "rest": "boolean",
      "duration": "number"
    }
  ],
  "instrument": "string"
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

**Purpose:** To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.

---

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Action: Creates a new, empty progression with the given name.

**Requirements:**
- (None explicitly stated in JSDoc)

**Effects:**
- A new progression is created with a unique ID, the given name, and an empty chord sequence.

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
    "chordSequence": [
      {
        "chord": "string" | null
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

**Description:** Action: Appends a null Slot to the chordSequence of the specified progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- A new slot with a null chord is appended to the progression's chord sequence.

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

**Description:** Action: Sets the chord of the Slot at the given position in a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `chord`.

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

**Description:** Action: Sets the chord of the Slot at the given position to null.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `null`.

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

**Description:** Action: Removes the Slot at the given position from a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The slot at `position` is removed from the progression's chord sequence.

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

**Description:** Action: Reorders slots within a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `oldPosition` and `newPosition` are valid indices within the `chordSequence`.

**Effects:**
- The slot at `oldPosition` is moved to `newPosition` in the `chordSequence`.

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

**Description:** Action: Removes an entire progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The progression with the given ID is removed from the state.

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

**Description:** Action: Renames an existing progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The `name` field of the progression with ID `progressionId` is updated to `name`.

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

### POST /api/ProgressionBuilder/\_getProgression

**Description:** Query: Retrieves a specific progression by its ID.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- Returns the progression with id `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "progression": {
      "_id": "string",
      "name": "string",
      "chordSequence": [
        {
          "chord": "string" | null
        }
      ]
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/\_listProgressions

**Description:** Query: Returns a list of all progression identifiers and their names.

**Requirements:**
- (None explicitly stated)

**Effects:**
- Returns a list of all progression names and IDs.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "progressionIdentifiers": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: SuggestChord Concept

**Purpose:** offer users suggestions for suitable chords and progressions based on preferences

---

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Action: Initializes preferences for chord suggestions for a given progression.

**Requirements:**
- progression does not exist in SuggestionPreferences

**Effects:**
- creates a new SuggestionPreferences for progression with default values for preferredGenre, complexityLevel, and key.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "preferredGenre": "string",
  "complexityLevel": "string",
  "key": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/setPreferredGenre

**Description:** Action: Sets the preferred genre for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given genre.

**Request Body:**
```json
{
  "progressionId": "string",
  "preferredGenre": "string"
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

### POST /api/SuggestChord/setComplexityLevel

**Description:** Action: Sets the complexity level for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given complexityLevel.

**Request Body:**
```json
{
  "progressionId": "string",
  "complexityLevel": "string"
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

**Description:** Action: Sets the musical key for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given key.

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

### POST /api/SuggestChord/getProgressionPreferences

**Description:** Action: Retrieves the suggestion preferences for a specific progression. (Note: Although described as an action, the method name is `getProgressionPreferences` and not prefixed with `_`, thus follows action response rules, returning a single object.)

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- returns the SuggestionPreferences for progression.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progressionPreferences": {
    "_id": "string",
    "preferredGenre": "string",
    "complexityLevel": "string",
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

**Description:** Action: Suggests a list of suitable chords for a specific position in a progression, based on user preferences and context.

**Requirements:**
- progression exists in SuggestionPreferences, 0 <= position < chords.length

**Effects:**
- returns a list of suggested chords to put in position in chords, generated by an LLM given the context of the SuggestionPreferences for progression and the chords before and after it.

**Request Body:**
```json
{
  "progressionId": "string",
  "chords": ["string" | null],
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedChords": ["string"]
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

**Description:** Action: Generates a complete chord progression of a specified length, based on user preferences.

**Requirements:**
- progression exists in SuggestionPreferences, length > 0

**Effects:**
- returns a chord progression of length length, generated by an LLM given the context of the SuggestionPreferences for progression.

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
  "chordSequence": ["string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---
```

# prompt: Can you make sure the field names are correct? "progression" should be "progressionId".
# response:

Here is the updated API documentation with the field names corrected to "progressionId" and refined response body structures for `ProgressionBuilder` endpoints, as requested.

# API Specification: PlayBack Concept

**Purpose:** To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Action: Initializes playback settings for a given progression.

**Requirements:**
- progression does not exist in PlaybackSettings.

**Effects:**
- Creates a new PlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
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

**Description:** Action: Sets the instrument for a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given instrument.

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

**Description:** Action: Sets the duration (in seconds) for each chord in a progression's playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Updates the PlaybackSettings for progression with the given secondsPerChord.

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

### POST /api/PlayBack/getProgressionSettings

**Description:** Query: Retrieves the playback settings for a specific progression. (Note: Although described as a query, this method does not start with `_` and therefore follows action response rules, returning a single object.)

**Requirements:**
- Playback settings for progressionId must exist.

**Effects:**
- Returns the PlaybackSettings for progression.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/playChord

**Description:** Action: Provides data to play a single chord using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an object containing the notes, instrument, and duration for the chord.

**Request Body:**
```json
{
  "progressionId": "string",
  "chord": "string"
}
```

**Success Response Body (Action):**
```json
{
  "notes": ["string"],
  "instrument": "string",
  "duration": "number"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/PlayBack/playProgression

**Description:** Action: Provides data to play a sequence of chords (a progression) using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**
- progression exists in PlaybackSettings.

**Effects:**
- Returns an array of objects, each representing a chord or rest with its notes and duration, along with the instrument.

**Request Body:**
```json
{
  "progressionId": "string",
  "chordSequence": ["string" | null]
}
```

**Success Response Body (Action):**
```json
{
  "sequence": [
    {
      "notes": ["string"],
      "duration": "number"
    },
    {
      "rest": "boolean",
      "duration": "number"
    }
  ],
  "instrument": "string"
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

**Purpose:** To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.

---

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Action: Creates a new, empty progression with the given name.

**Requirements:**
- (None explicitly stated in JSDoc)

**Effects:**
- A new progression is created with a unique ID, the given name, and an empty chord sequence.

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
    "chordSequence": [
      {
        "chord": "string" | null
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

**Description:** Action: Appends a null Slot to the chordSequence of the specified progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- A new slot with a null chord is appended to the progression's chord sequence.

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

**Description:** Action: Sets the chord of the Slot at the given position in a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `chord`.

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

**Description:** Action: Sets the chord of the Slot at the given position to null.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The `chord` field of the slot at `position` in `chordSequence` is set to `null`.

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

**Description:** Action: Removes the Slot at the given position from a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `position` is a valid index within the `chordSequence` of the progression.

**Effects:**
- The slot at `position` is removed from the progression's chord sequence.

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

**Description:** Action: Reorders slots within a progression's chordSequence.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.
- `oldPosition` and `newPosition` are valid indices within the `chordSequence`.

**Effects:**
- The slot at `oldPosition` is moved to `newPosition` in the `chordSequence`.

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

**Description:** Action: Removes an entire progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The progression with the given ID is removed from the state.

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

**Description:** Action: Renames an existing progression.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- The `name` field of the progression with ID `progressionId` is updated to `name`.

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

### POST /api/ProgressionBuilder/\_getProgression

**Description:** Query: Retrieves a specific progression by its ID.

**Requirements:**
- `progressionId` is a valid ID of an existing progression.

**Effects:**
- Returns the progression with id `progressionId`.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "progression": {
      "_id": "string",
      "name": "string",
      "chordSequence": [
        {
          "chord": "string" | null
        }
      ]
    }
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/ProgressionBuilder/\_listProgressions

**Description:** Query: Returns a list of all progression identifiers and their names.

**Requirements:**
- (None explicitly stated)

**Effects:**
- Returns a list of all progression names and IDs.

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "progressionIdentifiers": [
      {
        "id": "string",
        "name": "string"
      }
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

# API Specification: SuggestChord Concept

**Purpose:** offer users suggestions for suitable chords and progressions based on preferences

---

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Action: Initializes preferences for chord suggestions for a given progression.

**Requirements:**
- progression does not exist in SuggestionPreferences

**Effects:**
- creates a new SuggestionPreferences for progression with default values for preferredGenre, complexityLevel, and key.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "_id": "string",
  "preferredGenre": "string",
  "complexityLevel": "string",
  "key": "string"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---

### POST /api/SuggestChord/setPreferredGenre

**Description:** Action: Sets the preferred genre for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given genre.

**Request Body:**
```json
{
  "progressionId": "string",
  "preferredGenre": "string"
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

### POST /api/SuggestChord/setComplexityLevel

**Description:** Action: Sets the complexity level for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given complexityLevel.

**Request Body:**
```json
{
  "progressionId": "string",
  "complexityLevel": "string"
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

**Description:** Action: Sets the musical key for a progression's chord suggestions.

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- updates the SuggestionPreferences for progression with the given key.

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

### POST /api/SuggestChord/getProgressionPreferences

**Description:** Action: Retrieves the suggestion preferences for a specific progression. (Note: Although described as an action, the method name is `getProgressionPreferences` and not prefixed with `_`, thus follows action response rules, returning a single object.)

**Requirements:**
- progression exists in SuggestionPreferences

**Effects:**
- returns the SuggestionPreferences for progression.

**Request Body:**
```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**
```json
{
  "progressionPreferences": {
    "_id": "string",
    "preferredGenre": "string",
    "complexityLevel": "string",
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

**Description:** Action: Suggests a list of suitable chords for a specific position in a progression, based on user preferences and context.

**Requirements:**
- progression exists in SuggestionPreferences, 0 <= position < chords.length

**Effects:**
- returns a list of suggested chords to put in position in chords, generated by an LLM given the context of the SuggestionPreferences for progression and the chords before and after it.

**Request Body:**
```json
{
  "progressionId": "string",
  "chords": ["string" | null],
  "position": "number"
}
```

**Success Response Body (Action):**
```json
{
  "suggestedChords": ["string"]
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

**Description:** Action: Generates a complete chord progression of a specified length, based on user preferences.

**Requirements:**
- progression exists in SuggestionPreferences, length > 0

**Effects:**
- returns a chord progression of length length, generated by an LLM given the context of the SuggestionPreferences for progression.

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
  "chordSequence": ["string"]
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```

---