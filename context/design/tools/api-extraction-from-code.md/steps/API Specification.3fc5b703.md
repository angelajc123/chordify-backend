---
timestamp: 'Tue Oct 21 2025 14:54:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_145432.04649123.md]]'
content_id: 3fc5b7030614e8b214aee7c62714fa4475a423757e35cd1f8d1654c149a259d0
---

# API Specification: ProgressionBuilder Concept

**Purpose:** To enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.

***

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Action: Creates a new, empty progression with the given name.

**Requirements:**

* (None explicitly stated in JSDoc)

**Effects:**

* A new progression is created with a unique ID, the given name, and an empty chord sequence.

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

***

### POST /api/ProgressionBuilder/addSlot

**Description:** Action: Appends a null Slot to the chordSequence of the specified progression.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.

**Effects:**

* A new slot with a null chord is appended to the progression's chord sequence.

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

### POST /api/ProgressionBuilder/setChord

**Description:** Action: Sets the chord of the Slot at the given position in a progression's chordSequence.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.
* `position` is a valid index within the `chordSequence` of the progression.

**Effects:**

* The `chord` field of the slot at `position` in `chordSequence` is set to `chord`.

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

***

### POST /api/ProgressionBuilder/deleteChord

**Description:** Action: Sets the chord of the Slot at the given position to null.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.
* `position` is a valid index within the `chordSequence` of the progression.

**Effects:**

* The `chord` field of the slot at `position` in `chordSequence` is set to `null`.

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

***

### POST /api/ProgressionBuilder/deleteSlot

**Description:** Action: Removes the Slot at the given position from a progression's chordSequence.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.
* `position` is a valid index within the `chordSequence` of the progression.

**Effects:**

* The slot at `position` is removed from the progression's chord sequence.

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

***

### POST /api/ProgressionBuilder/reorderSlots

**Description:** Action: Reorders slots within a progression's chordSequence.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.
* `oldPosition` and `newPosition` are valid indices within the `chordSequence`.

**Effects:**

* The slot at `oldPosition` is moved to `newPosition` in the `chordSequence`.

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

***

### POST /api/ProgressionBuilder/deleteProgression

**Description:** Action: Removes an entire progression.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.

**Effects:**

* The progression with the given ID is removed from the state.

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

### POST /api/ProgressionBuilder/renameProgression

**Description:** Action: Renames an existing progression.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.

**Effects:**

* The `name` field of the progression with ID `progressionId` is updated to `name`.

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

***

### POST /api/ProgressionBuilder/\_getProgression

**Description:** Query: Retrieves a specific progression by its ID.

**Requirements:**

* `progressionId` is a valid ID of an existing progression.

**Effects:**

* Returns the progression with id `progressionId`.

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

***

### POST /api/ProgressionBuilder/\_listProgressions

**Description:** Query: Returns a list of all progression identifiers and their names.

**Requirements:**

* (None explicitly stated)

**Effects:**

* Returns a list of all progression names and IDs.

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

***
