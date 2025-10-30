---
timestamp: 'Wed Oct 29 2025 20:30:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251029_203050.7bbf7edf.md]]'
content_id: d757e04b82324b98c0f1165f10fbd18fc627d15e469b7cb4d777f0e633772f7d
---

# API Specification: ProgressionBuilder Concept

**Purpose:** Manage the creation, modification, and deletion of musical chord progressions.

***

## API Endpoints

### POST /api/ProgressionBuilder/createProgression

**Description:** Creates a new chord progression with a given name and an empty list of chords.

**Requirements:**

* None.

**Effects:**

* Creates a new progression with a unique ID, the specified name, and an empty `chords` array.
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

* A progression with the given `progressionId` must exist.

**Effects:**

* Appends a new slot with a `null` chord to the `chords` array of the specified progression.

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

**Description:** Sets a chord at a specific position within a progression.

**Requirements:**

* A progression with the given `progressionId` must exist.
* The `position` must be a valid zero-indexed position within the progression's chords array.
* The `chord` must be a valid chord symbol (e.g., "C", "Am").

**Effects:**

* Updates the chord at the specified `position` in the progression's `chords` array.

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

**Description:** Deletes a chord at a specific position within a progression by setting it to null.

**Requirements:**

* A progression with the given `progressionId` must exist.
* The `position` must be a valid zero-indexed position within the progression's chords array.

**Effects:**

* Sets the chord at the specified `position` in the progression's `chords` array to `null`.

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

**Description:** Deletes an entire slot (chord and its position) from a progression.

**Requirements:**

* A progression with the given `progressionId` must exist.
* The `position` must be a valid zero-indexed position within the progression's chords array.

**Effects:**

* Removes the slot at the specified `position` from the `chords` array of the progression, shifting subsequent slots.

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

**Description:** Reorders the slots within a progression.

**Requirements:**

* A progression with the given `progressionId` must exist.
* Both `oldPosition` and `newPosition` must be valid zero-indexed positions within the progression's chords array.

**Effects:**

* Moves the chord slot from `oldPosition` to `newPosition` within the `chords` array.

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

* A progression with the given `progressionId` must exist.

**Effects:**

* Removes the progression identified by `progressionId` from the system.

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

* A progression with the given `progressionId` must exist.

**Effects:**

* Updates the `name` of the progression identified by `progressionId`.

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

* A progression with the given `progressionId` must exist.

**Effects:**

* Returns the complete progression object identified by `progressionId`.

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

* Returns an array of objects, where each object contains the ID and name of a progression.

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
