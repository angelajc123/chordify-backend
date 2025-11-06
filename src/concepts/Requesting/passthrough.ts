/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 * 
 * This application is meant to be single user, so all of these actions are public for that user.
 */

export const inclusions: Record<string, string> = {
  "/api/PlayBack/setInstrument": "public action",
  "/api/PlayBack/setSecondsPerChord": "public action",
  "/api/PlayBack/deleteSettings": "public action",
  "/api/PlayBack/getPlayBackSettings": "public query",
  "/api/PlayBack/getChordNotes": "public action",
  "/api/PlayBack/getProgressionNotes": "public action",
  "/api/ProgressionBuilder/validateProgressionAndPosition": "public action",
  "/api/ProgressionBuilder/addSlot": "public action",
  "/api/ProgressionBuilder/setChord": "public action",
  "/api/ProgressionBuilder/deleteChord": "public action",
  "/api/ProgressionBuilder/deleteSlot": "public action",
  "/api/ProgressionBuilder/reorderSlots": "public action",
  "/api/ProgressionBuilder/deleteProgression": "public action",
  "/api/ProgressionBuilder/renameProgression": "public action",
  "/api/ProgressionBuilder/getProgression": "public query",
  "/api/ProgressionBuilder/listProgressions": "public query",
  "/api/SuggestChord/getSuggestionPreferences": "public query",
  "/api/SuggestChord/setGenre": "public action",
  "/api/SuggestChord/setComplexity": "public action",
  "/api/SuggestChord/setKey": "public action",
  "/api/SuggestChord/deletePreferences": "public action",
  "/api/SuggestChord/suggestChord": "public action",
  "/api/SuggestChord/suggestProgression": "public action",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  "/api/PlayBack/initializeSettings",
  "/api/SuggestChord/initializePreferences",
  "/api/ProgressionBuilder/createProgression"
];
