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

# prompt: why are all of these POST requests?
# response:

This is a great question! The reason all endpoints are specified as `POST` requests is a deliberate design choice outlined in the "API Structure Rules" section of the prompt:

*   **HTTP Method:** All endpoints use the `POST` method.

While traditional RESTful APIs often differentiate between `GET` for fetching data (queries) and `POST`/`PUT`/`DELETE` for modifying data (actions), this Concept Specification paradigm adopts a unified approach for several reasons:

1.  **"Action-Oriented" Design:** The Concept Specification defines "actions" and "queries" as distinct operations on the concept's state, rather than strictly adhering to resource-oriented REST principles. Even queries (methods starting with `_`) are viewed as specific operations with potentially complex input parameters. `POST` is generally well-suited for any operation that takes input in a request body and performs a defined step.

2.  **Consistent Request Body for All Operations:** Both actions and queries in this model take input arguments as a single JSON object in the request body. `POST` is the standard HTTP method for sending data in the request body, making it a natural fit for this consistent input format, regardless of whether the operation is a read or a write. Using `GET` for queries with complex or numerous parameters can lead to unwieldy URLs (due to query string limitations), whereas `POST` avoids this by using the request body.

3.  **Simplification and Uniformity:** By enforcing a single HTTP method (`POST`) for all interactions, the API becomes simpler and more uniform for developers. There's no need to decide which HTTP verb to use based on the operation's nature; `POST` is always the answer. This can reduce cognitive load and potential for error in API integration.

4.  **Error Handling and State Changes:** Even queries can have "requirements" (preconditions) and return "errors" if those requirements aren't met, much like actions. This blurring of lines between "safe" (GET) and "unsafe" (POST) operations, combined with the focus on state changes and results, makes `POST` a practical choice for a consistent operational model.

In essence, this design prioritizes an explicit, action-like invocation style for all concept operations over strict adherence to traditional RESTful resource management.

# prompt: But some of the functions are just queries. Why are those POST requests?
# response: 
# response:

You're absolutely right to press on this point, as it goes against common REST API conventions where `GET` is typically used for queries (read-only operations that are idempotent and safe).

The core reason why even queries are `POST` requests in this specification comes directly from the "API Structure Rules" defined at the beginning of the prompt:

*   **HTTP Method:** All endpoints use the `POST` method.

This is a **deliberate design choice** within this "Concept Specification" framework, driven by the following considerations:

1.  **Unified Interaction Model (RPC-like):** The concept server isn't strictly building a RESTful API in the purest sense (resource-oriented with standard HTTP verbs for CRUD). Instead, it's presenting an **RPC (Remote Procedure Call) style API over HTTP**. In this model, every interaction with a concept is treated like calling a function or method. `POST` is a very common HTTP method for initiating *any* kind of RPC call, regardless of whether it's a read or a write. It signals that an operation is being invoked on the server.

2.  **Complex Input Parameters:** Even query functions, like `_getProgression({ progressionId: ProgressionID })`, can have input arguments. If a query needed multiple or complex parameters (e.g., filtering criteria, pagination details, nested objects), sending them via a `GET` request's URL query parameters can become cumbersome, hit URL length limits, or expose sensitive data in logs more easily. By using `POST`, all input arguments (for both actions and queries) are consistently sent in the **request body as a JSON object**. This provides a more flexible and uniform way to pass data.

3.  **Consistency and Simplicity for Developers:** By dictating that *all* operations use `POST`, the API simplifies the mental model for client-side developers. They don't need to evaluate whether an operation is a "read" or a "write" to decide on the HTTP verb. Every interaction follows the same pattern: `POST` to `/{conceptName}/{actionOrQueryName}` with a JSON body. This reduces cognitive load and potential for implementation errors.

4.  **"Preconditions as Firing Conditions" Apply to Queries Too:** The concept specification explicitly states, "preconditions are firing conditions." Even for queries, the concept has "requires" clauses (e.g., `_getProgression` "requires progressionId is a valid ID of an existing progression"). While `GET` requests can conceptually have preconditions, treating all operations as "invocations" (which `POST` implies) where inputs are validated against "firing conditions" maintains a consistent mental model across the concept's entire public interface.

In summary, while it diverges from classic REST conventions, the use of `POST` for all endpoints, including queries, in this "Concept Server" API is a design decision aimed at **uniformity, simplified parameter passing, and an RPC-like interaction model** consistent with how the concepts define their "actions" and "queries."