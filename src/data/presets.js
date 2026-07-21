export const POPULAR_PRESETS = [
  {
    id: "preset-arnold-split",
    name: "Arnold Split: Chest & Back",
    description: "Classic Golden Era chest and back antagonist supersets to build volume and strength.",
    level: "advanced",
    equipment: "gym",
    duration: 60,
    exercises: [
      { id: "wu-chest-openers", defaultSets: 1, defaultReps: 12, defaultDuration: 0 },
      { id: "wu-scapular-slides", defaultSets: 1, defaultReps: 12, defaultDuration: 0 },
      { id: "main-bb-bench-press", defaultSets: 4, defaultReps: 8, defaultDuration: 0 },
      { id: "main-pullup", defaultSets: 4, defaultReps: 8, defaultDuration: 0 },
      { id: "main-db-incline-press", defaultSets: 4, defaultReps: 10, defaultDuration: 0 },
      { id: "main-bb-bentover-row", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-cable-fly", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "main-seated-row", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "cd-doorway-chest", defaultSets: 1, defaultReps: 1, defaultDuration: 30 },
      { id: "cd-childs-pose", defaultSets: 1, defaultReps: 1, defaultDuration: 45 }
    ]
  },
  {
    id: "preset-ppl-push",
    name: "PPL: Push Power",
    description: "Intense push-day targeting the chest, shoulders, and triceps.",
    level: "advanced",
    equipment: "gym",
    duration: 60,
    exercises: [
      { id: "wu-arm-circles", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "wu-chest-openers", defaultSets: 1, defaultReps: 12, defaultDuration: 0 },
      { id: "main-bb-bench-press", defaultSets: 4, defaultReps: 8, defaultDuration: 0 },
      { id: "main-ohp", defaultSets: 4, defaultReps: 6, defaultDuration: 0 },
      { id: "main-db-incline-press", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-db-lateral-raise", defaultSets: 3, defaultReps: 15, defaultDuration: 0 },
      { id: "main-tricep-pushdown", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "main-tricep-dips", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "cd-doorway-chest", defaultSets: 1, defaultReps: 1, defaultDuration: 30 },
      { id: "cd-shoulder-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 }
    ]
  },
  {
    id: "preset-hiit-burner",
    name: "Full Body HIIT Burner",
    description: "High-intensity cardio & strength intervals to torch calories and build endurance.",
    level: "advanced",
    equipment: "bodyweight",
    duration: 30,
    exercises: [
      { id: "wu-leg-swings", defaultSets: 1, defaultReps: 12, defaultDuration: 0 },
      { id: "wu-torso-twists", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "main-bodyweight-squat", defaultSets: 3, defaultReps: 20, defaultDuration: 0 },
      { id: "main-pushup", defaultSets: 3, defaultReps: 15, defaultDuration: 0 },
      { id: "main-pistol-squat", defaultSets: 3, defaultReps: 6, defaultDuration: 0 },
      { id: "main-decline-pushup", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-russian-twist", defaultSets: 3, defaultReps: 25, defaultDuration: 0 },
      { id: "main-plank", defaultSets: 3, defaultReps: 1, defaultDuration: 60 },
      { id: "cd-cobra", defaultSets: 1, defaultReps: 1, defaultDuration: 40 },
      { id: "cd-quad-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 }
    ]
  },
  {
    id: "preset-db-hypertrophy",
    name: "Dumbbell Hypertrophy",
    description: "Complete full-body muscle building using only a pair of dumbbells.",
    level: "intermediate",
    equipment: "dumbbell",
    duration: 45,
    exercises: [
      { id: "wu-arm-circles", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "wu-hip-openers", defaultSets: 1, defaultReps: 10, defaultDuration: 0 },
      { id: "main-goblet-squat", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "main-db-floor-press", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "main-db-row", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-db-shoulder-press", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-db-rdl", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-db-bicep-curl", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "cd-hamstring-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 },
      { id: "cd-shoulder-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 }
    ]
  },
  {
    id: "preset-calisthenics-mastery",
    name: "Calisthenics Mastery",
    description: "Challenging bodyweight routine focusing on upper body power and control.",
    level: "advanced",
    equipment: "bodyweight",
    duration: 45,
    exercises: [
      { id: "wu-inchworm", defaultSets: 1, defaultReps: 6, defaultDuration: 0 },
      { id: "wu-wrist-rolls", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "main-pullup", defaultSets: 4, defaultReps: 8, defaultDuration: 0 },
      { id: "main-handstand-pushup", defaultSets: 3, defaultReps: 5, defaultDuration: 0 },
      { id: "main-chinup", defaultSets: 3, defaultReps: 8, defaultDuration: 0 },
      { id: "main-diamond-pushup", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "main-pistol-squat", defaultSets: 3, defaultReps: 8, defaultDuration: 0 },
      { id: "main-russian-twist", defaultSets: 3, defaultReps: 20, defaultDuration: 0 },
      { id: "cd-childs-pose", defaultSets: 1, defaultReps: 1, defaultDuration: 45 },
      { id: "cd-wrist-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 }
    ]
  },
  {
    id: "preset-v-taper",
    name: "V-Taper Developer",
    description: "Lat and shoulder hypertrophy program for that classic wide-torso look.",
    level: "advanced",
    equipment: "gym",
    duration: 45,
    exercises: [
      { id: "wu-scapular-slides", defaultSets: 1, defaultReps: 12, defaultDuration: 0 },
      { id: "wu-arm-circles", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "main-pullup", defaultSets: 4, defaultReps: 8, defaultDuration: 0 },
      { id: "main-lat-pulldown", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-bb-bentover-row", defaultSets: 3, defaultReps: 8, defaultDuration: 0 },
      { id: "main-db-lateral-raise", defaultSets: 4, defaultReps: 15, defaultDuration: 0 },
      { id: "main-seated-row", defaultSets: 3, defaultReps: 12, defaultDuration: 0 },
      { id: "cd-childs-pose", defaultSets: 1, defaultReps: 1, defaultDuration: 45 },
      { id: "cd-shoulder-stretch", defaultSets: 1, defaultReps: 1, defaultDuration: 30 }
    ]
  },
  {
    id: "preset-core-shred",
    name: "Intense Core Shred",
    description: "High tension and core compression routine for abdominal definition.",
    level: "advanced",
    equipment: "gym",
    duration: 30,
    exercises: [
      { id: "wu-plank-to-down-dog", defaultSets: 1, defaultReps: 10, defaultDuration: 0 },
      { id: "wu-torso-twists", defaultSets: 1, defaultReps: 15, defaultDuration: 0 },
      { id: "main-toes-to-bar", defaultSets: 3, defaultReps: 8, defaultDuration: 0 },
      { id: "main-ab-rollout", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-hanging-leg-raise", defaultSets: 3, defaultReps: 10, defaultDuration: 0 },
      { id: "main-russian-twist", defaultSets: 3, defaultReps: 20, defaultDuration: 0 },
      { id: "main-plank", defaultSets: 3, defaultReps: 1, defaultDuration: 60 },
      { id: "cd-cobra", defaultSets: 1, defaultReps: 1, defaultDuration: 40 },
      { id: "cd-lying-twist", defaultSets: 1, defaultReps: 1, defaultDuration: 40 }
    ]
  }
];
