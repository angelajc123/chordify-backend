// Shared constants for frontend and backend validation

// PlayBack constants
export const INSTRUMENTS = ["Piano", "Guitar", "Synthesizer"];
export const MIN_SECONDS_PER_CHORD = 1;
export const MAX_SECONDS_PER_CHORD = 10;

// SuggestChord constants
export const NUM_SUGGESTIONS = 24;
export const GENRES = ["Pop", "Rock", "Jazz", "Classical", "Hip hop", "R&B", "Country", "Electronic"];
export const COMPLEXITY_LEVELS = ["Simple", "Intermediate", "Advanced"];

// Type exports for TypeScript
export type Instrument = typeof INSTRUMENTS[number];
export type Genre = typeof GENRES[number];
export type ComplexityLevel = typeof COMPLEXITY_LEVELS[number];
