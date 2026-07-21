import { getMergedLibrary } from "./store";

// Helper to shuffle array for exercise variety
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const generateRecommendation = ({ muscles, equipment, duration, level }) => {
  // 1. Combine default and custom exercises merged with overrides
  const allExercises = getMergedLibrary();

  // 2. Filter by equipment compatibility
  const isCompatible = (exEquipment) => {
    if (equipment === "bodyweight") {
      return exEquipment === "bodyweight";
    }
    if (equipment === "dumbbell") {
      return exEquipment === "bodyweight" || exEquipment === "dumbbell";
    }
    // "gym" includes everything
    return true;
  };

  const compatibleExercises = allExercises.filter(ex => isCompatible(ex.equipment));

  // 3. Determine counts based on duration
  let warmupCount = 1;
  let mainCount = 5;
  let cooldownCount = 1;

  if (duration <= 15) {
    warmupCount = 1;
    mainCount = 3;
    cooldownCount = 1;
  } else if (duration <= 30) {
    warmupCount = 1;
    mainCount = 5;
    cooldownCount = 1;
  } else if (duration <= 45) {
    warmupCount = 2;
    mainCount = 7;
    cooldownCount = 2;
  } else {
    // 60m+
    warmupCount = 2;
    mainCount = 9;
    cooldownCount = 2;
  }

  // Set reps/sets multipliers based on difficulty level
  const adjustSetsReps = (ex) => {
    let sets = ex.defaultSets || 3;
    let reps = ex.defaultReps || 10;
    let dur = ex.defaultDuration || 0;

    if (level === "beginner") {
      sets = Math.max(2, sets - 1);
      if (reps > 0) reps = Math.max(8, reps - 2);
      if (dur > 0) dur = Math.max(20, dur - 10);
    } else if (level === "advanced") {
      sets = sets + 1;
      if (reps > 0) reps = reps + 2;
      if (dur > 0) dur = dur + 15;
    }

    return {
      ...ex,
      defaultSets: sets,
      defaultReps: reps,
      defaultDuration: dur
    };
  };

  // If no muscles selected, assume full body (all muscle groups)
  const targetMuscles = muscles.length > 0 ? muscles : ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core"];

  // 4. Filter and select Warmups
  const warmups = compatibleExercises.filter(ex => ex.category === "warmup");
  // Filter warmups strictly to target muscles if specified
  const allowedWarmups = muscles.length > 0
    ? warmups.filter(ex => muscles.includes(ex.target))
    : warmups;
  const finalWarmups = allowedWarmups.length > 0 ? allowedWarmups : warmups;
  const selectedWarmups = shuffleArray(finalWarmups).slice(0, warmupCount).map(adjustSetsReps);

  // 5. Filter and select Cooldowns
  const cooldowns = compatibleExercises.filter(ex => ex.category === "cooldown");
  // Filter cooldowns strictly to target muscles if specified
  const allowedCooldowns = muscles.length > 0
    ? cooldowns.filter(ex => muscles.includes(ex.target))
    : cooldowns;
  const finalCooldowns = allowedCooldowns.length > 0 ? allowedCooldowns : cooldowns;
  const selectedCooldowns = shuffleArray(finalCooldowns).slice(0, cooldownCount).map(adjustSetsReps);

  // 6. Filter and select Main Exercises
  const mainExercises = compatibleExercises.filter(ex => ex.category === "main");
  // Strictly restrict main exercises to targeted muscle groups if specified
  const allowedMains = muscles.length > 0
    ? mainExercises.filter(ex => muscles.includes(ex.target))
    : mainExercises;
  
  // Group main exercises by target muscle (only for selected/target muscles)
  const exercisesByMuscle = {};
  targetMuscles.forEach(m => {
    exercisesByMuscle[m] = shuffleArray(allowedMains.filter(ex => ex.target === m));
  });

  const selectedMains = [];
  let muscleIndex = 0;
  
  // Round-robin selection across selected muscle groups to balance the workout
  while (selectedMains.length < mainCount) {
    const activeMuscle = targetMuscles[muscleIndex % targetMuscles.length];
    const availableForMuscle = exercisesByMuscle[activeMuscle] || [];
    
    // Find one that isn't already selected
    const nextEx = availableForMuscle.find(ex => !selectedMains.some(s => s.id === ex.id));
    
    if (nextEx) {
      selectedMains.push(adjustSetsReps(nextEx));
    }
    
    // Safety break if we run out of exercises in all targeted muscle groups
    const hasMore = targetMuscles.some(m => {
      const list = exercisesByMuscle[m] || [];
      return list.some(ex => !selectedMains.some(s => s.id === ex.id));
    });
    
    if (!hasMore && !nextEx) {
      // If we need more but ran out of targeted exercises, fill from remaining allowed mains
      const remainingMains = allowedMains.filter(ex => !selectedMains.some(s => s.id === ex.id));
      if (remainingMains.length > 0) {
        const shuffledRemaining = shuffleArray(remainingMains);
        selectedMains.push(adjustSetsReps(shuffledRemaining[0]));
      } else {
        break; // absolute run out of allowed targeted exercises
      }
    }
    
    muscleIndex++;
  }

  // 7. Combine: Warmup ➔ Mains ➔ Cooldown
  return [...selectedWarmups, ...selectedMains, ...selectedCooldowns];
};
