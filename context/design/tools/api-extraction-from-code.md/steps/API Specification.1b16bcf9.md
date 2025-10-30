---
timestamp: 'Wed Oct 29 2025 20:30:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251029_203050.7bbf7edf.md]]'
content_id: 1b16bcf9e1aa03446ab2b20901af9ded4ee073b0cce3394480525bf927fb276e
---

# API Specification: SuggestChord Concept

**Purpose:** Provide intelligent chord and progression suggestions based on musical preferences, leveraging large language models.

***

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Initializes default chord suggestion preferences for a given progression.

**Requirements:**

* Suggestion preferences must not already exist for the `progressionId`.

**Effects:**

* Creates new suggestion preferences with `genre: "Pop"`, `complexity: "Simple"`, and `key: "C"` for the given `progressionId`.
* Returns the created preferences.

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

***

### POST /api/SuggestChord/setGenre

**Description:** Sets the preferred musical genre for chord suggestions for a specific progression.

**Requirements:**

* The `genre` must be one of the allowed genres (e.g., from `@shared/constants.ts`).
* Suggestion preferences must exist for the `progressionId`.

**Effects:**

* Updates the `genre` preference for the suggestion settings associated with `progressionId`.

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

***

### POST /api/SuggestChord/setComplexity

**Description:** Sets the preferred complexity level for chord suggestions for a specific progression.

**Requirements:**

* The `complexity` must be one of the allowed complexity levels (e.g., from `@shared/constants.ts`).
* Suggestion preferences must exist for the `progressionId`.

**Effects:**

* Updates the `complexity` preference for the suggestion settings associated with `progressionId`.

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

***

### POST /api/SuggestChord/setKey

**Description:** Sets the preferred musical key for chord suggestions for a specific progression.

**Requirements:**

* The `key` must be a valid major or minor key (e.g., as determined by `isValidKey` from `@shared/constants.ts`).
* Suggestion preferences must exist for the `progressionId`.

**Effects:**

* Updates the `key` preference for the suggestion settings associated with `progressionId`.

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

***

### POST /api/SuggestChord/getSuggestionPreferences

**Description:** Retrieves the chord suggestion preferences for a specific progression.

**Requirements:**

* Suggestion preferences must exist for the `progressionId`.

**Effects:**

* Returns the suggestion preferences associated with `progressionId`.

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

***

### POST /api/SuggestChord/suggestChord

**Description:** Generates chord suggestions for a specific position within an existing progression, based on stored preferences.

**Requirements:**

* The `position` must be a valid zero-indexed position within the `chords` array.
* Suggestion preferences must exist for the `progressionId`.
* The underlying LLM must successfully return valid chord suggestions.

**Effects:**

* Returns an array of suggested chord symbols.

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

***

### POST /api/SuggestChord/suggestProgression

**Description:** Generates entire chord progression suggestions of a specified length, based on stored preferences.

**Requirements:**

* The `length` must be greater than 0.
* Suggestion preferences must exist for the `progressionId`.
* The underlying LLM must successfully return valid chord progressions of the specified length.

**Effects:**

* Returns an array of suggested chord progressions, where each progression is an array of chord symbols.

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
