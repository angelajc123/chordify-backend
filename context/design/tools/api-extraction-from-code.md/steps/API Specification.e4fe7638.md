---
timestamp: 'Thu Oct 30 2025 16:17:04 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251030_161704.7080af51.md]]'
content_id: e4fe76388b3b8ab74fa91ba43e4a375998f6addf2289b9511f2f705bfde927cf
---

# API Specification: PlayBack Concept

**Purpose:** Manage settings and retrieve musical notes for chord progressions, enabling playback functionality.

***

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Initializes playback settings for a given progression ID with default values.

**Requirements:**

* Playback settings for `progressionId` must not already exist.

**Effects:**

* Creates new `PlaybackSettings` for `progressionId`.
* Sets the `instrument` to "Piano" and `secondsPerChord` to 1.
* Returns the created settings.

**Request Body:**

```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "settings": {
    "_id": "string",
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

**Description:** Sets the instrument for a specific progression's playback.

**Requirements:**

* The `instrument` must be one of the predefined valid instruments (e.g., "Piano", "Guitar").
* Playback settings for `progressionId` must exist.

**Effects:**

* Updates the `instrument` for the `progressionId`'s playback settings.

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

***

### POST /api/PlayBack/setSecondsPerChord

**Description:** Sets the duration for each chord in a progression's playback.

**Requirements:**

* `secondsPerChord` must be between `MIN_SECONDS_PER_CHORD` and `MAX_SECONDS_PER_CHORD`.
* Playback settings for `progressionId` must exist.

**Effects:**

* Updates the `secondsPerChord` for the `progressionId`'s playback settings.

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

***

### POST /api/PlayBack/getPlayBackSettings

**Description:** Retrieves the current playback settings for a given progression ID.

**Requirements:**

* Playback settings for `progressionId` must exist.

**Effects:**

* Returns the `PlaybackSettings` for the `progressionId`.

**Request Body:**

```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "settings": {
    "_id": "string",
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

### POST /api/PlayBack/deleteSettings

**Description:** Deletes the playback settings associated with a specific progression ID.

**Requirements:**

* Playback settings for `progressionId` must exist.

**Effects:**

* Removes the `PlaybackSettings` for the `progressionId`.

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

### POST /api/PlayBack/getChordNotes

**Description:** Retrieves the individual notes (with octave) that comprise a given chord.

**Requirements:**

* The `chord` must be a valid chord string or `null`. If `null`, an empty array of notes is returned. If not null, it must be a valid chord recognized by the system.

**Effects:**

* Returns an array of note strings (e.g., "C4", "E4", "G4") for the specified chord.

**Request Body:**

```json
{
  "chord": "string | null"
}
```

**Success Response Body (Action):**

```json
{
  "notes": ["string"]
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

**Description:** Retrieves the individual notes (with octave) for each chord in a given progression.

**Requirements:**

* The `progression` must be an array of valid chord strings or `null`. Each chord within the progression must be valid.

**Effects:**

* Returns a 2D array where each inner array contains note strings for a corresponding chord in the progression.

**Request Body:**

```json
{
  "progression": ["string | null"]
}
```

**Success Response Body (Action):**

```json
{
  "notes": [
    ["string"]
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
