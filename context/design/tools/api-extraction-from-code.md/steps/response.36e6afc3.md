---
timestamp: 'Tue Oct 21 2025 14:54:32 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_145432.04649123.md]]'
content_id: 36e6afc38d860e98d6842dad4de201d34ff4cad3662f3718c2e740169bd2c2d0
---

# response:

````markdown
# API Specification: PlayBack Concept

**Purpose:** To allow users to listen to progressions easily, enabling rapid feedback and iteration during composition.

---

## API Endpoints

### POST /api/PlayBack/initializeSettings

**Description:** Action: Initializes playback settings for a given progression.

**Requirements:**
- progression does not exist in PlaybackSettings.

**Effects:**
- Creates a new PlaybackSettings for progression with default values for instrument ('Grand Piano') and secondsPerChord (1).

**Request Body:**
```json
{
  "progressionId": "string"
}
````

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
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

**Description:** Action: Sets the instrument for a progression's playback.

**Requirements:**

* progression exists in PlaybackSettings.

**Effects:**

* Updates the PlaybackSettings for progression with the given instrument.

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

**Description:** Action: Sets the duration (in seconds) for each chord in a progression's playback.

**Requirements:**

* progression exists in PlaybackSettings.

**Effects:**

* Updates the PlaybackSettings for progression with the given secondsPerChord.

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

### POST /api/PlayBack/getProgressionSettings

**Description:** Query: Retrieves the playback settings for a specific progression. (Note: Although described as a query, this method does not start with `_` and therefore follows action response rules, returning a single object.)

**Requirements:**

* Playback settings for progressionId must exist.

**Effects:**

* Returns the PlaybackSettings for progression.

**Request Body:**

```json
{
  "progressionId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "_id": "string",
  "instrument": "string",
  "secondsPerChord": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PlayBack/playChord

**Description:** Action: Provides data to play a single chord using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**

* progression exists in PlaybackSettings.

**Effects:**

* Returns an object containing the notes, instrument, and duration for the chord.

**Request Body:**

```json
{
  "progressionId": "string",
  "chord": "string"
}
```

**Success Response Body (Action):**

```json
{
  "notes": ["string"],
  "instrument": "string",
  "duration": "number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PlayBack/playProgression

**Description:** Action: Provides data to play a sequence of chords (a progression) using the progression's settings. This action does not directly play audio but returns the necessary musical data and settings for a client-side audio engine (e.g., Tone.js) to perform playback.

**Requirements:**

* progression exists in PlaybackSettings.

**Effects:**

* Returns an array of objects, each representing a chord or rest with its notes and duration, along with the instrument.

**Request Body:**

```json
{
  "progressionId": "string",
  "chordSequence": ["string" | null]
}
```

**Success Response Body (Action):**

```json
{
  "sequence": [
    {
      "notes": ["string"],
      "duration": "number"
    },
    {
      "rest": "boolean",
      "duration": "number"
    }
  ],
  "instrument": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
