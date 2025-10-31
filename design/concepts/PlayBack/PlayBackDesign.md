# PlayBack Design
[@revious-concept](../context/design/concepts/PlayBack/concept.md/steps/concept.707461cd.md)
[@updated-concept](/../context/design/concepts/PlayBack/concept.md/steps/concept.212d1a21.md)
- Changed state to hold Playback Settings, rather than chords. The previous concept design was flawed because it was essentially stateless. Now, each progression has its own playback settings.
- Added more playback settings so users can specify instrument and tempo
- Used `Progression` as a generic type so it does not reference other concepts to improve modularity.
- Added a deleteSettings action so the database could be cleaned up.