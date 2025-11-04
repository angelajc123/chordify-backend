import { actions, Sync } from "@engine";
import { PlayBack, ProgressionBuilder } from "@concepts";

export const InitializePlaybackSettings: Sync = ({ progression, progressionId }) => ({
  when: actions(
    [ProgressionBuilder.createProgression, {}, { progression }],
  ),
  where: async (frames) => {
    return frames.map(($) => ({
      ...$,
      [progressionId]: $[progression]._id,
    }));
  },
  then: actions(
    [PlayBack.initializeSettings, { progressionId }],
  ),
});