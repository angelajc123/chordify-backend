---
timestamp: 'Thu Oct 30 2025 16:17:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251030_161704.7080af51.md]]'
content_id: e72fb3692452ceabf171c76a9f583df933f9c959b2d38a7c02c866cee5956634
---

# API Specification: SuggestChord Concept

**Purpose:** Provide AI-powered suggestions for individual chords or full progressions based on musical preferences.

***

## API Endpoints

### POST /api/SuggestChord/initializePreferences

**Description:** Initializes chord suggestion preferences for a given progression ID with default values.

**Requirements:**

* Preferences for `progressionId` must not already exist.

**Effects:**

* Creates new `SuggestionPreferences` for `progressionId`.
* Sets default `genre` to "Pop", `complexity` to "Simple", and `key` to "C".
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

**Description:** Sets the preferred musical genre for chord suggestions for a given progression.

**Requirements:**

* The `genre` must be one of the predefined valid genres.
* Preferences for `progressionId` must exist.

**Effects:**

* Updates the `genre` for the `progressionId`'s suggestion preferences.

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

**Description:** Sets the preferred complexity level for chord suggestions for a given progression.

**Requirements:**

* The `complexity` must be one of the predefined valid complexity levels.
* Preferences for `progressionId` must exist.

**Effects:**

* Updates the `complexity` for the `progressionId`'s suggestion preferences.

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

**Description:** Sets the musical key for chord suggestions for a given progression.

**Requirements:**

* The `key` must be a valid major or minor key.
* Preferences for `progressionId` must exist.

**Effects:**

* Updates the `key` for the `progressionId`'s suggestion preferences.

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

**Description:** Retrieves the current chord suggestion preferences for a given progression ID.

**Requirements:**

* Preferences for `progressionId` must exist.

**Effects:**

* Returns the `SuggestionPreferences` for the `progressionId`.

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

### POST /api/SuggestChord/deletePreferences

**Description:** Deletes the chord suggestion preferences associated with a specific progression ID.

**Requirements:**

* Preferences for `progressionId` must exist.

**Effects:**

* Removes the `SuggestionPreferences` for the `progressionId`.

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

***

### POST /api/SuggestChord/suggestChord

**Description:** Generates a list of suggested chords for a specific position within a progression, based on current preferences.

**Requirements:**

* `position` must be a valid index within the `chords` array (0 to `chords.length - 1`).
* Preferences for `progressionId` must exist.
* The underlying LLM must successfully return valid chord suggestions.

**Effects:**

* Returns an array of suggested chord strings.

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

**Description:** Generates multiple complete chord progressions of a specified length, based on current preferences.

**Requirements:**

* `length` must be greater than 0.
* Preferences for `progressionId` must exist.
* The underlying LLM must successfully return valid chord progressions.

**Effects:**

* Returns a 2D array of suggested chord progressions.

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
