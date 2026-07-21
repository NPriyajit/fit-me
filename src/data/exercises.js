export const DEFAULT_EXERCISES = [
  // WARMUPS / PRE-STRETCHES
  {
    id: "wu-arm-circles",
    name: "Arm Circles",
    category: "warmup",
    target: "Shoulders",
    equipment: "bodyweight",
    description: "Stand with feet shoulder-width apart. Extend arms straight out to the sides and make small, controlled circular motions. Reverse direction halfway through.",
    defaultSets: 1,
    defaultReps: 15,
    defaultDuration: 30,
    searchQuery: "arm circles warmup stretch"
  },
  {
    id: "wu-chest-openers",
    name: "Dynamic Chest Openers",
    category: "warmup",
    target: "Chest",
    equipment: "bodyweight",
    description: "Swing your arms out wide to the sides, squeezing your shoulder blades together. Then hug them across your chest. Repeat in a fluid motion.",
    defaultSets: 1,
    defaultReps: 12,
    defaultDuration: 30,
    searchQuery: "dynamic chest openers stretch"
  },
  {
    id: "wu-cat-cow",
    name: "Cat-Cow Stretch",
    category: "warmup",
    target: "Back",
    equipment: "bodyweight",
    description: "On all fours, inhale and arch your back, dropping your belly towards the floor (Cow). Exhale and round your spine towards the ceiling (Cat).",
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: 40,
    searchQuery: "cat cow stretch yoga"
  },
  {
    id: "wu-leg-swings",
    name: "Dynamic Leg Swings",
    category: "warmup",
    target: "Legs",
    equipment: "bodyweight",
    description: "Hold onto a wall/post for support. Swing one leg forward and backward in a controlled, dynamic motion. Swap legs after the set.",
    defaultSets: 1,
    defaultReps: 12,
    defaultDuration: 30,
    searchQuery: "dynamic leg swings warmup"
  },
  {
    id: "wu-worlds-greatest",
    name: "World's Greatest Stretch",
    category: "warmup",
    target: "Legs",
    equipment: "bodyweight",
    description: "Step forward into a deep lunge. Place opposite hand on floor. Rotate your torso and reach active hand towards sky, then shift weight back to stretch hamstring.",
    defaultSets: 1,
    defaultReps: 5,
    defaultDuration: 45,
    searchQuery: "worlds greatest stretch"
  },
  {
    id: "wu-hip-openers",
    name: "Active Hip Openers",
    category: "warmup",
    target: "Legs",
    equipment: "bodyweight",
    description: "Stand tall. Lift one knee up to 90 degrees, rotate it out to the side, and step down. Repeat in a circular pattern, alternating sides.",
    defaultSets: 1,
    defaultReps: 10,
    defaultDuration: 30,
    searchQuery: "active hip openers warmup"
  },

  // MAIN - CHEST
  {
    id: "main-pushup",
    name: "Push-ups",
    category: "main",
    target: "Chest",
    equipment: "bodyweight",
    description: "Keep body in straight line from head to heels. Lower chest close to floor by bending elbows, then press back up forcefully.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "proper push up form"
  },
  {
    id: "main-db-floor-press",
    name: "Dumbbell Floor Press",
    category: "main",
    target: "Chest",
    equipment: "dumbbell",
    description: "Lie flat on your back on the floor, knees bent, feet flat. Press dumbbells straight up above chest. Lower until upper arms lightly touch the floor.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "dumbbell floor press form"
  },
  {
    id: "main-bb-bench-press",
    name: "Barbell Bench Press",
    category: "main",
    target: "Chest",
    equipment: "gym",
    description: "Lie on bench, grip barbell slightly wider than shoulders. Unrack, lower bar to mid-chest level, then press straight up lock-out.",
    defaultSets: 4,
    defaultReps: 8,
    defaultDuration: 0,
    searchQuery: "barbell bench press form"
  },
  {
    id: "main-cable-fly",
    name: "Cable Chest Fly",
    category: "main",
    target: "Chest",
    equipment: "gym",
    description: "Stand between pulleys, lean slightly forward. With a slight bend in elbows, pull handles together in front of chest in a hugging motion.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "standing cable chest fly form"
  },

  // MAIN - BACK
  {
    id: "main-pullup",
    name: "Pull-ups",
    category: "main",
    target: "Back",
    equipment: "bodyweight",
    description: "Grip bar with palms facing away. Pull body up until chin clears the bar, keeping elbows driving down. Lower under control.",
    defaultSets: 3,
    defaultReps: 8,
    defaultDuration: 0,
    searchQuery: "strict pull up form"
  },
  {
    id: "main-db-row",
    name: "Dumbbell Single-Arm Row",
    category: "main",
    target: "Back",
    equipment: "dumbbell",
    description: "Place one knee and hand on bench. Keep back flat. Pull dumbbell up towards hip pocket, keeping elbow tucked close to ribcage.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "single arm dumbbell row form"
  },
  {
    id: "main-lat-pulldown",
    name: "Lat Pulldown",
    category: "main",
    target: "Back",
    equipment: "gym",
    description: "Sit at pulldown station, grip bar wide. Pull bar down to upper chest while leaning slightly back, engaging your shoulder blades.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "wide grip lat pulldown form"
  },
  {
    id: "main-seated-row",
    name: "Seated Cable Row",
    category: "main",
    target: "Back",
    equipment: "gym",
    description: "Sit on bench, feet braced. Grasp handle, pull towards your lower abdomen. Squeeze upper back muscles at the peak.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "seated cable row form"
  },

  // MAIN - SHOULDERS
  {
    id: "main-pike-pushup",
    name: "Pike Push-ups",
    category: "main",
    target: "Shoulders",
    equipment: "bodyweight",
    description: "Get into pushup position, walk feet forward, lifting hips into inverted V-shape. Lower head towards floor between hands, push back up.",
    defaultSets: 3,
    defaultReps: 8,
    defaultDuration: 0,
    searchQuery: "pike pushup form shoulders"
  },
  {
    id: "main-db-shoulder-press",
    name: "Dumbbell Shoulder Press",
    category: "main",
    target: "Shoulders",
    equipment: "dumbbell",
    description: "Sit or stand tall. Hold dumbbells at shoulder height, palms forward. Press dumbbells straight up overhead until arms lock out.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "dumbbell shoulder press form"
  },
  {
    id: "main-db-lateral-raise",
    name: "Dumbbell Lateral Raises",
    category: "main",
    target: "Shoulders",
    equipment: "dumbbell",
    description: "Stand with dumbbells at sides. Raise arms out to the sides with slight bend in elbow, until parallel to floor. Lower slowly.",
    defaultSets: 3,
    defaultReps: 15,
    defaultDuration: 0,
    searchQuery: "dumbbell lateral raise form"
  },
  {
    id: "main-ohp",
    name: "Overhead Barbell Press",
    category: "main",
    target: "Shoulders",
    equipment: "gym",
    description: "Stand, hold barbell on upper chest. Tighten core and glutes. Press bar straight up overhead, moving face back slightly to clear the bar.",
    defaultSets: 4,
    defaultReps: 6,
    defaultDuration: 0,
    searchQuery: "overhead barbell press form"
  },

  // MAIN - LEGS
  {
    id: "main-bodyweight-squat",
    name: "Bodyweight Squats",
    category: "main",
    target: "Legs",
    equipment: "bodyweight",
    description: "Stand with feet shoulder-width. Lower hips down and back as if sitting in a chair. Keep chest up and knees aligned over toes.",
    defaultSets: 3,
    defaultReps: 15,
    defaultDuration: 0,
    searchQuery: "proper air squat form"
  },
  {
    id: "main-goblet-squat",
    name: "Dumbbell Goblet Squat",
    category: "main",
    target: "Legs",
    equipment: "dumbbell",
    description: "Hold a dumbbell vertically under your chin. Squat deep, keeping weight in heels and spine neutral. Push through floor to stand.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "dumbbell goblet squat form"
  },
  {
    id: "main-barbell-squat",
    name: "Barbell Back Squat",
    category: "main",
    target: "Legs",
    equipment: "gym",
    description: "Rest bar on upper traps. Step back, feet shoulder-width. Lower until thighs are parallel to floor or deeper, drive through heels to rise.",
    defaultSets: 4,
    defaultReps: 8,
    defaultDuration: 0,
    searchQuery: "barbell back squat form"
  },
  {
    id: "main-leg-extension",
    name: "Machine Leg Extensions",
    category: "main",
    target: "Legs",
    equipment: "gym",
    description: "Sit in machine, back supported. Place shins under rollers. Extend legs straight out, squeeze quads at top, lower slowly.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "leg extension machine form"
  },
  {
    id: "main-db-rdl",
    name: "Dumbbell Romanian Deadlift",
    category: "main",
    target: "Legs",
    equipment: "dumbbell",
    description: "Stand with dumbbells in front. Hinge at hips, pushing butt back while lowering weights down front of legs. Squeeze glutes to stand.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "dumbbell romanian deadlift form"
  },

  // MAIN - ARMS
  {
    id: "main-tricep-dips",
    name: "Bench Tricep Dips",
    category: "main",
    target: "Arms",
    equipment: "bodyweight",
    description: "Place hands on bench behind you, feet out. Lower body by bending elbows to 90 degrees, keeping back close to bench. Press back up.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "bench dips triceps form"
  },
  {
    id: "main-db-bicep-curl",
    name: "Dumbbell Bicep Curls",
    category: "main",
    target: "Arms",
    equipment: "dumbbell",
    description: "Stand with dumbbells at sides. Keep elbows tucked. Rotate palms forward and curl weight up to shoulders. Lower slowly.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "dumbbell bicep curl form"
  },
  {
    id: "main-hammer-curl",
    name: "Dumbbell Hammer Curls",
    category: "main",
    target: "Arms",
    equipment: "dumbbell",
    description: "Stand holding dumbbells with neutral grip (palms facing each other). Keep elbows still, curl weights up. Focuses on outer bicep & forearm.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "dumbbell hammer curl form"
  },
  {
    id: "main-tricep-pushdown",
    name: "Cable Tricep Pushdown",
    category: "main",
    target: "Arms",
    equipment: "gym",
    description: "Grip attachment on high pulley. Keep elbows tucked at sides. Extend arms straight down, squeezing triceps at the bottom.",
    defaultSets: 3,
    defaultReps: 12,
    defaultDuration: 0,
    searchQuery: "cable tricep pushdown form"
  },

  // MAIN - CORE
  {
    id: "main-plank",
    name: "Forearm Plank",
    category: "main",
    target: "Core",
    equipment: "bodyweight",
    description: "Rest on elbows and toes. Body must form straight line from head to heels. Engage abs and glutes, hold position.",
    defaultSets: 3,
    defaultReps: 1,
    defaultDuration: 45, // seconds
    searchQuery: "proper forearm plank form"
  },
  {
    id: "main-russian-twist",
    name: "Russian Twists",
    category: "main",
    target: "Core",
    equipment: "bodyweight",
    description: "Sit on floor, knees bent, lean back slightly at 45 degrees, lift feet. Rotate your shoulders side to side, tapping floor.",
    defaultSets: 3,
    defaultReps: 20,
    defaultDuration: 0,
    searchQuery: "bodyweight russian twist form"
  },
  {
    id: "main-hanging-leg-raise",
    name: "Hanging Knee/Leg Raises",
    category: "main",
    target: "Core",
    equipment: "gym",
    description: "Hang from pullup bar. Keeping legs straight or bending knees to 90 degrees, raise them up to hip level, control the swing back down.",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0,
    searchQuery: "hanging leg raise form core"
  },

  // COOLDOWNS / POST-STRETCHES
  {
    id: "cd-cobra",
    name: "Cobra Stretch",
    category: "cooldown",
    target: "Core",
    equipment: "bodyweight",
    description: "Lie face down, hands under shoulders. Press through hands to lift chest off floor, keeping hips down. Looks up slightly to stretch abs.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 40,
    searchQuery: "cobra stretch yoga"
  },
  {
    id: "cd-childs-pose",
    name: "Child's Pose",
    category: "cooldown",
    target: "Back",
    equipment: "bodyweight",
    description: "Kneel on floor, touch big toes together, sit on heels. Separate knees wide. Fold forward, draping chest down and reaching arms out front.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 45,
    searchQuery: "childs pose stretch yoga"
  },
  {
    id: "cd-doorway-chest",
    name: "Doorway Chest Stretch",
    category: "cooldown",
    target: "Chest",
    equipment: "bodyweight",
    description: "Place forearm flat against doorway frame, elbow bent at 90 degrees. Gently step forward with one leg until stretch is felt in chest.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 30,
    searchQuery: "doorway chest stretch"
  },
  {
    id: "cd-quad-stretch",
    name: "Standing Quad Stretch",
    category: "cooldown",
    target: "Legs",
    equipment: "bodyweight",
    description: "Stand on one leg (hold wall if needed). Pull other heel up behind to meet glutes. Keep knees aligned together to stretch quad.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 30,
    searchQuery: "standing quad stretch"
  },
  {
    id: "cd-hamstring-stretch",
    name: "Seated Hamstring Stretch",
    category: "cooldown",
    target: "Legs",
    equipment: "bodyweight",
    description: "Sit on floor, one leg straight, other foot bent against inner thigh. Reach forward towards toes of straight leg keeping spine straight.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 30,
    searchQuery: "seated hamstring stretch"
  },
  {
    id: "cd-shoulder-stretch",
    name: "Cross-Arm Shoulder Stretch",
    category: "cooldown",
    target: "Shoulders",
    equipment: "bodyweight",
    description: "Reach one arm straight across your body. Hook other arm under it and gently pull it closer to chest to stretch outer shoulder.",
    defaultSets: 1,
    defaultReps: 1,
    defaultDuration: 30,
    searchQuery: "cross arm shoulder stretch"
  }
];

export const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core"];
export const EQUIPMENT_OPTIONS = [
  { value: "bodyweight", label: "Bodyweight Only" },
  { value: "dumbbell", label: "Dumbbells & Bodyweight" },
  { value: "gym", label: "Full Gym (Machines, Cables, Barbells)" }
];
