---
timestamp: 'Sat Oct 25 2025 15:50:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251025_155001.b4a1c9b1.md]]'
content_id: 01e5b04a22d84cf002181f12301bc92d3163a37da0470ab6cdfe9674fbbe9526
---

# API Specification: ProgressionBuilder Concept

**Purpose:** Allows users to create, modify, and manage musical chord progressions.

***

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Creates a new empty chord progression with a given name.

**Requirements:**

* `name` should be a non-empty string.

**Effects:**

* A new `Progression` object is created with a unique ID and an empty list of chords.
* The newly created `Progression` is returned.

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

***

### POST /api/ProgressionBuilder/addSlot

**Description:** Adds an empty chord slot to the end of a specified progression.

**Requirements:**

* The `progressionId` must correspond to an existing progression.

**Effects:**

* A new slot with a `null` chord value is appended to the `chords` array of the progression.

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

***

### POST /api/ProgressionBuilder/setChord

**Description:** Sets a chord at a specific position within a progression.

**Requirements:**

* The `progressionId` must correspond to an existing progression.
* The `position` must be a valid zero-indexed number within the progression's chord slots (i.e., `0 <= position < chords.length`).
* The `chord` string must represent a valid chord symbol (e.g., "Cmaj7", "Am").

**Effects:**

* The chord at the specified `position` in the `progressionId`'s `chords` array is updated to the new `chord` value.

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

***

### POST /api/ProgressionBuilder/deleteChord

**Description:** Clears the chord at a specific position within a progression, setting it to null.

**Requirements:**

* The `progressionId` must correspond to an existing progression.
* The `position` must be a valid zero-indexed number within the progression's chord slots.

**Effects:**

* The chord at the specified `position` in the `progressionId`'s `chords` array is set to `null`.

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

***

### POST /api/ProgressionBuilder/deleteSlot

**Description:** Removes a chord slot entirely from a progression at a specific position.

**Requirements:**

* The `progressionId` must correspond to an existing progression.
* The `position` must be a valid zero-indexed number within the progression's chord slots.

**Effects:**

* The slot at the specified `position` is removed from the `chords` array of the progression, and subsequent slots are shifted.

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

***

### POST /api/ProgressionBuilder/reorderSlots

**Description:** Changes the position of a chord slot within a progression.

**Requirements:**

* The `progressionId` must correspond to an existing progression.
* Both `oldPosition` and `newPosition` must be valid zero-indexed numbers within the progression's chord slots.

**Effects:**

* The chord slot originally at `oldPosition` is moved to `newPosition`, and other slots are shifted accordingly to maintain sequence.

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

***

### POST /api/ProgressionBuilder/deleteProgression

**Description:** Deletes an entire chord progression.

**Requirements:**

* The `progressionId` must correspond to an existing progression.

**Effects:**

* The `Progression` identified by `progressionId` is removed from the system.

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

***

### POST /api/ProgressionBuilder/renameProgression

**Description:** Renames an existing chord progression.

**Requirements:**

* The `progressionId` must correspond to an existing progression.
* `name` should be a non-empty string.

**Effects:**

* The `name` of the `Progression` identified by `progressionId` is updated to the new `name`.

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

***

### POST /api/ProgressionBuilder/getProgression

**Description:** Retrieves the full details of a specific chord progression, including its name and all chord slots.

**Requirements:**

* The `progressionId` must correspond to an existing progression.

**Effects:**

* Returns the `Progression` object for the given `progressionId`.

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

***

### POST /api/ProgressionBuilder/listProgressions

**Description:** Lists all available chord progressions by their ID and name.

**Requirements:**

* None.

**Effects:**

* Returns an object containing an array of progression identifiers, each with an `id` and `name`.

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

***
