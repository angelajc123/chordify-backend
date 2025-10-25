---
timestamp: 'Sat Oct 25 2025 15:50:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251025_155001.b4a1c9b1.md]]'
content_id: 95c66d961feaf20c7709f3470dc3e1036eb23c97cc6d7865d6a96fd22c103b8a
---

# API Specification: SuggestChord Concept

**Purpose:** Provides AI-powered chord and progression suggestions based on user preferences.

***

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Initializes default chord suggestion preferences for a given progression ID.

**Requirements:**

* Suggestion preferences for the `progressionId` must not already exist.

**Effects:**

* A new `SuggestionPreferences` entry is created with default genre "Pop", complexity "Simple", and key "C".
* The newly created preferences are returned.

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

***

### POST /api/SuggestChord/setGenre

**Description:** Sets the preferred genre for chord suggestions for a specified progression.

**Requirements:**

* The `genre` must be one of the predefined valid genres (e.g., "Pop", "Jazz").
* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* The `genre` for the `progressionId`'s suggestion preferences is updated.

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

***

### POST /api/SuggestChord/setComplexity

**Description:** Sets the preferred complexity level for chord suggestions for a specified progression.

**Requirements:**

* The `complexity` must be one of the predefined valid complexity levels (e.g., "Simple", "Intermediate", "Advanced").
* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* The `complexity` for the `progressionId`'s suggestion preferences is updated.

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

***

### POST /api/SuggestChord/setKey

**Description:** Sets the musical key for chord suggestions for a specified progression.

**Requirements:**

* The `key` must be a valid major or minor musical key (e.g., "C", "Am", "Eb").
* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* The `key` for the `progressionId`'s suggestion preferences is updated.

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

***

### POST /api/SuggestChord/getSuggestionPreferences

**Description:** Retrieves the current chord suggestion preferences for a specific progression.

**Requirements:**

* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* Returns the `SuggestionPreferences` object for the given `progressionId`.

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

***

### POST /api/SuggestChord/suggestChord

**Description:** Requests AI-powered suggestions for a chord at a specific position within a given progression, considering current preferences.

**Requirements:**

* The `position` must be a valid zero-indexed number within the `chords` array.
* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* Returns an array of suggested chord symbols based on LLM analysis, filtered for validity and limited to a predefined number of suggestions.

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

***

### POST /api/SuggestChord/suggestProgression

**Description:** Requests AI-powered suggestions for an entire chord progression of a specified length, considering current preferences.

**Requirements:**

* The `length` must be a positive number greater than 0.
* Suggestion preferences for the `progressionId` must exist.

**Effects:**

* Returns an array of chord symbols forming a suggested progression of the specified `length`, based on LLM analysis.

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

***
