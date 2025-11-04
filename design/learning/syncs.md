# prompt: should I create syncs for every set method that checks to see the progression exists before calling it? The only sync I can think of right now is syncing createProgression, initializePreferences, and initializeSettings.

[@implementing-synchronizations](../background/implementing-synchronizations.md)
[@playback-concept-specification](../concepts/PlayBack/PlayBackSpec.md)
# concept: PlayBack
*   **concept**: PlayBack [Progression]
*   **purpose**: allow users to listen to sequences of musical units easily, enabling rapid feedbackand iteration during composition.
*   **principle**: A user can set play back settings such as instrument and seconds per chord. The user can play sequences of chords or a single chord.
*   **state**:
    *   A set of `ProgressionPlaybackSettings` with
        *   A `progression` of type `Progression`
        *   An `instrument` of type `String`, default `Grand Piano`
        *   A `secondsPerChord` of type `Number`, default `1`

*   **actions**:
    *   `initializeSettings(progression: Progression) : (progressionPlaybackSettings: ProgressionPlaybackSettings)`
        *   **requires**: `progression` does not exist in ProgressionPlaybackSettings
        *   **effect**: creates a new `ProgressionPlaybackSettings` for `progression` with default values for `instrument`, `secondsPerChord`.
    *   `setInstrument(progression: Progression, instrument: String)`
        *   **requires**: `progression` exists in `ProgressionPlaybackSettings`
        *   **effect**: updates the `ProgressionPlaybackSettings` for `progression` with the given `instrument`.
    *   `setSecondsPerChord(progression: Progression, secondsPerChord: Number)`
        *   **requires**: `progression` exists in `ProgressionPlaybackSettings`
        *   **effect**: updates the `ProgressionPlaybackSettings` for `progression` with the given `secondsPerChord`.
    *   `getProgressionSettings(progression: Progression): (progressionSettings: ProgressionPlaybackSettings)`
        *   **effect**: returns the `ProgressionPlaybackSettings` for `progression`.
    *   `playChord(progression: Progression, chord: String)`
        *   **requires**: `progression` exists in `ProgressionPlaybackSettings`
        *   **effect**: plays the given `chord` using the settings in `ProgressionPlaybackSettings` for `progression`.
    *   `playProgression(progression: Progression, chordSequence: (String | null)[])`
        *   **requires**: `progression` exists in `ProgressionPlaybackSettings`
        *   **effect**: plays the given `chordSequence` using the settings in `ProgressionPlaybackSettings` for `progression`.
[@progressionbuilder-concept-specification](../concepts/ProgressionBuilder/ProgressionBuilderSpec.md)
# concept: ProgressionBuilder
*   **concept**: ProgressionBuilder
*   **purpose**: enable users to quickly and easily construct and modify a chord progression by adding, setting, or removing chords.
*   **principle**: A user creates a new progession, which starts as an empty sequence, and names it. They can add new slots to extend the sequence, and set chords to slots, remove chords from slots, remove slots, or reorder slots.
*   **state**:
    *   A set of `Progressions` with
        *   An `id` of type `Number`
        *   A `name` of type `String`
        *   A `chordSequence` of type sequence of `Slots`, each with
            *   a `chord` of type `String`, or `null` if no chord is set
*   **actions**:
    *   `createProgression(name: String): (progression: Progression)`
        *   **effect**: Creates a new, empty progression with the given name, and unique id, and returns that id.
    *   `addSlot(progressionId: Number)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: appends a null `Slot` to `chordSequence` of the progression with id `progressionId`
    *   `setChord(progressionId: Number, position: Number, chord: String)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: sets the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`’s `chord` to `chord`
    *   `deleteChord(progressionId: Number, position: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: sets `chord` at the `Slot` at `position` of `chordSequence` of the progression with id `progressionId` to `null`
    *   `deleteSlot(progressionId: Number, position: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `position` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: removes the `Slot` at `position` of `chordSequence` of the progression with id `progressionId`
    *   `reorderSlots(progressionId: Number, oldPosition: Number, newPosition: Number)`
        *   **requires**: `progressionId` is a valid id of a progression, `oldPosition` is a valid index of `chordSequence` of the progression with id `progressionId`, `newPosition` is a valid index of `chordSequence` of the progression with id `progressionId`
        *   **effect**: moves the `Slot` at `oldPosition` of `chordSequence` of the progression with id `progressionId` to `newPosition`
    *   `deleteProgression(progressionId: Number)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: removes the progression with id `progressionId`
    *   `renameProgression(progressionId: Number, name: String)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: sets the name of the progression with id `progressionId` to `name`
    *   `getProgression(progressionId: Number) : (progression: Progression)`
        *   **requires**: `progressionId` is a valid id of a progression
        *   **effect**: returns the progression with id `progressionId`
    *   `listProgressions() : (progressionIdentifiers: List of (id: Number, name: String))`
        *   **effect**: returns a list of all progression names and ids
[@suggestchord-concept-specification](../concepts/SuggestChord/SuggestChordSpec.md)
# concept: SuggestChord
*   **concept**: SuggestChord [Progression]
*   **purpose**: offer users suggestions for suitable chords and progressions based on preferences
*   **principle**: a user will select a progression that they would like to apply their preferences to. The user can set their prefered genre, complexity level, and key of the progression as context for chord suggestion. The user can then either generate a whole progression or can generate suggestions for a single chord in the progression.
*   **state**:
    *   A set of `ProgressionSuggestionPreferences` with
        *   A `progression` of type `Progression`
        *   A `preferredGenre` of type `String`, default `Pop`
        *   A `complexityLevel` of type `String`, default `Basic`
        *   A `key` of type `String`, default `Cmaj`

*   **actions**:
    *   `initializePreferences(progression: Progression): (progressionSuggestionPreferences: ProgressionSuggestionPreferences)`
        *   **requires**: `progression` does not exist in ProgressionSuggestionPreferences
        *   **effect**: creates a new `ProgressionSuggestionPreferences` for `progression` with default values for `preferredGenre`, `complexityLevel`, and `key`.
    *   `setPreferredGenre(progression: Progression, preferredGenre: String)`
        *   **requires**: `progression` exists in `ProgressionSuggestionPreferences`
        *   **effect**: updates the `ProgressionSuggestionPreferences` for `progression` with the given `genre`.
    *   `setComplexityLevel(progression: Progression, complexityLevel: String)`
        *   **requires**: `progression` exists in `ProgressionSuggestionPreferences`
        *   **effect**: updates the `ProgressionSuggestionPreferences` for `progression` with the given `complexityLevel`.
    *   `setKey(progression: Progression, key: String)`
        *   **requires**: `progression` exists in `ProgressionSuggestionPreferences`
        *   **effect**: updates the `ProgressionSuggestionPreferences` for `progression` with the given `key`.
    *   `getProgressionPreferences(progression: Progression): (progressionPreferences: ProgressionSuggestionPreferences)`
        *   **effect**: returns the `ProgressionSuggestionPreferences` for `progression`.
    *   `suggestChord(progression: Progression, chords: (String | null)[], position: Number): (suggestedChords: String[])`
        *   **requires**: `progression` exists in `ProgressionSuggestionPreferences`, `0 <= position < chords.length`
        *   **effect**: returns a list of suggested chords to put in `position` in `chords`, generated by an LLM given the context the `ProgressionSuggestionPreferences` for `progression` and the chords before and after it.
    *   `suggestProgression(progression: Progression, length: Number): (chordSequence: String[])`
        *   **requires**: `progression` exists in `ProgressionSuggestionPreferences`, `length > 0`
        *   **effect**: returns a chord progression of length `length`, generated by an LLM given the context the `ProgressionSuggestionPreferences` for `progression`.
# response:

Based on the provided concept specifications for `PlayBack`, `ProgressionBuilder`, and `SuggestChord`, here's a breakdown of recommended routes and synchronizations.

---

## Routes to Include/Exclude

Routes represent external API endpoints that trigger actions within your application. They typically map to `Requesting.request` actions. I'll use `/api/v1` as a common base path.

### Routes to Include

**ProgressionBuilder Routes (Core Progression Management)**

These routes allow users to create, modify, and retrieve chord progressions.

*   `POST /api/v1/progression/create`
    *   **Purpose**: Create a new, empty chord progression.
    *   **Input (body)**: `{ "name": "My New Progression" }`
    *   **Triggers**: `ProgressionBuilder.createProgression`
*   `GET /api/v1/progressions`
    *   **Purpose**: List all existing progressions (ID and name).
    *   **Output**: `[ { "id": 123, "name": "Progression A" }, ... ]`
    *   **Triggers**: `ProgressionBuilder.listProgressions`
*   `GET /api/v1/progression/{progressionId}`
    *   **Purpose**: Get detailed information for a specific progression.
    *   **Triggers**: `ProgressionBuilder.getProgression`
*   `POST /api/v1/progression/{progressionId}/rename`
    *   **Purpose**: Change the name of a progression.
    *   **Input (body)**: `{ "name": "Updated Progression Name" }`
    *   **Triggers**: `ProgressionBuilder.renameProgression`
*   `POST /api/v1/progression/{progressionId}/add-slot`
    *   **Purpose**: Add a new empty slot to the end of the progression's chord sequence.
    *   **Triggers**: `ProgressionBuilder.addSlot`
*   `POST /api/v1/progression/{progressionId}/set-chord`
    *   **Purpose**: Set a chord at a specific position in the sequence.
    *   **Input (body)**: `{ "position": 0, "chord": "Cmaj7" }`
    *   **Triggers**: `ProgressionBuilder.setChord`
*   `POST /api/v1/progression/{progressionId}/delete-chord`
    *   **Purpose**: Remove a chord from a specific position (sets it to `null`).
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `ProgressionBuilder.deleteChord`
*   `POST /api/v1/progression/{progressionId}/delete-slot`
    *   **Purpose**: Remove a slot entirely from the progression's chord sequence.
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `ProgressionBuilder.deleteSlot`
*   `POST /api/v1/progression/{progressionId}/reorder-slots`
    *   **Purpose**: Change the order of slots in the progression.
    *   **Input (body)**: `{ "oldPosition": 0, "newPosition": 2 }`
    *   **Triggers**: `ProgressionBuilder.reorderSlots`
*   `DELETE /api/v1/progression/{progressionId}`
    *   **Purpose**: Delete an entire progression.
    *   **Triggers**: `ProgressionBuilder.deleteProgression`

**PlayBack Routes (Audio Playback Functionality)**

These routes control how a progression is played.

*   `GET /api/v1/playback/settings/{progressionId}`
    *   **Purpose**: Retrieve the current playback settings for a progression.
    *   **Triggers**: `PlayBack.getProgressionSettings`
*   `POST /api/v1/playback/settings/{progressionId}/instrument`
    *   **Purpose**: Set the instrument used for playback.
    *   **Input (body)**: `{ "instrument": "Electric Guitar" }`
    *   **Triggers**: `PlayBack.setInstrument`
*   `POST /api/v1/playback/settings/{progressionId}/secondsPerChord`
    *   **Purpose**: Set the duration for each chord during playback.
    *   **Input (body)**: `{ "secondsPerChord": 1.5 }`
    *   **Triggers**: `PlayBack.setSecondsPerChord`
*   `POST /api/v1/playback/play/chord/{progressionId}`
    *   **Purpose**: Play a specific chord using the progression's settings.
    *   **Input (body)**: `{ "chord": "Cmaj" }`
    *   **Triggers**: `PlayBack.playChord`
*   `POST /api/v1/playback/play/progression/{progressionId}`
    *   **Purpose**: Play the entire chord sequence of a progression using its settings.
    *   **Triggers**: `PlayBack.playProgression` (requires fetching the `chordSequence` from `ProgressionBuilder`)

**SuggestChord Routes (AI-Powered Suggestions)**

These routes allow users to get chord and progression suggestions.

*   `GET /api/v1/suggestchord/preferences/{progressionId}`
    *   **Purpose**: Retrieve the current suggestion preferences for a progression.
    *   **Triggers**: `SuggestChord.getProgressionPreferences`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/genre`
    *   **Purpose**: Set the preferred musical genre for suggestions.
    *   **Input (body)**: `{ "preferredGenre": "Jazz" }`
    *   **Triggers**: `SuggestChord.setPreferredGenre`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/complexity`
    *   **Purpose**: Set the desired complexity level for suggestions.
    *   **Input (body)**: `{ "complexityLevel": "Advanced" }`
    *   **Triggers**: `SuggestChord.setComplexityLevel`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/key`
    *   **Purpose**: Set the musical key for suggestions.
    *   **Input (body)**: `{ "key": "Amin" }`
    *   **Triggers**: `SuggestChord.setKey`
*   `POST /api/v1/suggestchord/suggest/chord/{progressionId}`
    *   **Purpose**: Get chord suggestions for a specific position in the progression.
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `SuggestChord.suggestChord` (requires fetching `chordSequence` from `ProgressionBuilder`)
*   `POST /api/v1/suggestchord/suggest/progression/{progressionId}`
    *   **Purpose**: Generate a full chord progression of a specified length based on preferences.
    *   **Input (body)**: `{ "length": 4 }`
    *   **Triggers**: `SuggestChord.suggestProgression`

### Routes to Exclude

Generally, "initialization" actions like `PlayBack.initializeSettings` and `SuggestChord.initializePreferences` should **not** have direct API routes. These actions are best handled internally through synchronizations that automatically trigger when a new `Progression` is created (e.g., via `ProgressionBuilder.createProgression`), ensuring consistency and reducing boilerplate for users.

---

## Synchronizations to Implement

Synchronizations define the internal cause-and-effect logic of your application. Here are key synchronizations demonstrating common patterns, inter-concept communication, and request/response handling.

**Shared Imports for all Syncs:**

```typescript
// src/syncs/imports.ts
import { actions, Sync, Frames } from "@engine";
import { Requesting } from "@concepts"; // Assuming a Requesting concept for handling HTTP requests
import { PlayBack, ProgressionBuilder, SuggestChord } from "@concepts";
```

---

### 1. Progression Creation and Dependent Initializations

This set of synchronizations demonstrates how creating a `Progression` automatically triggers the initialization of settings/preferences in other concepts.

```typescript
// src/syncs/progressionBuilder/createProgression.sync.ts

// 1. Handle the incoming API request to create a new progression
export const CreateProgressionRequest: Sync = ({ request, name }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
    ),
    then: actions(
        [ProgressionBuilder.createProgression, { name }],
    ),
});

// 2. Respond to the API request upon successful progression creation
export const CreateProgressionResponse: Sync = ({ request, progression, name }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
        [ProgressionBuilder.createProgression, { name }, { progression }], // 'progression' is the returned object
    ),
    then: actions(
        [Requesting.respond, { request, progression }],
    ),
});

// 3. Automatically initialize PlayBack settings when a new progression is created
export const InitializePlayBackSettingsOnProgressionCreate: Sync = ({ progression }) => ({
    when: actions(
        [ProgressionBuilder.createProgression, {}, { progression }], // Match on the output of createProgression
    ),
    then: actions(
        [PlayBack.initializeSettings, { progression }],
    ),
});

// 4. Automatically initialize SuggestChord preferences when a new progression is created
export const InitializeSuggestChordPreferencesOnProgressionCreate: Sync = ({ progression }) => ({
    when: actions(
        [ProgressionBuilder.createProgression, {}, { progression }], // Match on the output of createProgression
    ),
    then: actions(
        [SuggestChord.initializePreferences, { progression }],
    ),
});

// 5. Handle errors if progression creation fails
export const CreateProgressionError: Sync = ({ request, name, error }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
        [ProgressionBuilder.createProgression, { name }, { error }], // Match on error output from createProgression
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 2. Setting Playback Instrument (with `where` clause to fetch `Progression`)

This demonstrates a typical request-action-response flow where the `where` clause is used to retrieve necessary information (the `Progression` object) from another concept (`ProgressionBuilder`).

```typescript
// src/syncs/playback/setInstrument.sync.ts

// 1. Handle the incoming API request to set the instrument
export const SetInstrumentRequest: Sync = ({ request, progressionId, instrument, progression, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument`, progressionId, instrument }, { request }],
    ),
    where: async (frames) => {
        const originalFrame = frames[0]; // Capture the initial request frame

        // Query ProgressionBuilder to get the full progression object from the ID
        frames = await frames.query(ProgressionBuilder.getProgression, { progressionId }, { progression });
        
        // If no progression is found, create an error frame for the 'then' clause to respond
        if (frames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Progression not found." });
        }
        return frames;
    },
    then: actions(
        // If 'error' was bound in the 'where' clause, this responds with the error.
        // Otherwise, it calls PlayBack.setInstrument.
        [Requesting.respond, { request, error }], // Responds with error from where clause
        [PlayBack.setInstrument, { progression, instrument }], // Actual action if no error
    ),
});

// 2. Respond to the API request upon successful instrument setting
export const SetInstrumentSuccessResponse: Sync = ({ request, progressionId, instrument }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument`, progressionId, instrument }, { request }],
        [PlayBack.setInstrument, {}, {}], // Match successful execution of setInstrument
    ),
    then: actions(
        [Requesting.respond, { request, status: "success", progressionId, instrument }],
    ),
});

// 3. Handle errors if PlayBack.setInstrument itself returns an error
export const SetInstrumentActionErrorResponse: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument` }, { request }],
        [PlayBack.setInstrument, {}, { error }], // Assuming setInstrument can return an error output
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 3. Suggest Chords (Querying multiple concepts and data transformation in `where`)

This complex synchronization fetches data from `ProgressionBuilder` and `SuggestChord` and transforms it before calling `SuggestChord.suggestChord`.

```typescript
// src/syncs/suggestChord/suggestChord.sync.ts

// 1. Handle the incoming API request to suggest chords for a position
export const SuggestChordRequest: Sync = ({ request, progressionId, position, progression, progressionPreferences, chordsAsStrings, suggestedChords, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}`, progressionId, position }, { request }],
    ),
    where: async (frames) => {
        const originalFrame = frames[0]; // Capture the initial request frame

        // First, get the full Progression object from ProgressionBuilder
        let currentFrames = await frames.query(ProgressionBuilder.getProgression, { progressionId }, { progression });

        // Handle case: Progression not found
        if (currentFrames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Progression not found." });
        }

        // Next, get the suggestion preferences for this progression
        currentFrames = await currentFrames.query(SuggestChord.getProgressionPreferences, { progression }, { progressionPreferences });
        
        // Handle case: Suggestion preferences not found (should be rare if auto-initialized)
        if (currentFrames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Suggestion preferences not found for this progression." });
        }

        // Transform the progression's chordSequence (an array of Slots) into a flat array of strings/nulls
        return currentFrames.map(($) => {
            const rawChordSequence = $[progression].chordSequence; // Access the 'progression' binding
            const extractedChords = rawChordSequence.map(slot => slot.chord);
            return { ...$, [chordsAsStrings]: extractedChords }; // Bind the transformed chords for 'then' clause
        });
    },
    then: actions(
        // If 'error' was bound in 'where', this responds with the error.
        // Otherwise, it calls SuggestChord.suggestChord.
        [Requesting.respond, { request, error }], // Responds with error from where clause
        [SuggestChord.suggestChord, { progression, chords: chordsAsStrings, position }], // Actual action if no error
    ),
});

// 2. Respond to the API request with the successfully suggested chords
export const SuggestChordSuccessResponse: Sync = ({ request, suggestedChords }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}` }, { request }], // Original request
        [SuggestChord.suggestChord, {}, { suggestedChords }], // Success from the suggestion action
    ),
    then: actions(
        [Requesting.respond, { request, suggestedChords }],
    ),
});

// 3. Handle errors if SuggestChord.suggestChord itself returns an error
export const SuggestChordActionErrorResponse: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}` }, { request }],
        [SuggestChord.suggestChord, {}, { error }], // Error from the suggestion action
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 4. Progression Deletion (and Cleanup Consideration)

This sync handles the deletion of a progression. Note that `PlayBack` and `SuggestChord` concepts do not explicitly provide `deleteSettings` or `deletePreferences` actions in their specifications. If these dependent states need explicit cleanup, such actions would be required. In their absence, these settings/preferences might become orphaned, though queries for them would fail if the referenced `progression` no longer exists.

```typescript
// src/syncs/progressionBuilder/deleteProgression.sync.ts

// 1. Handle the incoming API request to delete a progression
export const DeleteProgressionRequest: Sync = ({ request, progressionId }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
    ),
    then: actions(
        [ProgressionBuilder.deleteProgression, { progressionId }],
    ),
});

// 2. Respond to the API request upon successful progression deletion
export const DeleteProgressionResponse: Sync = ({ request, progressionId }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
        [ProgressionBuilder.deleteProgression, { progressionId }, {}], // Match successful execution
    ),
    then: actions(
        [Requesting.respond, { request, status: "success", message: `Progression ${progressionId} deleted.` }],
    ),
});

// 3. Handle errors if progression deletion fails
export const DeleteProgressionError: Sync = ({ request, progressionId, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
        [ProgressionBuilder.deleteProgression, { progressionId }, { error }], // Match error output
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});

// Note on Cleanup:
// The PlayBack and SuggestChord concepts do not define explicit actions to delete their settings/preferences.
// If explicit cleanup is required (e.g., to prevent orphaned records in storage),
// these concepts would need actions like `PlayBack.deleteSettings(progression: Progression)`
// and `SuggestChord.deletePreferences(progression: Progression)`.
// If such actions existed, you would add syncs like:
/*
export const CleanUpPlayBackSettingsOnProgressionDelete: Sync = ({ progressionId, progression }) => ({
    when: actions(
        [ProgressionBuilder.deleteProgression, { progressionId }, { progression }], // If deleteProgression returns the deleted object
    ),
    then: actions(
        [PlayBack.deleteSettings, { progression }],
    ),
});
// And similar for SuggestChord.
*/
```
# response:

Yes, for `set` methods (and indeed, many `get` or other operational methods) that are initiated by external requests (e.g., API calls), you *should* implement synchronizations that explicitly check for the existence of required entities like `Progression` or its associated settings/preferences before attempting the main action.

### Why Existence Checks are Crucial in Synchronizations

1.  **Adherence to `requires` clauses:** Your concept specifications explicitly state `requires` conditions (e.g., "progression exists in ProgressionPlaybackSettings"). Synchronizations are the mechanism to enforce these at the application level.
2.  **Robust Error Handling:** Without these checks, attempting an action on non-existent data would likely lead to runtime errors or unexpected behavior. Synchronizations allow you to gracefully handle these "not found" scenarios and return meaningful error messages to the client.
3.  **Separation of Concerns:** The concept actions themselves should focus on the business logic given valid inputs. The synchronizations act as the "glue" that validates the context and orchestrates the flow.
4.  **Idempotency and Consistency:** Ensures that operations like setting a preference only proceed if the foundational entity (the progression) is present, maintaining a consistent state.

### How Existence Checks are Done

You perform these checks primarily within the `where` clause of your synchronizations using the `.query` method and inspecting the `frames.length`. If a query for a required entity (like `ProgressionBuilder.getProgression` or `PlayBack.getProgressionSettings`) returns an empty set of `frames`, it means the entity doesn't exist. You then typically create an `error` binding in the `frame` to be picked up by a `Requesting.respond` action in the `then` clause.

### The Syncs You Mentioned (`createProgression`, `initializePreferences`, `initializeSettings`)

You are absolutely right that `createProgression`, `initializePreferences`, and `initializeSettings` are key candidates for synchronization. The most logical place to "sync" `initializePreferences` and `initializeSettings` is immediately *after* a `Progression` has been successfully created. This ensures that every new progression automatically has its default playback settings and suggestion preferences initialized.

Below, I'll provide detailed routes and synchronizations covering your question, including the initialization flow and examples of `set` methods with existence checks.

---

## Routes to Include/Exclude

Routes represent external API endpoints that trigger actions within your application. They typically map to `Requesting.request` actions. I'll use `/api/v1` as a common base path.

### Routes to Include

**ProgressionBuilder Routes (Core Progression Management)**

These routes allow users to create, modify, and retrieve chord progressions.

*   `POST /api/v1/progression/create`
    *   **Purpose**: Create a new, empty chord progression.
    *   **Input (body)**: `{ "name": "My New Progression" }`
    *   **Triggers**: `ProgressionBuilder.createProgression`
*   `GET /api/v1/progressions`
    *   **Purpose**: List all existing progressions (ID and name).
    *   **Output**: `[ { "id": 123, "name": "Progression A" }, ... ]`
    *   **Triggers**: `ProgressionBuilder.listProgressions`
*   `GET /api/v1/progression/{progressionId}`
    *   **Purpose**: Get detailed information for a specific progression.
    *   **Triggers**: `ProgressionBuilder.getProgression`
*   `POST /api/v1/progression/{progressionId}/rename`
    *   **Purpose**: Change the name of a progression.
    *   **Input (body)**: `{ "name": "Updated Progression Name" }`
    *   **Triggers**: `ProgressionBuilder.renameProgression`
*   `POST /api/v1/progression/{progressionId}/add-slot`
    *   **Purpose**: Add a new empty slot to the end of the progression's chord sequence.
    *   **Triggers**: `ProgressionBuilder.addSlot`
*   `POST /api/v1/progression/{progressionId}/set-chord`
    *   **Purpose**: Set a chord at a specific position in the sequence.
    *   **Input (body)**: `{ "position": 0, "chord": "Cmaj7" }`
    *   **Triggers**: `ProgressionBuilder.setChord`
*   `POST /api/v1/progression/{progressionId}/delete-chord`
    *   **Purpose**: Remove a chord from a specific position (sets it to `null`).
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `ProgressionBuilder.deleteChord`
*   `POST /api/v1/progression/{progressionId}/delete-slot`
    *   **Purpose**: Remove a slot entirely from the progression's chord sequence.
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `ProgressionBuilder.deleteSlot`
*   `POST /api/v1/progression/{progressionId}/reorder-slots`
    *   **Purpose**: Change the order of slots in the progression.
    *   **Input (body)**: `{ "oldPosition": 0, "newPosition": 2 }`
    *   **Triggers**: `ProgressionBuilder.reorderSlots`
*   `DELETE /api/v1/progression/{progressionId}`
    *   **Purpose**: Delete an entire progression.
    *   **Triggers**: `ProgressionBuilder.deleteProgression`

**PlayBack Routes (Audio Playback Functionality)**

These routes control how a progression is played.

*   `GET /api/v1/playback/settings/{progressionId}`
    *   **Purpose**: Retrieve the current playback settings for a progression.
    *   **Triggers**: `PlayBack.getProgressionSettings`
*   `POST /api/v1/playback/settings/{progressionId}/instrument`
    *   **Purpose**: Set the instrument used for playback.
    *   **Input (body)**: `{ "instrument": "Electric Guitar" }`
    *   **Triggers**: `PlayBack.setInstrument`
*   `POST /api/v1/playback/settings/{progressionId}/secondsPerChord`
    *   **Purpose**: Set the duration for each chord during playback.
    *   **Input (body)**: `{ "secondsPerChord": 1.5 }`
    *   **Triggers**: `PlayBack.setSecondsPerChord`
*   `POST /api/v1/playback/play/chord/{progressionId}`
    *   **Purpose**: Play a specific chord using the progression's settings.
    *   **Input (body)**: `{ "chord": "Cmaj" }`
    *   **Triggers**: `PlayBack.playChord`
*   `POST /api/v1/playback/play/progression/{progressionId}`
    *   **Purpose**: Play the entire chord sequence of a progression using its settings.
    *   **Triggers**: `PlayBack.playProgression` (requires fetching the `chordSequence` from `ProgressionBuilder`)

**SuggestChord Routes (AI-Powered Suggestions)**

These routes allow users to get chord and progression suggestions.

*   `GET /api/v1/suggestchord/preferences/{progressionId}`
    *   **Purpose**: Retrieve the current suggestion preferences for a progression.
    *   **Triggers**: `SuggestChord.getProgressionPreferences`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/genre`
    *   **Purpose**: Set the preferred musical genre for suggestions.
    *   **Input (body)**: `{ "preferredGenre": "Jazz" }`
    *   **Triggers**: `SuggestChord.setPreferredGenre`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/complexity`
    *   **Purpose**: Set the desired complexity level for suggestions.
    *   **Input (body)**: `{ "complexityLevel": "Advanced" }`
    *   **Triggers**: `SuggestChord.setComplexityLevel`
*   `POST /api/v1/suggestchord/preferences/{progressionId}/key`
    *   **Purpose**: Set the musical key for suggestions.
    *   **Input (body)**: `{ "key": "Amin" }`
    *   **Triggers**: `SuggestChord.setKey`
*   `POST /api/v1/suggestchord/suggest/chord/{progressionId}`
    *   **Purpose**: Get chord suggestions for a specific position in the progression.
    *   **Input (body)**: `{ "position": 0 }`
    *   **Triggers**: `SuggestChord.suggestChord` (requires fetching `chordSequence` from `ProgressionBuilder`)
*   `POST /api/v1/suggestchord/suggest/progression/{progressionId}`
    *   **Purpose**: Generate a full chord progression of a specified length based on preferences.
    *   **Input (body)**: `{ "length": 4 }`
    *   **Triggers**: `SuggestChord.suggestProgression`

### Routes to Exclude

Generally, "initialization" actions like `PlayBack.initializeSettings` and `SuggestChord.initializePreferences` should **not** have direct API routes. These actions are best handled internally through synchronizations that automatically trigger when a new `Progression` is created (e.g., via `ProgressionBuilder.createProgression`), ensuring consistency and reducing boilerplate for users.

---

## Synchronizations to Implement

Synchronizations define the internal cause-and-effect logic of your application. Here are key synchronizations demonstrating common patterns, inter-concept communication, and request/response handling.

**Shared Imports for all Syncs:**

```typescript
// src/syncs/imports.ts
import { actions, Sync, Frames } from "@engine";
import { Requesting } from "@concepts"; // Assuming a Requesting concept for handling HTTP requests
import { PlayBack, ProgressionBuilder, SuggestChord } from "@concepts";
```

---

### 1. Progression Creation and Dependent Initializations (Addressing your core question)

This set of synchronizations demonstrates how creating a `Progression` automatically triggers the initialization of settings/preferences in other concepts.

```typescript
// src/syncs/progressionBuilder/createProgression.sync.ts

// 1. Handle the incoming API request to create a new progression
export const CreateProgressionRequest: Sync = ({ request, name }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
    ),
    then: actions(
        [ProgressionBuilder.createProgression, { name }],
    ),
});

// 2. Respond to the API request upon successful progression creation
export const CreateProgressionResponse: Sync = ({ request, progression, name }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
        [ProgressionBuilder.createProgression, { name }, { progression }], // 'progression' is the returned object
    ),
    then: actions(
        [Requesting.respond, { request, progression }],
    ),
});

// 3. Automatically initialize PlayBack settings when a new progression is created
export const InitializePlayBackSettingsOnProgressionCreate: Sync = ({ progression }) => ({
    when: actions(
        [ProgressionBuilder.createProgression, {}, { progression }], // Match on the output of createProgression
    ),
    then: actions(
        [PlayBack.initializeSettings, { progression }],
    ),
});

// 4. Automatically initialize SuggestChord preferences when a new progression is created
export const InitializeSuggestChordPreferencesOnProgressionCreate: Sync = ({ progression }) => ({
    when: actions(
        [ProgressionBuilder.createProgression, {}, { progression }], // Match on the output of createProgression
    ),
    then: actions(
        [SuggestChord.initializePreferences, { progression }],
    ),
});

// 5. Handle errors if progression creation fails
export const CreateProgressionError: Sync = ({ request, name, error }) => ({
    when: actions(
        [Requesting.request, { path: "/api/v1/progression/create", name }, { request }],
        [ProgressionBuilder.createProgression, { name }, { error }], // Match on error output from createProgression
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 2. Setting Playback Instrument (Example of a `set` method with an existence check)

This demonstrates a typical request-action-response flow where the `where` clause is used to retrieve necessary information (the `Progression` object and its settings) from other concepts and perform existence checks.

```typescript
// src/syncs/playback/setInstrument.sync.ts

// 1. Handle the incoming API request to set the instrument
export const SetInstrumentRequest: Sync = ({ request, progressionId, instrument, progression, progressionSettings, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument`, progressionId, instrument }, { request }],
    ),
    where: async (frames) => {
        const originalFrame = frames[0]; // Capture the initial request frame

        // 1. Query ProgressionBuilder to get the full progression object from the ID
        // This implicitly checks if the progression exists.
        frames = await frames.query(ProgressionBuilder.getProgression, { progressionId }, { progression });
        
        // If no progression is found, create an error frame for the 'then' clause to respond.
        if (frames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Progression not found." });
        }

        // 2. Query PlayBack to get the progression's playback settings.
        // This explicitly checks if the PlayBack settings for this progression exist
        // (as required by PlayBack.setInstrument).
        frames = await frames.query(PlayBack.getProgressionSettings, { progression }, { progressionSettings });

        // If PlayBack settings are not found (shouldn't happen if initialized correctly, but good to check)
        if (frames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Playback settings not found for this progression. Please create the progression first." });
        }

        return frames; // If all checks pass, proceed with the enriched frames
    },
    then: actions(
        // If 'error' was bound in the 'where' clause, this responds with the error.
        // Otherwise (if no error binding), the PlayBack.setInstrument action will fire.
        [Requesting.respond, { request, error }], // Always include a response for potential errors
        [PlayBack.setInstrument, { progression, instrument }], // Actual action if no error
    ),
});

// 2. Respond to the API request upon successful instrument setting
export const SetInstrumentSuccessResponse: Sync = ({ request, progressionId, instrument }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument`, progressionId, instrument }, { request }],
        [PlayBack.setInstrument, {}, {}], // Match successful execution of setInstrument (no output needed)
    ),
    then: actions(
        [Requesting.respond, { request, status: "success", progressionId, instrument }],
    ),
});

// 3. Handle errors if PlayBack.setInstrument itself returns an error
export const SetInstrumentActionErrorResponse: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/playback/settings/${progressionId}/instrument` }, { request }],
        [PlayBack.setInstrument, {}, { error }], // Assuming setInstrument can return an error output
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 3. Suggest Chords (Querying multiple concepts and data transformation in `where`)

This complex synchronization fetches data from `ProgressionBuilder` and `SuggestChord` and transforms it before calling `SuggestChord.suggestChord`. It also performs multiple existence checks.

```typescript
// src/syncs/suggestChord/suggestChord.sync.ts

// 1. Handle the incoming API request to suggest chords for a position
export const SuggestChordRequest: Sync = ({ request, progressionId, position, progression, progressionPreferences, chordsAsStrings, suggestedChords, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}`, progressionId, position }, { request }],
    ),
    where: async (frames) => {
        const originalFrame = frames[0]; // Capture the initial request frame

        // 1. Get the full Progression object from ProgressionBuilder (existence check)
        let currentFrames = await frames.query(ProgressionBuilder.getProgression, { progressionId }, { progression });

        // Handle case: Progression not found
        if (currentFrames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Progression not found." });
        }

        // 2. Get the suggestion preferences for this progression (existence check)
        // SuggestChord.suggestChord requires `progression` to exist in `ProgressionSuggestionPreferences`
        currentFrames = await currentFrames.query(SuggestChord.getProgressionPreferences, { progression }, { progressionPreferences });
        
        // Handle case: Suggestion preferences not found (should be rare if auto-initialized, but possible)
        if (currentFrames.length === 0) {
            return new Frames({ ...originalFrame, [error]: "Suggestion preferences not found for this progression. Please ensure the progression is created." });
        }

        // 3. Validate position (as per SuggestChord.suggestChord requires clause)
        // Access the 'progression' binding from the currentFrames
        const progressionObject = currentFrames[0][progression];
        if (position < 0 || position >= progressionObject.chordSequence.length) {
             return new Frames({ ...originalFrame, [error]: "Invalid position for chord suggestion." });
        }


        // 4. Transform the progression's chordSequence (an array of Slots) into a flat array of strings/nulls
        return currentFrames.map(($) => {
            const rawChordSequence = $[progression].chordSequence; // Access the 'progression' binding
            const extractedChords = rawChordSequence.map(slot => slot.chord);
            return { ...$, [chordsAsStrings]: extractedChords }; // Bind the transformed chords for 'then' clause
        });
    },
    then: actions(
        // If 'error' was bound in 'where', this responds with the error.
        // Otherwise, it calls SuggestChord.suggestChord.
        [Requesting.respond, { request, error }], // Responds with error from where clause
        [SuggestChord.suggestChord, { progression, chords: chordsAsStrings, position }], // Actual action if no error
    ),
});

// 2. Respond to the API request with the successfully suggested chords
export const SuggestChordSuccessResponse: Sync = ({ request, suggestedChords }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}` }, { request }], // Original request
        [SuggestChord.suggestChord, {}, { suggestedChords }], // Success from the suggestion action
    ),
    then: actions(
        [Requesting.respond, { request, suggestedChords }],
    ),
});

// 3. Handle errors if SuggestChord.suggestChord itself returns an error
export const SuggestChordActionErrorResponse: Sync = ({ request, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/suggestchord/suggest/chord/${progressionId}` }, { request }],
        [SuggestChord.suggestChord, {}, { error }], // Error from the suggestion action
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});
```

---

### 4. Progression Deletion (and Cleanup Consideration)

This sync handles the deletion of a progression. Note that `PlayBack` and `SuggestChord` concepts do not explicitly provide `deleteSettings` or `deletePreferences` actions in their specifications. If these dependent states need explicit cleanup, such actions would be required. In their absence, these settings/preferences might become orphaned, though queries for them would fail if the referenced `progression` no longer exists.

```typescript
// src/syncs/progressionBuilder/deleteProgression.sync.ts

// 1. Handle the incoming API request to delete a progression
export const DeleteProgressionRequest: Sync = ({ request, progressionId }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
    ),
    then: actions(
        [ProgressionBuilder.deleteProgression, { progressionId }],
    ),
});

// 2. Respond to the API request upon successful progression deletion
export const DeleteProgressionResponse: Sync = ({ request, progressionId }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
        [ProgressionBuilder.deleteProgression, { progressionId }, {}], // Match successful execution
    ),
    then: actions(
        [Requesting.respond, { request, status: "success", message: `Progression ${progressionId} deleted.` }],
    ),
});

// 3. Handle errors if progression deletion fails
export const DeleteProgressionError: Sync = ({ request, progressionId, error }) => ({
    when: actions(
        [Requesting.request, { path: `/api/v1/progression/${progressionId}`, method: "DELETE", progressionId }, { request }],
        [ProgressionBuilder.deleteProgression, { progressionId }, { error }], // Match error output
    ),
    then: actions(
        [Requesting.respond, { request, error }],
    ),
});

// Note on Cleanup:
// The PlayBack and SuggestChord concepts do not define explicit actions to delete their settings/preferences.
// If explicit cleanup is required (e.g., to prevent orphaned records in storage),
// these concepts would need actions like `PlayBack.deleteSettings(progression: Progression)`
// and `SuggestChord.deletePreferences(progression: Progression)`.
// If such actions existed, you would add syncs like:
/*
export const CleanUpPlayBackSettingsOnProgressionDelete: Sync = ({ progressionId, progression }) => ({
    when: actions(
        // Assuming ProgressionBuilder.deleteProgression could return the deleted progression object.
        // If not, you might need a query before deletion to get the progression object,
        // or just pass the progressionId directly if the delete action takes that.
        [ProgressionBuilder.deleteProgression, { progressionId }, { progression }],
    ),
    then: actions(
        [PlayBack.deleteSettings, { progression }], // Requires PlayBack.deleteSettings to exist
    ),
});
// And similar for SuggestChord.
*/
```