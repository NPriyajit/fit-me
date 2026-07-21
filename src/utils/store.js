import { DEFAULT_EXERCISES } from "../data/exercises";

const KEYS = {
  PREFERENCES: "fitme_preferences",
  CUSTOM_EXERCISES: "fitme_custom_exercises",
  CURRENT_ROUTINE: "fitme_current_routine",
  HISTORY: "fitme_history",
  OVERRIDES: "fitme_exercise_overrides"
};

export const getPreferences = () => {
  const data = localStorage.getItem(KEYS.PREFERENCES);
  return data ? JSON.parse(data) : {
    muscles: [],
    equipment: "gym",
    level: "beginner",
    duration: 30
  };
};

export const savePreferences = (preferences) => {
  localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(preferences));
};

export const getCustomExercises = () => {
  const data = localStorage.getItem(KEYS.CUSTOM_EXERCISES);
  return data ? JSON.parse(data) : [];
};

export const saveCustomExercises = (exercises) => {
  localStorage.setItem(KEYS.CUSTOM_EXERCISES, JSON.stringify(exercises));
};

export const addCustomExercise = (exercise) => {
  const custom = getCustomExercises();
  const newEx = {
    ...exercise,
    id: `custom-${Date.now()}`,
    category: exercise.category || "main",
    isCustom: true
  };
  custom.push(newEx);
  saveCustomExercises(custom);
  return newEx;
};

export const updateCustomExercise = (updated) => {
  const custom = getCustomExercises();
  const index = custom.findIndex(x => x.id === updated.id);
  if (index !== -1) {
    custom[index] = updated;
    saveCustomExercises(custom);
  }
};

export const deleteCustomExercise = (id) => {
  const custom = getCustomExercises();
  const filtered = custom.filter(x => x.id !== id);
  saveCustomExercises(filtered);
};

export const getCurrentRoutine = () => {
  const data = localStorage.getItem(KEYS.CURRENT_ROUTINE);
  return data ? JSON.parse(data) : [];
};

export const saveCurrentRoutine = (routine) => {
  localStorage.setItem(KEYS.CURRENT_ROUTINE, JSON.stringify(routine));
};

export const getHistory = () => {
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const saveHistory = (history) => {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
};

export const logCompletedWorkout = (routine, durationSeconds) => {
  const history = getHistory();
  const logEntry = {
    id: `log-${Date.now()}`,
    date: new Date().toISOString(),
    duration: durationSeconds,
    exerciseCount: routine.length,
    exercises: routine.map(e => ({
      name: e.name,
      target: e.target,
      sets: e.defaultSets || 3,
      reps: e.defaultReps || 10,
      duration: e.defaultDuration || 0
    }))
  };
  history.unshift(logEntry);
  saveHistory(history);
  return logEntry;
};

export const getExerciseOverrides = () => {
  const data = localStorage.getItem(KEYS.OVERRIDES);
  return data ? JSON.parse(data) : {};
};

export const saveExerciseOverride = (id, fields) => {
  const overrides = getExerciseOverrides();
  overrides[id] = {
    ...(overrides[id] || {}),
    ...fields
  };
  localStorage.setItem(KEYS.OVERRIDES, JSON.stringify(overrides));
};

export const getMergedLibrary = () => {
  const custom = getCustomExercises();
  const overrides = getExerciseOverrides();

  const merge = (ex) => {
    if (overrides[ex.id]) {
      return { ...ex, ...overrides[ex.id] };
    }
    return ex;
  };

  const mergedDefaults = DEFAULT_EXERCISES.map(merge);
  const mergedCustoms = custom.map(merge);
  return [...mergedDefaults, ...mergedCustoms];
};
