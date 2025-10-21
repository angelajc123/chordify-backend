# SuggestChord Design
[@revious-concept](../context/design/concepts/SuggestChord/concept.md/steps/concept.c611bcd4.md)  
[@updated-concept](../context/design/concepts/SuggestChord/concept.md/steps/concept.8343f3d9.md)
- Changed `musical unit` to `chord` for clarity
- Changed the state to hold a series of preferences. This made more sense for modularity. Before, the state did not really hold any information. The concept was flawed in the sense that it was stateless. Now, the state holds preferences and chord context is passed in.
- Added more preferences because that is what I would want as a user.
- Added full progression generation as a feature.