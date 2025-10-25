---
timestamp: 'Sat Oct 25 2025 15:50:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251025_155001.b4a1c9b1.md]]'
content_id: d33077fdec69f61c6901e4409c0e708c99eebe4e2d1ba03638869b0d402f9b79
---

# API Specification: PlayBack Concept

**Purpose:** Manages and retrieves playback settings for musical chord progressions, and provides musical information about chords.

***

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Initializes default playback settings for a given progression ID.

**Requirements:**

* Playback settings for the `progressionId` must not already exist.

**Effects:**

* A new `PlaybackSettings` entry is created with default instrument "Piano" and `secondsPerChord` of 1. The new settings are returned.

**Request Body:**

```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "settings": {
    "_id": "ID",
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

***

### POST /api/PlayBack/setInstrument

**Description:** Sets the instrument for playback of a specified progression.

**Requirements:**

* The `instrument` must be one of the predefined valid instruments (e.g., "Piano", "Guitar").
* Playback settings for the `progressionId` must exist.

**Effects:**

* The `instrument` for the `progressionId`'s playback settings is updated.

**Request Body:**

```json
{
  "progressionId": "ID",
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

***

### POST /api/PlayBack/setSecondsPerChord

**Description:** Sets the duration, in seconds, for each chord in a specified progression.

**Requirements:**

* `secondsPerChord` must be between `MIN_SECONDS_PER_CHORD` and `MAX_SECONDS_PER_CHORD`.
* Playback settings for the `progressionId` must exist.

**Effects:**

* The `secondsPerChord` for the `progressionId`'s playback settings is updated.

**Request Body:**

```json
{
  "progressionId": "ID",
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

***

### POST /api/PlayBack/getPlayBackSettings

**Description:** Retrieves the current playback settings for a specific progression.

**Requirements:**

* Playback settings for the `progressionId` must exist.

**Effects:**

* Returns the `PlaybackSettings` object for the given `progressionId`.

**Request Body:**

```json
{
  "progressionId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "settings": {
    "_id": "ID",
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

***

### POST /api/PlayBack/getChordNotes

**Description:** Retrieves the individual notes that comprise a given chord symbol.

**Requirements:**

* The `chord` string must represent a valid chord (e.g., "Cmaj7", "Am").

**Effects:**

* Returns an array of notes (e.g., "C", "E", "G") for the specified `chord`.

**Request Body:**

```json
{
  "chord": "string"
}
```

**Success Response Body (Action):**

```json
{
  "notes": [
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

### POST /api/PlayBack/getProgressionNotes

**Description:** Retrieves the notes for each chord in a provided progression sequence.

**Requirements:**

* All chords in the `progression` array must be valid chord symbols.

**Effects:**

* Returns a nested array where each inner array contains the notes for a corresponding chord in the `progression`.

**Request Body:**

```json
{
  "progression": [
    "string"
  ]
}
```

**Success Response Body (Action):**

```json
{
  "notes": [
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

***
