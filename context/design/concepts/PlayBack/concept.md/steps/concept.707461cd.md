---
timestamp: 'Thu Oct 16 2025 15:41:21 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_154121.2afd7bd2.md]]'
content_id: 707461cd566e7ab30c6029fe70694eff9b29c7efc30ef26461e613a5647a09c4
---

# concept: PlayBack

concept Playback

purpose
allow users to listen to sequences of musical units easily, enabling rapid feedbackand iteration during composition.

principle
A user selects a sequence and chooses to play it back. The system plays each unit in order at the appropriate timing so the user can hear the progression. The user may also play an individual unit.

state
a sequence of slots Slot, each slot with
an optional musical unit Unit (empty or filled)

actions
playUnit(unit):
effect plays the unit once in real-time. If there is no unit, plays nothing.

```
playSequence(sequence: list of Slots):
    requires sequence exists
    effect plays each slot's unit in order. If a slot is empty, plays nothing for that slot.
```
