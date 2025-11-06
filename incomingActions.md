[Requesting] Received request for path: /ProgressionBuilder/createProgression
Requesting.request {
  name: 'My Progression',
  path: '/ProgressionBuilder/createProgression'
} => { request: '019a5b33-12c7-73b9-b3ca-423831fdf38d' }
ProgressionBuilder.createProgression { name: 'My Progression' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: []
  }
}
InitializePreferences sync triggered! Frames: 1
Progression ID: 019a5b33-130b-7480-be7e-b776dd852ef0
SuggestChord.initializePreferences { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  preferences: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    genre: 'Pop',
    complexity: 'Simple',
    key: 'C'
  }
}
Requesting.respond {
  request: '019a5b33-12c7-73b9-b3ca-423831fdf38d',
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: []
  }
} => { request: '019a5b33-12c7-73b9-b3ca-423831fdf38d' }
PlayBack.initializeSettings { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  settings: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    instrument: 'Piano',
    secondsPerChord: 1
  }
}
ProgressionBuilder.listProgressions {} => {
  progressionIdentifiers: [
    {
      id: '019a5b33-130b-7480-be7e-b776dd852ef0',
      name: 'My Progression'
    },
    {
      id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
      name: 'Pop Progression'
    },
    {
      id: '019a4fc6-895a-7255-b079-6ddbad004fef',
      name: 'Jazz Progression'
    }
  ]
}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: []
  }
}
SuggestChord.getSuggestionPreferences { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  preferences: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    genre: 'Pop',
    complexity: 'Simple',
    key: 'C'
  }
}
PlayBack.getPlayBackSettings { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  settings: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    instrument: 'Piano',
    secondsPerChord: 1
  }
}
ProgressionBuilder.addSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object] ]
  }
}
ProgressionBuilder.addSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object] ]
  }
}
ProgressionBuilder.addSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object] ]
  }
}
ProgressionBuilder.addSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
SuggestChord.setKey { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0', key: 'E' } => {}
SuggestChord.setGenre { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0', genre: 'R&B' } => {}
SuggestChord.setComplexity {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  complexity: 'Intermediate'
} => {}
SuggestChord.suggestProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0', length: 4 } => {
  suggestedProgressions: [
    [ 'Emaj7', 'Aadd9', 'C#m7', 'B7' ],
    [ 'Emaj7', 'G#7', 'C#m7', 'A9' ],
    [ 'Emaj7', 'Cmaj7', 'G#m7', 'B7' ]
  ]
}
PlayBack.getProgressionNotes { progression: [ 'Emaj7', 'Aadd9', 'C#m7', 'B7' ] } => {
  notes: [
    [ 'E4', 'G#4', 'B4', 'D#4' ],
    [ 'A4', 'C#4', 'E4', 'B4' ],
    [ 'C#4', 'E4', 'G#4', 'B4' ],
    [ 'B4', 'D#4', 'F#4', 'A4' ]
  ]
}
PlayBack.setInstrument {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  instrument: 'Guitar'
} => {}
PlayBack.setSecondsPerChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  secondsPerChord: 1
} => {}
PlayBack.setSecondsPerChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  secondsPerChord: 1.2
} => {}
PlayBack.setSecondsPerChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  secondsPerChord: 1.25
} => {}
PlayBack.setSecondsPerChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  secondsPerChord: 1.25
} => {}
PlayBack.getProgressionNotes { progression: [ 'Emaj7', 'G#7', 'C#m7', 'A9' ] } => {
  notes: [
    [ 'E4', 'G#4', 'B4', 'D#4' ],
    [ 'G#4', 'B#4', 'D#4', 'F#4' ],
    [ 'C#4', 'E4', 'G#4', 'B4' ],
    [ 'A4', 'C#4', 'E4', 'G4', 'B4' ]
  ]
}
PlayBack.getProgressionNotes { progression: [ 'Emaj7', 'Cmaj7', 'G#m7', 'B7' ] } => {
  notes: [
    [ 'E4', 'G#4', 'B4', 'D#4' ],
    [ 'C4', 'E4', 'G4', 'B4' ],
    [ 'G#4', 'B4', 'D#4', 'F#4' ],
    [ 'B4', 'D#4', 'F#4', 'A4' ]
  ]
}
ProgressionBuilder.setChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  position: 0,
  chord: 'Emaj7'
} => {}
ProgressionBuilder.setChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  position: 1,
  chord: 'Cmaj7'
} => {}
ProgressionBuilder.setChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  position: 2,
  chord: 'G#m7'
} => {}
ProgressionBuilder.setChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  position: 3,
  chord: 'B7'
} => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
PlayBack.getProgressionNotes { progression: [ 'B7' ] } => { notes: [ [ 'B4', 'D#4', 'F#4', 'A4' ] ] }
ProgressionBuilder.deleteChord { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0', position: 3 } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
ProgressionBuilder.deleteSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0', position: 3 } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object] ]
  }
}
ProgressionBuilder.addSlot { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
SuggestChord.suggestChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  chords: [ 'Emaj7', 'Cmaj7', 'G#m7', null ],
  position: 3
} => {
  suggestedChords: [
    'C#m7',     'Aadd9',   'B7sus4',
    'F#m7',     'G#m7b5',  'Emaj7/G#',
    'Cmaj7/E',  'F#7',     'Amaj7',
    'Bsus4',    'G#7',     'C#m9',
    'A6',       'B7',      'F#m9',
    'G#m7b5/B', 'Emaj7/B', 'Cmaj7#11',
    'F#m11',    'G#7alt',  'C#m7b5',
    'A7sus4',   'B9',      'F#7sus4'
  ]
}
PlayBack.getProgressionNotes { progression: [ 'G#7' ] } => { notes: [ [ 'G#4', 'B#4', 'D#4', 'F#4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'A6' ] } => { notes: [ [ 'A4', 'C#4', 'E4', 'F#4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'A6' ] } => { notes: [ [ 'A4', 'C#4', 'E4', 'F#4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'A6' ] } => { notes: [ [ 'A4', 'C#4', 'E4', 'F#4' ] ] }
ProgressionBuilder.setChord {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  position: 3,
  chord: 'A6'
} => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
ProgressionBuilder.reorderSlots {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  oldPosition: 3,
  newPosition: 1
} => {}
ProgressionBuilder.getProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {
  progression: {
    _id: '019a5b33-130b-7480-be7e-b776dd852ef0',
    name: 'My Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
PlayBack.getProgressionNotes { progression: [ 'A6' ] } => { notes: [ [ 'A4', 'C#4', 'E4', 'F#4' ] ] }
ProgressionBuilder.renameProgression {
  progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0',
  name: 'R&B Progression'
} => {}
ProgressionBuilder.getProgression { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  progression: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    name: 'Pop Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
PlayBack.getPlayBackSettings { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  settings: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    instrument: 'Piano',
    secondsPerChord: 1
  }
}
SuggestChord.getSuggestionPreferences { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  preferences: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    genre: 'Pop',
    complexity: 'Simple',
    key: 'C'
  }
}
PlayBack.getProgressionNotes { progression: [ 'Am' ] } => { notes: [ [ 'A4', 'C4', 'E4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'F' ] } => { notes: [ [ 'F4', 'A4', 'C4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'Am' ] } => { notes: [ [ 'A4', 'C4', 'E4' ] ] }
PlayBack.getProgressionNotes { progression: [ 'Am' ] } => { notes: [ [ 'A4', 'C4', 'E4' ] ] }
ProgressionBuilder.setChord {
  progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc',
  position: 3,
  chord: 'D'
} => {}
ProgressionBuilder.getProgression { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  progression: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    name: 'Pop Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
PlayBack.getProgressionNotes { progression: [ 'C', 'G', 'F', 'D' ] } => {
  notes: [
    [ 'C4', 'E4', 'G4' ],
    [ 'G4', 'B4', 'D4' ],
    [ 'F4', 'A4', 'C4' ],
    [ 'D4', 'F#4', 'A4' ]
  ]
}
PlayBack.getProgressionNotes { progression: [ 'C', 'G', 'F', 'D' ] } => {
  notes: [
    [ 'C4', 'E4', 'G4' ],
    [ 'G4', 'B4', 'D4' ],
    [ 'F4', 'A4', 'C4' ],
    [ 'D4', 'F#4', 'A4' ]
  ]
}
ProgressionBuilder.getProgression { progressionId: '019a4fc6-895a-7255-b079-6ddbad004fef' } => {
  progression: {
    _id: '019a4fc6-895a-7255-b079-6ddbad004fef',
    name: 'Jazz Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
SuggestChord.getSuggestionPreferences { progressionId: '019a4fc6-895a-7255-b079-6ddbad004fef' } => {
  preferences: {
    _id: '019a4fc6-895a-7255-b079-6ddbad004fef',
    genre: 'Jazz',
    complexity: 'Advanced',
    key: 'E'
  }
}
PlayBack.getPlayBackSettings { progressionId: '019a4fc6-895a-7255-b079-6ddbad004fef' } => {
  settings: {
    _id: '019a4fc6-895a-7255-b079-6ddbad004fef',
    instrument: 'Piano',
    secondsPerChord: 1
  }
}
ProgressionBuilder.getProgression { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  progression: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    name: 'Pop Progression',
    chords: [ [Object], [Object], [Object], [Object] ]
  }
}
PlayBack.getPlayBackSettings { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  settings: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    instrument: 'Piano',
    secondsPerChord: 1
  }
}
SuggestChord.getSuggestionPreferences { progressionId: '019a5ab4-6feb-7010-9ac3-1914636882bc' } => {
  preferences: {
    _id: '019a5ab4-6feb-7010-9ac3-1914636882bc',
    genre: 'Pop',
    complexity: 'Simple',
    key: 'C'
  }
}
ProgressionBuilder.deleteProgression { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
PlayBack.deleteSettings { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
SuggestChord.deletePreferences { progressionId: '019a5b33-130b-7480-be7e-b776dd852ef0' } => {}
