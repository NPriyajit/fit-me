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
  const [history, setHistory] = useState(getHistory());
  const [customExercises, setCustomExercises] = useState(getCustomExercises());

  // Modal / overlay states
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'create'
  const [exerciseToEdit, setExerciseToEdit] = useState(null);
  const [exerciseToEditIndex, setExerciseToEditIndex] = useState(null);

  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoExercise, setVideoExercise] = useState(null);

  // In-app tap-to-confirm states
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearRoutine, setConfirmClearRoutine] = useState(false);


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
    } catch (e) {}

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

        setRoutine(resolved);
        setActiveTab("routine");
      }, 700);
    }, 600);
  };

  // Routine customization operations
  const handleClearRoutine = () => {
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
            
            <div className="preset-scroll" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "340px", overflowY: "auto", overscrollBehavior: "contain", paddingRight: "4px" }}>
              {filteredPresets.map((preset) => (
                <div 
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  style={{
                    background: "rgba(9, 13, 22, 0.4)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--border-radius-md)",
                    padding: "12px 14px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                  className="preset-item-card"
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: "600", color: "white", margin: 0 }}>
                      {preset.name}
                    </h4>
                    <span className="badge" style={{
                      fontSize: "0.65rem",
                      padding: "2px 6px",
                      textTransform: "uppercase",
                      borderRadius: "4px",
                      fontWeight: "700",
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
                  
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.3" }}>
                    {preset.description}
                  </p>
                  
                  <div style={{ display: "flex", gap: "12px", fontSize: "0.7rem", fontWeight: "600", color: "var(--accent-neon)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      ⏱️ {preset.duration} Min
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      💪 {preset.exercises.length} Exercises
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", textTransform: "capitalize" }}>
                      🏋️ {preset.equipment === "gym" ? "Full Gym" : preset.equipment === "dumbbell" ? "Dumbbell" : "Bodyweight"}
                    </span>
                  </div>
                </div>
              ))}
              {filteredPresets.length === 0 && (
                <div style={{ textAlign: "center", padding: "12px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                  No presets match your current filters.
                </div>
              )}
            </div>
          </div>
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
                <div className="stat-card" style={{borderColor: "var(--accent-blue)"}}>
                  <span className="stat-label">Warmup</span>
                  <span className="stat-value" style={{color: "var(--accent-blue)"}}>{countCategory("warmup")}</span>
                </div>
                
                <div className="stat-card" style={{borderColor: "var(--accent-neon)"}}>
                  <span className="stat-label">Main Lifts</span>
                  <span className="stat-value" style={{color: "var(--accent-neon)"}}>{countCategory("main")}</span>
                </div>

                <div className="stat-card" style={{borderColor: "var(--accent-secondary)"}}>
                  <span className="stat-label">Cooldown</span>
                  <span className="stat-value" style={{color: "var(--accent-secondary)"}}>{countCategory("cooldown")}</span>
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

            <div className="history-list">
              {history.length > 0 ? (
                history.map((log) => {
                  const durationMins = Math.round(log.duration / 60);
                  return (
                    <div key={log.id} className="history-card">
                      <div className="history-card-header">
                        <span className="history-date">{formatDate(log.date)}</span>
                        <span className="history-duration">⏱️ {durationMins} min</span>
                      </div>
                      
                      <div className="history-card-details">
                        <span>💪 {log.exerciseCount} Exercises Completed</span>
                      </div>

                      <div className="history-exercises-list">
                        {log.exercises && log.exercises.map((ex, idx) => (
                          <div key={idx} className="history-exercise-row">
                            <span className="history-ex-name">{ex.name}</span>
                            <span className="history-ex-vol">
                              {ex.duration > 0 ? `${ex.sets} sets x ${ex.duration}s` : `${ex.sets} sets x ${ex.reps} reps`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-routine-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "12px", opacity: 0.5}}>
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
        />
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
