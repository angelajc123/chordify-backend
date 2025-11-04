import { actions, Sync } from "@engine";
import { PlayBack, ProgressionBuilder, Requesting, SuggestChord } from "@concepts";

export const CreateProgressionRequest: Sync = ({ request, name }) => ({
  when: actions([
    Requesting.request,
    { path: "/ProgressionBuilder/createProgression", name },
    { request },
  ]),
  then: actions([ProgressionBuilder.createProgression, { name }]),
});

export const CreateProgressionResponse: Sync = ({ request, progression }) => ({
  when: actions(
    [Requesting.request, { path: "/ProgressionBuilder/createProgression" }, { request }],
    [ProgressionBuilder.createProgression, {}, { progression }],
  ),
  then: actions([Requesting.respond, { request, progression }]),
});

export const CreateProgressionResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/ProgressionBuilder/createProgression" }, { request }],
    [ProgressionBuilder.createProgression, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});