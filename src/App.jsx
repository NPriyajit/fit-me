import React, { useState, useEffect } from "react";
import BottomNav from "./components/BottomNav";
import WorkoutList from "./components/WorkoutList";
import ExerciseModal from "./components/ExerciseModal";
import VideoPlayer from "./components/VideoPlayer";
import ActiveWorkout from "./components/ActiveWorkout";
import { MUSCLE_GROUPS, EQUIPMENT_OPTIONS, DEFAULT_EXERCISES } from "./data/exercises";
import {
  getPreferences,
  savePreferences,
  getCurrentRoutine,
  saveCurrentRoutine,
  getHistory,
  saveHistory,
  getCustomExercises,
  deleteCustomExercise,
  saveExerciseOverride,
  getMergedLibrary
} from "./utils/store";
import { generateRecommendation } from "./utils/recommender";
import { POPULAR_PRESETS } from "./data/presets";

export default function App() {
  // Navigation & Screen states
  const [activeTab, setActiveTab] = useState("planner");
  const [activeWorkoutMode, setActiveWorkoutMode] = useState(false);
  const [presetLoading, setPresetLoading] = useState(null);

  // Core Data state
  const [preferences, setPreferences] = useState(getPreferences());
  const [routine, setRoutine] = useState(getCurrentRoutine());
  const [routineName, setRoutineName] = useState(() => localStorage.getItem("fitme_routine_name") || "Custom Workout");
  const [history, setHistory] = useState(getHistory());
  const [customExercises, setCustomExercises] = useState(getCustomExercises());

  // Modal / overlay states
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'create'
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [exerciseToEditIndex, setExerciseToEditIndex] = useState(null);

  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoExercise, setVideoExercise] = useState(null);
  const [selectedHistoryLog, setSelectedHistoryLog] = useState(null);

  // In-app tap-to-confirm states
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearRoutine, setConfirmClearRoutine] = useState(false);

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem("fitme_routine_name", routineName);
  }, [routineName]);


  // Sync state to local storage when changed
  useEffect(() => {
    saveCurrentRoutine(routine);
  }, [routine]);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Sync custom exercises count
  const refreshCustomExercises = () => {
    setCustomExercises(getCustomExercises());
  };

  // Preference forms updates
  const handleMuscleToggle = (muscle) => {
    const active = [...preferences.muscles];
    const index = active.indexOf(muscle);
    if (index === -1) {
      active.push(muscle);
    } else {
      active.splice(index, 1);
    }
    setPreferences({ ...preferences, muscles: active });
  };

  const handleEquipmentSelect = (val) => {
    setPreferences({ ...preferences, equipment: val });
  };

  const handleFormChange = (key, val) => {
    setPreferences({ ...preferences, [key]: val });
  };

  // Recommendation engine trigger
  const handleGenerateWorkout = () => {
    const recommended = generateRecommendation(preferences);
    const name = preferences.muscles.length > 0 ? `${preferences.muscles.join(" & ")} Workout` : "Full Body Workout";
    setRoutineName(name);
    setRoutine(recommended);
    setActiveTab("routine");
  };

  const playSuccessSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start();
      osc.stop(now + 0.4);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  const handleLoadPreset = (preset) => {
    setPresetLoading({ name: preset.name, success: false });

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch (e) { }

    setTimeout(() => {
      setPresetLoading({ name: preset.name, success: true });
      playSuccessSound();

      setTimeout(() => {
        setPresetLoading(null);

        const library = getMergedLibrary();
        const resolved = preset.exercises.map((pEx) => {
          const match = library.find((ex) => ex.id === pEx.id);
          if (!match) return null;
          return {
            ...match,
            defaultSets: pEx.defaultSets !== undefined ? pEx.defaultSets : (match.defaultSets || 3),
            defaultReps: pEx.defaultReps !== undefined ? pEx.defaultReps : (match.defaultReps || 10),
            defaultDuration: pEx.defaultDuration !== undefined ? pEx.defaultDuration : (match.defaultDuration || 0)
          };
        }).filter(Boolean);

        setRoutineName(preset.name);
        setRoutine(resolved);
        setActiveTab("routine");
      }, 700);
    }, 600);
  };

  // Routine customization operations
  const handleClearRoutine = () => {
    setRoutineName("Custom Workout");
    setRoutine([]);
  };

  const handleDeleteExercise = (index) => {
    const newRoutine = [...routine];
    newRoutine.splice(index, 1);
    setRoutine(newRoutine);
  };

  const handleEditExercise = (exercise, index) => {
    setExerciseToEdit(exercise);
    setExerciseToEditIndex(index);
    setModalMode("edit");
    setShowExerciseModal(true);
  };

  const handleSaveEditedExercise = (updated) => {
    // Save to global exercises overrides so it connects to parent exercise permanently
    saveExerciseOverride(updated.id, {
      videoUrl: updated.videoUrl,
      description: updated.description,
      defaultSets: updated.defaultSets,
      defaultReps: updated.defaultReps,
      defaultDuration: updated.defaultDuration
    });

    if (exerciseToEditIndex !== null) {
      const newRoutine = [...routine];
      newRoutine[exerciseToEditIndex] = updated;
      setRoutine(newRoutine);
    } else {
      // Sync edits to all existing instances in the active routine
      const newRoutine = routine.map(ex => ex.id === updated.id ? { ...ex, ...updated } : ex);
      setRoutine(newRoutine);
    }
  };

  const handleAddExerciseToRoutine = (exercise) => {
    const item = {
      ...exercise,
      defaultSets: exercise.defaultSets || 3,
      defaultReps: exercise.defaultReps || 10,
      defaultDuration: exercise.defaultDuration || 0
    };

    const category = item.category || "main";
    const newRoutine = [...routine];

    if (category === "warmup") {
      // Insert after the last existing warmup (or at index 0 if none)
      const lastWarmupIdx = newRoutine.reduce((acc, ex, i) => ex.category === "warmup" ? i : acc, -1);
      newRoutine.splice(lastWarmupIdx + 1, 0, item);
    } else if (category === "cooldown") {
      // Always append at the very end
      newRoutine.push(item);
    } else {
      // Main: insert after the last main exercise, before any cooldowns
      const lastMainIdx = newRoutine.reduce((acc, ex, i) => ex.category === "main" ? i : acc, -1);
      if (lastMainIdx !== -1) {
        newRoutine.splice(lastMainIdx + 1, 0, item);
      } else {
        // No mains yet — insert after last warmup
        const lastWarmupIdx = newRoutine.reduce((acc, ex, i) => ex.category === "warmup" ? i : acc, -1);
        newRoutine.splice(lastWarmupIdx + 1, 0, item);
      }
    }

    setRoutine(newRoutine);
    refreshCustomExercises();
  };

  const handleViewVideo = (exercise) => {
    setVideoExercise(exercise);
    setShowVideoPlayer(true);
  };

  const handleSaveVideo = (exerciseId, videoUrl) => {
    saveExerciseOverride(exerciseId, { videoUrl });
    const newRoutine = routine.map(ex => ex.id === exerciseId ? { ...ex, videoUrl } : ex);
    setRoutine(newRoutine);
    if (videoExercise && videoExercise.id === exerciseId) {
      setVideoExercise({ ...videoExercise, videoUrl });
    }
  };

  const handleClearHistory = () => {
    saveHistory([]);
    setHistory([]);
  };

  const handleExitWorkout = () => {
    setActiveWorkoutMode(false);
  };

  const handleFinishWorkout = () => {
    // Reload history logs to display completed workout
    setHistory(getHistory());
    setActiveWorkoutMode(false);
    setActiveTab("history");
  };

  // Sub-render helpers
  const countCategory = (category) => {
    return routine.filter((x) => x.category === category).length;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getFriendlyDate = (isoString) => {
    if (!isoString) return "Unknown Date";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Unknown Date";
    const now = new Date();
    
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = todayDate - compareDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    if (diffDays === 0) {
      return `Today at ${timeString}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${timeString}`;
    }
    
    const getOrdinalSuffix = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear() !== now.getFullYear() ? `, ${date.getFullYear()}` : "";
    
    return `${day}${getOrdinalSuffix(day)} ${month}${year} at ${timeString}`;
  };

  // Filter presets compatible with selected equipment
  const compatiblePresets = POPULAR_PRESETS.filter(preset => {
    if (preferences.equipment === "bodyweight") {
      return preset.equipment === "bodyweight";
    }
    if (preferences.equipment === "dumbbell") {
      return preset.equipment === "bodyweight" || preset.equipment === "dumbbell";
    }
    return true;
  });

  // Filter by exact level match, sorted by closest duration
  // Fallback: if nothing matches (e.g. no beginner gym presets) show all compatible
  const levelMatchedPresets = compatiblePresets.filter(p => p.level === preferences.level);
  const filteredPresets = (levelMatchedPresets.length > 0 ? levelMatchedPresets : compatiblePresets)
    .slice()
    .sort((a, b) => Math.abs(a.duration - preferences.duration) - Math.abs(b.duration - preferences.duration));

  // Full Screen Active Gym Player Mode
  if (activeWorkoutMode) {
    return (
      <ActiveWorkout
        routine={routine}
        setRoutine={setRoutine}
        routineName={routineName}
        onExit={handleExitWorkout}
        onFinish={handleFinishWorkout}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-container">
          <span className="logo-symbol">⚡</span>
          <h1 className="logo-text">Fit<span>Me</span></h1>
        </div>
        <span className="badge badge-main" style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
          GYM COMPANION
        </span>
      </header>

      {/* Main Container */}
      <main className="app-main">

        {/* TABS 1: PLANNER / PREFERENCES GENERATOR */}
        {activeTab === "planner" && (
          <>
            <div className="preference-form">
              <h2 className="screen-title">Workout Planner</h2>
              <p className="screen-desc">Enter your preferences to auto-generate a targeted stretch & strength routine.</p>

              {/* Muscle Targets */}
              <div className="form-group">
                <label className="form-label">Target Muscle Groups</label>
                <div className="options-grid">
                  {MUSCLE_GROUPS.map((m) => {
                    const isSelected = preferences.muscles.includes(m);
                    return (
                      <div
                        key={m}
                        className={`option-box ${isSelected ? "selected" : ""}`}
                        onClick={() => handleMuscleToggle(m)}
                      >
                        {m}
                      </div>
                    );
                  })}
                </div>
                <small className="help-text" style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                  Select none for Full Body recommendation.
                </small>
              </div>

              {/* Equipment Selection */}
              <div className="form-group">
                <label className="form-label">Available Equipment</label>
                <div className="equipment-grid">
                  {EQUIPMENT_OPTIONS.map((opt) => {
                    const isSelected = preferences.equipment === opt.value;
                    return (
                      <div
                        key={opt.value}
                        className={`equipment-option ${isSelected ? "selected" : ""}`}
                        onClick={() => handleEquipmentSelect(opt.value)}
                      >
                        <span>{opt.label}</span>
                        <div className="radio-dot"></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form row for Level & Duration */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fitness Level</label>
                  <select
                    value={preferences.level}
                    onChange={(e) => handleFormChange("level", e.target.value)}
                    className="form-input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Session Time</label>
                  <select
                    value={preferences.duration}
                    onChange={(e) => handleFormChange("duration", parseInt(e.target.value))}
                    className="form-input"
                  >
                    <option value={15}>15 Min (Quick)</option>
                    <option value={30}>30 Min (Standard)</option>
                    <option value={45}>45 Min (Deep Work)</option>
                    <option value={60}>60 Min (Intense)</option>
                  </select>
                </div>
              </div>

              {/* Recommendation Generator CTA */}
              <button
                onClick={handleGenerateWorkout}
                className="btn btn-primary"
                style={{ marginTop: "10px", width: "100%" }}
              >
                Generate Workout Recommendation
              </button>
            </div>

            <div className="preference-form" style={{ marginTop: "16px", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.2rem" }}>🔥</span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "white", letterSpacing: "-0.01em" }}>
                  Popular Workout Presets
                </h3>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 4px 0", lineHeight: "1.4" }}>
                Expert-curated routines matched to your <strong style={{ color: "white" }}>{preferences.level}</strong> level &amp; equipment.
              </p>

              {/* Horizontal swipe carousel — avoids inner/outer vertical scroll conflict on mobile */}
              <div
                className="preset-carousel"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "12px",
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: "10px",
                  marginLeft: "-2px",
                  marginRight: "-2px",
                  paddingLeft: "2px",
                  paddingRight: "2px"
                }}
              >
                {filteredPresets.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="preset-item-card"
                    style={{
                      flexShrink: 0,
                      width: "72vw",
                      maxWidth: "280px",
                      scrollSnapAlign: "start",
                      background: "rgba(9, 13, 22, 0.6)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "white", margin: 0, lineHeight: "1.3", flex: 1 }}>
                        {preset.name}
                      </h4>
                      <span className="badge" style={{
                        fontSize: "0.6rem",
                        padding: "2px 6px",
                        textTransform: "uppercase",
                        borderRadius: "4px",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        ...(preset.level === "beginner"
                          ? { backgroundColor: "rgba(0,255,136,0.12)", color: "var(--accent-neon)", border: "1px solid rgba(0,255,136,0.3)" }
                          : preset.level === "intermediate"
                            ? { backgroundColor: "rgba(0,210,255,0.12)", color: "var(--accent-blue)", border: "1px solid rgba(0,210,255,0.3)" }
                            : { backgroundColor: "rgba(139,92,246,0.12)", color: "var(--accent-secondary)", border: "1px solid rgba(139,92,246,0.3)" }
                        )
                      }}>
                        {preset.level}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.73rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.4", flexGrow: 1 }}>
                      {preset.description}
                    </p>

                    <div style={{ display: "flex", gap: "10px", fontSize: "0.68rem", fontWeight: "600", color: "var(--accent-neon)", flexWrap: "wrap", marginTop: "2px" }}>
                      <span>⏱️ {preset.duration} min</span>
                      <span>💪 {preset.exercises.length} exercises</span>
                      <span>🏋️ {preset.equipment === "gym" ? "Full Gym" : preset.equipment === "dumbbell" ? "Dumbbell" : "Bodyweight"}</span>
                    </div>
                  </div>
                ))}
                {filteredPresets.length === 0 && (
                  <div style={{ padding: "12px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    No presets match your current filters.
                  </div>
                )}
              </div>
              {filteredPresets.length > 1 && (
                <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", textAlign: "center", margin: "0", letterSpacing: "0.03em" }}>
                  ← swipe to see {filteredPresets.length} presets →
                </p>
              )}
            </div>
            {/* Creator Footer - Home screen only */}
            <footer style={{
              padding: "24px 20px 40px",
              textAlign: "center",
              borderTop: "1px solid var(--border-color)",
              marginTop: "24px"
            }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Crafted with 💪 by - Priyajit
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/in/n-priyajit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(0, 119, 181, 0.4)",
                    background: "rgba(0, 119, 181, 0.08)",
                    transition: "var(--transition-smooth)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(0, 119, 181, 0.18)";
                    e.currentTarget.style.borderColor = "rgba(0, 119, 181, 0.7)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(0, 119, 181, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(0, 119, 181, 0.4)";
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#0077B5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#60b8e0", letterSpacing: "0.01em" }}>
                    LinkedIn
                  </span>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/_npriyajit/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    textDecoration: "none",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid rgba(225, 48, 108, 0.4)",
                    background: "rgba(225, 48, 108, 0.08)",
                    transition: "var(--transition-smooth)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(225, 48, 108, 0.18)";
                    e.currentTarget.style.borderColor = "rgba(225, 48, 108, 0.7)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(225, 48, 108, 0.08)";
                    e.currentTarget.style.borderColor = "rgba(225, 48, 108, 0.4)";
                  }}
                >
                  {/* Instagram gradient icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <defs>
                      <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f09433" />
                        <stop offset="25%" stopColor="#e6683c" />
                        <stop offset="50%" stopColor="#dc2743" />
                        <stop offset="75%" stopColor="#cc2366" />
                        <stop offset="100%" stopColor="#bc1888" />
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="url(#ig-grad)" stroke="none" />
                  </svg>
                  <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#e1306c", letterSpacing: "0.01em" }}>
                    Instagram
                  </span>
                </a>
              </div>
            </footer>
          </>
        )}

        {/* TABS 2: LIBRARY EXPLORER */}
        {activeTab === "library" && (
          <div className="library-screen">
            <div className="library-header">
              <div>
                <h2 className="screen-title">Exercises Library</h2>
                <p className="screen-desc">Browse preloaded library or build custom exercises.</p>
              </div>
            </div>

            {/* Floating Quick Action Button */}
            <button
              className="btn-floating-add"
              onClick={() => {
                setModalMode("create");
                setShowExerciseModal(true);
              }}
              title="Create Custom Exercise"
            >
              +
            </button>

            <div className="library-grid">
              {/* Trigger the search modal but keep it open directly */}
              <ExerciseModal
                mode="add"
                isFlat={true}
                onAddExercise={handleAddExerciseToRoutine}
                onEditExercise={(ex) => handleEditExercise(ex, null)}
              />
            </div>
          </div>
        )}

        {/* TABS 3: ACTIVE ROUTINE / REARRANGE BOARD */}
        {activeTab === "routine" && (
          <div className="planner-results">
            <div>
              <h2 className="screen-title">My Workout Routine</h2>
              <p className="screen-desc">Rearrange, edit reps/sets, or add exercises before playing.</p>
            </div>

            {/* Routine summary volume metrics */}
            {routine.length > 0 && (
              <div className="stats-box-grid">
                <div className="stat-card" style={{ borderColor: "var(--accent-blue)" }}>
                  <span className="stat-label">Warmup</span>
                  <span className="stat-value" style={{ color: "var(--accent-blue)" }}>{countCategory("warmup")}</span>
                </div>

                <div className="stat-card" style={{ borderColor: "var(--accent-neon)" }}>
                  <span className="stat-label">Main Lifts</span>
                  <span className="stat-value" style={{ color: "var(--accent-neon)" }}>{countCategory("main")}</span>
                </div>

                <div className="stat-card" style={{ borderColor: "var(--accent-secondary)" }}>
                  <span className="stat-label">Cooldown</span>
                  <span className="stat-value" style={{ color: "var(--accent-secondary)" }}>{countCategory("cooldown")}</span>
                </div>
              </div>
            )}

            {/* Editable Workout List */}
            <WorkoutList
              routine={routine}
              setRoutine={setRoutine}
              onEditExercise={handleEditExercise}
              onDeleteExercise={handleDeleteExercise}
              onViewVideo={handleViewVideo}
            />

            {/* Routine Commands */}
            {routine.length > 0 && (
              <div className="results-action-row">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (confirmClearRoutine) {
                      handleClearRoutine();
                      setConfirmClearRoutine(false);
                    } else {
                      setConfirmClearRoutine(true);
                      setTimeout(() => setConfirmClearRoutine(false), 3000);
                    }
                  }}
                  style={{
                    backgroundColor: confirmClearRoutine ? "rgba(255, 71, 87, 0.15)" : "",
                    color: confirmClearRoutine ? "var(--accent-danger)" : "",
                    borderColor: confirmClearRoutine ? "rgba(255, 71, 87, 0.3)" : ""
                  }}
                >
                  {confirmClearRoutine ? "Confirm Clear?" : "Clear Plan"}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveWorkoutMode(true)}
                  style={{ animation: "pulse 2s infinite" }}
                >
                  🚀 Start Workout
                </button>
              </div>
            )}

            {routine.length === 0 && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setModalMode("add");
                  setShowExerciseModal(true);
                }}
                style={{ width: "100%" }}
              >
                Add First Exercise
              </button>
            )}
          </div>
        )}

        {/* TABS 4: HISTORY & STATS LOGS */}
        {activeTab === "history" && (
          <div className="history-screen">
            <div className="library-header" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="screen-title">Workout History</h2>
                <p className="screen-desc">Review your logged gym workouts.</p>
              </div>
              {history.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (confirmClearHistory) {
                      handleClearHistory();
                      setConfirmClearHistory(false);
                    } else {
                      setConfirmClearHistory(true);
                      setTimeout(() => setConfirmClearHistory(false), 3000);
                    }
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.8rem",
                    backgroundColor: confirmClearHistory ? "rgba(255, 71, 87, 0.15)" : "",
                    color: confirmClearHistory ? "var(--accent-danger)" : "",
                    borderColor: confirmClearHistory ? "rgba(255, 71, 87, 0.3)" : ""
                  }}
                >
                  {confirmClearHistory ? "Confirm Clear?" : "Clear Logs"}
                </button>
              )}
            </div>

            <div className="history-list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history.length > 0 ? (
                history.map((log) => {
                  const durationMins = Math.round(log.duration / 60);
                  return (
                    <div 
                      key={log.id} 
                      className="history-card" 
                      onClick={() => setSelectedHistoryLog(log)}
                      style={{ 
                        cursor: "pointer", 
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        padding: "16px",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{ fontSize: "1.02rem", fontWeight: "800", color: "white" }}>
                          {log.workoutName || "Custom Workout"}
                        </span>
                        <span style={{ color: "var(--accent-neon)", fontSize: "0.82rem", fontWeight: "700" }}>
                          🔥 {log.calories !== undefined ? log.calories : Math.round(durationMins * 6.5)} kcal
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", flexWrap: "wrap", gap: "6px" }}>
                        <span>📅 {getFriendlyDate(log.date)}</span>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <span>⏱️ {durationMins} min</span>
                          <span>💪 {log.exerciseCount} Exercises</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-routine-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px", opacity: 0.5 }}>
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                  <p>No workouts logged yet.</p>
                  <p className="sub-text">Generate a routine and click "Start Workout" to begin logging stats!</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Floating Modal System */}
      {showExerciseModal && (
        <ExerciseModal
          mode={modalMode}
          exerciseToEdit={exerciseToEdit}
          onClose={() => {
            setShowExerciseModal(false);
            setExerciseToEdit(null);
          }}
          onSave={handleSaveEditedExercise}
          onAddExercise={handleAddExerciseToRoutine}
          onEditExercise={(ex) => {
            setExerciseToEdit(ex);
            setExerciseToEditIndex(null);
            setModalMode("edit");
          }}
        />
      )}

      {/* Reference Video Modal Overlay */}
      {showVideoPlayer && (
        <VideoPlayer
          exercise={videoExercise}
          onClose={() => {
            setShowVideoPlayer(false);
            setVideoExercise(null);
          }}
          onSaveVideo={handleSaveVideo}
        />
      )}

      {/* History Detail Modal Overlay */}
      {selectedHistoryLog && (
        <div className="modal-overlay" style={{ zIndex: 10001 }} onClick={() => setSelectedHistoryLog(null)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              padding: "20px", 
              borderRadius: "16px", 
              width: "calc(100% - 32px)", 
              maxWidth: "460px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              margin: "auto 16px"
            }}
          >
            <div className="modal-header" style={{ padding: "0 0 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "white", margin: 0 }}>
                  {selectedHistoryLog.workoutName || "Custom Workout"}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {getFriendlyDate(selectedHistoryLog.date)}
                </span>
              </div>
              <button 
                className="close-btn" 
                onClick={() => setSelectedHistoryLog(null)} 
                style={{ fontSize: "1.8rem", margin: 0, padding: 0 }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", margin: "12px 0 16px 0", border: "1px solid var(--border-color)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>DURATION</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "white" }}>
                  ⏱️ {Math.round(selectedHistoryLog.duration / 60)} min
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, borderLeft: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>EXERCISES</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "white" }}>
                  💪 {selectedHistoryLog.exerciseCount} Done
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "4px" }}>CALORIES</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--accent-neon)" }}>
                  🔥 {selectedHistoryLog.calories !== undefined ? selectedHistoryLog.calories : Math.round((selectedHistoryLog.duration / 60) * 6.5)} kcal
                </span>
              </div>
            </div>

            <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "white", margin: "0 0 10px 0", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>
              Exercises Completed
            </h4>
            
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedHistoryLog.exercises && selectedHistoryLog.exercises.map((ex, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    padding: "10px 12px", 
                    borderRadius: "8px", 
                    background: "rgba(255,255,255,0.01)", 
                    border: "1px solid var(--border-color)" 
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "white" }}>{ex.name}</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{ex.target}</span>
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-neon)", fontWeight: "600" }}>
                    {ex.duration > 0 ? `${ex.sets} sets x ${ex.duration}s` : `${ex.sets} sets x ${ex.reps} reps`}
                  </span>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedHistoryLog(null)} 
              style={{ marginTop: "16px", width: "100%" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Preset Loading overlay */}
      {presetLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "500px",
          height: "100%",
          background: "rgba(9, 13, 22, 0.9)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          backdropFilter: "blur(8px)"
        }}>
          {!presetLoading.success ? (
            <>
              {/* Spinner */}
              <div style={{
                width: "45px",
                height: "45px",
                border: "4px solid rgba(255, 255, 255, 0.1)",
                borderTopColor: "var(--accent-neon)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}></div>
              <p style={{ color: "white", fontSize: "0.95rem", fontWeight: "600" }}>
                Generating {presetLoading.name}...
              </p>
            </>
          ) : (
            <>
              {/* Success Checkmark */}
              <div style={{
                width: "55px",
                height: "55px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 255, 136, 0.1)",
                border: "2px solid var(--accent-neon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-neon)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <p style={{ color: "white", fontSize: "1.05rem", fontWeight: "700" }}>
                Workout Generated!
              </p>
            </>
          )}
        </div>
      )}



      {/* Mobile Sticky Navigation Tabs */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        routineCount={routine.length}
      />
    </div>
  );
}
