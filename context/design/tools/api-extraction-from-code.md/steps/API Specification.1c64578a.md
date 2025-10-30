---
timestamp: 'Thu Oct 30 2025 16:17:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251030_161704.7080af51.md]]'
content_id: 1c64578a28bdbaf9828b5dd25d48837e6861f5fba997e8ff72ca2ac660b3d424
---

# API Specification: ProgressionBuilder Concept

**Purpose:** Manage the creation, modification, and deletion of chord progressions, including their structure and individual chords.

***

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Creates a new, empty chord progression with a given name.

**Requirements:**

* None.

**Effects:**

* Creates a new `Progression` with a fresh ID, the given `name`, and an empty `chords` array.
* Returns the created progression.

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

***

### POST /api/ProgressionBuilder/addSlot

**Description:** Adds an empty chord slot to an existing progression.

**Requirements:**

* Progression with `progressionId` must exist.

**Effects:**

* Appends a new slot with `chord: null` to the `chords` array of the specified progression.

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

**Description:** Sets the chord for a specific slot within a progression.

**Requirements:**

* Progression with `progressionId` must exist.
* `position` must be a valid index within the progression's chords array.
* `chord` must be a valid chord string.

**Effects:**

* Updates the `chord` at the specified `position` in the progression's `chords` array.

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

**Description:** Clears the chord from a specific slot, setting it to `null`.

**Requirements:**

* Progression with `progressionId` must exist.
* `position` must be a valid index within the progression's chords array.

**Effects:**

* Sets the `chord` at the specified `position` in the progression's `chords` array to `null`.

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

**Description:** Removes a slot entirely from a progression at a given position.

**Requirements:**

* Progression with `progressionId` must exist.
* `position` must be a valid index within the progression's chords array.

**Effects:**

* Removes the slot at the specified `position` from the progression's `chords` array.

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

**Description:** Changes the order of slots within a progression by moving a slot from one position to another.

**Requirements:**

* Progression with `progressionId` must exist.
* `oldPosition` and `newPosition` must be valid indices within the progression's chords array.

**Effects:**

* Reorders the `chords` array of the specified progression by moving the slot from `oldPosition` to `newPosition`.

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

**Description:** Deletes an entire chord progression.

**Requirements:**

* Progression with `progressionId` must exist.

**Effects:**

* Removes the `Progression` identified by `progressionId`.

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

**Description:** Renames an existing chord progression.

**Requirements:**

* Progression with `progressionId` must exist.

**Effects:**

* Updates the `name` of the `Progression` identified by `progressionId`.

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

### POST /api/ProgressionBuilder/getProgression

**Description:** Retrieves a specific chord progression by its ID.

**Requirements:**

* Progression with `progressionId` must exist.

**Effects:**

* Returns the `Progression` object for the `progressionId`.

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

***

### POST /api/ProgressionBuilder/listProgressions

**Description:** Lists all available chord progressions by their ID and name.

**Requirements:**

* None.

**Effects:**

* Returns an object containing an array of objects, each with the `id` and `name` of a progression.

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

***
