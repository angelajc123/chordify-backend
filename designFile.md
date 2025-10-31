# Design Changes
The over all changes to the application is that the user can now create multiple progressions, and progressions created are persistent between user sessions. This change was made to leverage the database, and also follow the project instructions that the project should not be synonymous with script. Additional changes include adding more preferences the user can specify for chord generation and playback. For chord generation, the user can specify the key, genre, and skill level to prompt the LLM to generate chords based on those preferences. For playback, the user can specify the instrument and tempo. These settings are set per progression. This change was made so that the user can have more preference per progression and fully customize their experience on the platform. Validation functions for chord and key were also added to the backend. This is so that both user input for chords and keys and LLM generated chords are validated to be real chords before the database is updated. Finally, a file for constants that are shared between the front end and back end was added. This includes the user input validation functions, as well as options for preferences and settings and other constants. This is so there is one single source of truth for these constants, and the file just needs to be copied over to the front end to use.

## Interesting Moments
1. `SuggestChord` and `Playback` did not have state  
[@llm-response-for-concept-with-no-state](context/design/learning/understanding-concepts.md/steps/response.4f29263e.md)  
[@llm-suggestion-for-concepts-with-state](context/design/learning/understanding-concepts.md/steps/response.6fa8fd98.md)  
[@original-suggest-chord-concept](context/design/concepts/SuggestChord/concept.md)  
[@original-playback-concept]()  
[@updated-suggest-chord-concept]()  
[@updated-playback-concept]()  
When I went to implement `SuggestChord` and `Playback`, I had trouble figuring out what to hold in the database. The original `SuggestChord` held the chord progression state and key, but these were not fields that I thought should be held a database, rather just inputs to the LLM for chord suggestion. Thus, I prompted the LLM to dive deeper into my concept designs, and also asked whether a stateless concept was possible. Through this, I realized there was a fundamental issue with my concept design for these two concepts, and I use the LLM and also my previous concept definitions to create new concepts that held state.

2. Tests did not use `utils/database.ts` functions, and had different format than example
Simply changing the `LikertSurvey/testing.md` file to have the `ProgressionBuilder` spec resulted in the following LLM output:  
[@llm-testing-output](context/design/concepts/ProgressionBuilder/testing.md/steps/response.e2b11a6c.md)
There were two interesting things here. First, `utils/database.ts` functions were not used (ex. `testDb` is not used, which resulted in an error). Second, the tests were written with subtests, which was different from the example. I think using subtests would be fine, but I liked the modularity of the example test file. To mitigate these two things, I gave more context to the LLM by linking the example file and the utils file, and the LLM outputted the following:  
[@updated-llm-testing-output](context/design/concepts/ProgressionBuilder/testing.md/steps/response.8f11438a.md)

3. Progression generation of progression of length 0 bug  
[@implementation-with-length-0-progression](../../../context/design/concepts/SuggestChord/implementation.md/steps/response.7a4a8ea6.md)  
[@tests-fail-with-length-0-progression](../../../context/design/concepts/SuggestChord/testing.md/steps/response.6e528f7d.md)  
In the original concept design for SuggestChord, having a progression of length 0 was a valid input for progression suggestion, but this led to a bug where the LLM would return an empty string, which would get filtered out, and the length 0 test case would fail. Upon further thought, having an input of length 0 did not make sense to me, especially because you would be wasting a call to the LLM. Instead, I play on having the front end check that the input is valid before calling the API.

4. Playback using Tone.js, then suggesting doing playback in the front end  
[@playback-with-tonejs](../../../context/design/concepts/PlayBack/implementation.md/steps/response.621ce7d1.md)  
[@playback-with-tonaljs](../../../context/design/concepts/PlayBack/implementation.md/steps/response.81a2dcfe.md)  
For the first generation of implementation of PlayBack, I prompted the LLM to implement playback with Tone.js because that is what I researched online would be the best library. However, I realized that the playback needs to be done on the front end because it needs to play through the user's computer, and also I wanted to use Tonal.js for simplifying getting chord notes. I prompted the LLM again, and it was really helpful in also commenting the frontend would interact with the backend.

5. Where to have string format checking (for chord, key, instrument, etc)  
Originally in the concepts, I required that the chord, key, and instrument be valid. However, when checking over my concepts, the LLM noted that because those fields are defined as generic String types, this should not be a requirement. My current plan is for the front end to check this before calling the API, although I might change the backend to have this logic later.
