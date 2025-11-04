import { actions, Sync } from "@engine";
import { ProgressionBuilder, SuggestChord } from "@concepts";

export const InitializePreferences: Sync = ({ progression, progressionId }) => ({
  when: actions(
    [ProgressionBuilder.createProgression, {}, { progression }],
  ),
  where: async (frames) => {
    console.log("InitializePreferences sync triggered! Frames:", frames.length);
    return frames.map(($) => {
      console.log("Progression ID:", $[progression]._id);
      return {
        ...$,
        [progressionId]: $[progression]._id,
      };
    });
  },
  then: actions(
    [SuggestChord.initializePreferences, { progressionId }],
  ),
});