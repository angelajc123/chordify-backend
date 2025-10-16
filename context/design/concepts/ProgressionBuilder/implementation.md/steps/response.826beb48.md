---
timestamp: 'Wed Oct 15 2025 18:58:27 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251015_185827.c85889b0.md]]'
content_id: 826beb48fdf2c1782b36c4968952b21fabe591c313ff7f238a0af05a665fad21
---

# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * concept: ProgressionBuilder
 * purpose: enable users to construct and modify a sequence of musical units by adding, setting, or removing elements.
 * principle: A user begins with an empty sequence. They add new slots to extend the sequence,
 * select a slot to edit, set a musical unit in that slot, and can later remove either the unit or the entire slot.
 * At any time one slot is designated as selected for editing.
 */

// Declare collection prefix, use concept name
const PREFIX = "ProgressionBuilder" + ".";

// Generic types used by this concept.
// Chord is treated as a string, as its internal structure is not defined by this concept.
type Chord = string;
// SlotId refers to the unique identifier for a slot within the progression array.
type SlotId = ID;

/**
 * Represents an individual slot within the musical progression sequence.
 * state: A sequence of `Slots` with an optional `chord` of type `Chord`
 */
interface ProgressionSlot {
  id: SlotId;
  chord: Chord | null; // Null means no chord is set for this slot
}

/**
 * The primary state document for the ProgressionBuilder concept.
 * It holds the entire sequence of slots and the currently selected slot for a specific session.
 */
interface ProgressionState {
  _id: ID; // This ID will be the sessionId, linking this progression to a specific user session.
  slots: ProgressionSlot[]; // Ordered sequence of musical slots.
  selectedSlotId: SlotId | null; // ID of the currently selected slot, or null if none.
}

export default class ProgressionBuilderConcept {
  private progressions: Collection<ProgressionState>;

  constructor(private readonly db: Db) {
    this.progressions = this.db.collection(PREFIX + "progressions");
  }

  /**
   * Helper function to retrieve the current progression state for a given session.
   * If no progression document exists for the session, it initializes and inserts an empty one.
   * This ensures that every session implicitly has its own progression state.
   * @param sessionId The ID of the session for which to retrieve the progression.
   * @returns The current or newly initialized ProgressionState document.
   */
  private async _getProgression(sessionId: ID): Promise<ProgressionState> {
    const progression = await this.progressions.findOne({ _id: sessionId });
    if (progression) {
      return progression;
    }
    // Initialize an empty progression for this session if it doesn't exist
    const initialProgression: ProgressionState = {
      _id: sessionId, // Use sessionId as the document ID
      slots: [],
      selectedSlotId: null,
    };
    await this.progressions.insertOne(initialProgression);
    return initialProgression;
  }

  /**
   * action: selectSlot (slot: SlotId, sessionId: ID)
   * purpose: To designate a specific slot in the sequence as the active one for editing for a given session.
   * requires: `slot` to exist in the sequence for the specified session.
   * effect: sets `selectedSlotId` to `slot` for that session's progression.
   *
   * @param slot The ID of the slot to select.
   * @param sessionId The ID of the session whose progression is being modified.
   * @returns An empty object on success, or an error object if the slot does not exist.
   */
  async selectSlot(
    { slot, sessionId }: { slot: SlotId; sessionId: ID },
  ): Promise<Empty | { error: string }> {
    const progression = await this._getProgression(sessionId);
    const slotExists = progression.slots.some((s) => s.id === slot);

    if (!slotExists) {
      return { error: `Slot with ID ${slot} does not exist in the progression for session ${sessionId}.` };
    }

    await this.progressions.updateOne(
      { _id: sessionId },
      { $set: { selectedSlotId: slot } },
    );

    return {};
  }

  /**
   * action: addSlot (sessionId: ID)
   * purpose: To extend the musical sequence with a new, empty slot for a given session.
   * effect: appends a new empty `Slot` to the sequence and sets it as `selectedSlotId` for that session.
   *
   * @param sessionId The ID of the session whose progression is being modified.
   * @returns An empty object on success.
   */
  async addSlot({ sessionId }: { sessionId: ID }): Promise<Empty> {
    const progression = await this._getProgression(sessionId); // Ensure the session's progression exists
    const newSlotId = freshID();
    const newSlot: ProgressionSlot = { id: newSlotId, chord: null };

    await this.progressions.updateOne(
      { _id: sessionId },
      {
        $push: { slots: newSlot }, // Append the new slot to the end of the array
        $set: { selectedSlotId: newSlotId }, // Select the newly added slot
      },
    );

    return {};
  }

  /**
   * action: setChord (chord: Chord, sessionId: ID)
   * purpose: To assign a musical chord to the currently selected slot for a given session.
   * requires: `selectedSlotId` to exist for the specified session (i.e., a slot must be selected).
   * effect: sets the `selectedSlotId`’s `chord` to `chord` for that session.
   *
   * @param chord The chord string to set for the selected slot.
   * @param sessionId The ID of the session whose progression is being modified.
   * @returns An empty object on success, or an error object if no slot is selected.
   */
  async setChord(
    { chord, sessionId }: { chord: Chord; sessionId: ID },
  ): Promise<Empty | { error: string }> {
    const progression = await this._getProgression(sessionId);
    if (!progression.selectedSlotId) {
      return { error: `No slot is currently selected for session ${sessionId} to set a chord.` };
    }

    await this.progressions.updateOne(
      {
        _id: sessionId,
        "slots.id": progression.selectedSlotId, // Match the selected slot within the array
      },
      {
        $set: { "slots.$.chord": chord }, // Use positional operator to update the matched element
      },
    );

    return {};
  }

  /**
   * action: deleteChord (sessionId: ID)
   * purpose: To remove the musical chord from the currently selected slot for a given session.
   * requires: `selectedSlotId` to exist for the specified session (i.e., a slot must be selected).
   * effect: removes `chord` from `selectedSlotId` (sets it to null) for that session.
   *
   * @param sessionId The ID of the session whose progression is being modified.
   * @returns An empty object on success, or an error object if no slot is selected.
   */
  async deleteChord({ sessionId }: { sessionId: ID }): Promise<Empty | { error: string }> {
    const progression = await this._getProgression(sessionId);
    if (!progression.selectedSlotId) {
      return { error: `No slot is currently selected for session ${sessionId} to delete its chord.` };
    }

    await this.progressions.updateOne(
      {
        _id: sessionId,
        "slots.id": progression.selectedSlotId,
      },
      {
        $set: { "slots.$.chord": null }, // Set the chord to null
      },
    );

    return {};
  }

  /**
   * action: deleteSlot (sessionId: ID)
   * purpose: To remove the currently selected slot and its associated chord from the sequence for a given session.
   * requires: `selectedSlotId` to exist for the specified session (i.e., a slot must be selected).
   * effect: removes `selectedSlotId` from the sequence, sets `selectedSlotId` to `null` for that session.
   *
   * @param sessionId The ID of the session whose progression is being modified.
   * @returns An empty object on success, or an error object if no slot is selected.
   */
  async deleteSlot({ sessionId }: { sessionId: ID }): Promise<Empty | { error: string }> {
    const progression = await this._getProgression(sessionId);
    const selectedSlotId = progression.selectedSlotId;

    if (!selectedSlotId) {
      return { error: `No slot is currently selected for session ${sessionId} to delete.` };
    }

    await this.progressions.updateOne(
      { _id: sessionId },
      {
        $pull: { slots: { id: selectedSlotId } }, // Remove the selected slot from the array
        $set: { selectedSlotId: null }, // Deselect the slot as it no longer exists
      },
    );

    return {};
  }

  /**
   * action: deleteProgression (sessionId: ID)
   * purpose: To remove a session's entire musical progression data.
   * requires: A progression for the given `sessionId` must exist.
   * effect: Deletes the `ProgressionState` document associated with `sessionId`.
   *
   * This action is typically called via a synchronization rule when a session ends
   * (e.g., due to timeout or tab closure), allowing temporary data to be cleaned up.
   *
   * @param sessionId The ID of the session whose progression should be deleted.
   * @returns An empty object on success.
   */
  async deleteProgression({ sessionId }: { sessionId: ID }): Promise<Empty> {
    await this.progressions.deleteOne({ _id: sessionId });
    return {};
  }

  // --- Concept Queries (for inspection and synchronization) ---

  /**
   * query: _getProgressionState (sessionId: ID)
   * purpose: To retrieve the entire current state of the musical progression for a specific session.
   * @param sessionId The ID of the session whose progression state is to be retrieved.
   * @returns The full ProgressionState document for the session.
   */
  async _getProgressionState(sessionId: ID): Promise<ProgressionState> {
    return this._getProgression(sessionId);
  }

  /**
   * query: _getSelectedSlotId (sessionId: ID)
   * purpose: To identify which slot is currently designated for editing for a specific session.
   * @param sessionId The ID of the session whose selected slot is to be retrieved.
   * @returns The ID of the selected slot, or null if none is selected for that session.
   */
  async _getSelectedSlotId(sessionId: ID): Promise<SlotId | null> {
    const progression = await this._getProgression(sessionId);
    return progression.selectedSlotId;
  }

  /**
   * query: _getAllSlots (sessionId: ID)
   * purpose: To retrieve the entire ordered sequence of musical slots for a specific session.
   * @param sessionId The ID of the session whose slots are to be retrieved.
   * @returns An array of ProgressionSlot objects for that session.
   */
  async _getAllSlots(sessionId: ID): Promise<ProgressionSlot[]> {
    const progression = await this._getProgression(sessionId);
    return progression.slots;
  }

  /**
   * query: _findSlotById (slotId: SlotId, sessionId: ID)
   * purpose: To retrieve details of a specific slot given its ID within a specific session's progression.
   * @param slotId The ID of the slot to find.
   * @param sessionId The ID of the session to which the slot belongs.
   * @returns The ProgressionSlot object, or null if not found.
   */
  async _findSlotById({ slotId, sessionId }: { slotId: SlotId; sessionId: ID }): Promise<
    ProgressionSlot | null
  > {
    const progression = await this._getProgression(sessionId);
    return progression.slots.find((s) => s.id === slotId) || null;
  }
}
```
