# Design Changes
## Interesting Moments
1. LLM generated a `SlotID` -> Changed `selectedSlot` to `selectedSlotIdx`  
[@concept-definition](context/design/concepts/ProgressionBuilder/implementation.md/steps/concept.a792d8a5.md)  
[@llm-implementation](context/design/concepts/ProgressionBuilder/implementation.md/steps/response.25ef2cf7.md)  
Given the linked concept definition, the LLM generated an implementation where each slot had a `SlotID` type, which it used to determine which slot was selected/to select. This makes sense in the context of the concept definition, but when I thought more about the implementation, having a slot id was redundant-- it made more sense to have a slot index instead of having this extra value for every slot. Thus I changed the concept to use a `selectedSlotIdx` instead of a `selectedSlot`, and the LLM outputed the following:  
[@updated-concept-definition](context/design/concepts/ProgressionBuilder/ProgressionBuilder.md/steps/concept.a2bbbf68.md)  
[@updated-llm-implementation](context/design/concepts/ProgressionBuilder/implementation.md/steps/response.5c3cb877.md) 

2. Tests did not use `utils/database.ts` functions, and had different format than example
Simply changing the `LikertSurvey/testing.md` file to have the `ProgressionBuilder` spec resulted in the following LLM output:  
[@llm-testing-output](context/design/concepts/ProgressionBuilder/testing.md/steps/response.e2b11a6c.md)
There were two interesting things here. First, `utils/database.ts` functions were not used (ex. `testDb` is not used, which resulted in an error). Second, the tests were written with subtests, which was different from the example. I think using subtests would be fine, but I liked the modularity of the example test file. To mitigate these two things, I gave more context to the LLM by linking the example file and the utils file, and the LLM outputted the following:  
[@updated-llm-testing-output](context/design/concepts/ProgressionBuilder/testing.md/steps/response.8f11438a.md)
3. 

