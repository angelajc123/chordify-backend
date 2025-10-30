---
timestamp: 'Wed Oct 29 2025 20:30:50 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251029_203050.7bbf7edf.md]]'
content_id: c3d8da55a3d528e7a9d49b1dbbe6614965b321c02043ac6250fbfd46d26c536c
---

# API Specification: PlayBack Concept

**Purpose:** Enable musical playback features for chord progressions by managing associated settings and providing note information.

***

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Initializes default playback settings for a given progression ID.

**Requirements:**

* Playback settings must not already exist for the `progressionId`.

**Effects:**

* Creates new playback settings with `instrument: "Piano"` and `secondsPerChord: 1` for the given `progressionId`.
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

* The `instrument` must be one of the allowed instruments (e.g., from `@shared/constants.ts`).
* Playback settings must exist for the `progressionId`.

**Effects:**

* Updates the `instrument` for the playback settings associated with `progressionId`.

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

* `secondsPerChord` must be between the defined minimum and maximum values (e.g., `MIN_SECONDS_PER_CHORD` and `MAX_SECONDS_PER_CHORD` from `@shared/constants.ts`).
* Playback settings must exist for the `progressionId`.

**Effects:**

* Updates the `secondsPerChord` for the playback settings associated with `progressionId`.

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

**Description:** Retrieves the playback settings for a specific progression.

**Requirements:**

* Playback settings must exist for the `progressionId`.

**Effects:**

* Returns the playback settings associated with `progressionId`.

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

### POST /api/PlayBack/getChordNotes

**Description:** Gets the individual notes for a given chord symbol.

**Requirements:**

* `chord` must be a valid chord symbol (e.g., "C", "Am") or `null`.

**Effects:**

* Returns an array of notes (with a default octave '4' for consistent playback) that comprise the specified chord.
* Returns an empty array if `chord` is `null`.

**Request Body:**

```json
{
  "chord": "string | null"
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

**Description:** Gets the notes for an entire progression of chord symbols.

**Requirements:**

* All chords in the `progression` array must be valid chord symbols (e.g., "C", "Am") or `null`.

**Effects:**

* Returns an array of arrays, where each inner array contains the notes for a corresponding chord in the progression.

**Request Body:**

```json
{
  "progression": [
    "string | null"
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
