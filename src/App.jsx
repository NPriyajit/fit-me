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
  deleteCustomExercise
} from "./utils/store";
import { generateRecommendation } from "./utils/recommender";

export default function App() {
  // Navigation & Screen states
  const [activeTab, setActiveTab] = useState("planner");
  const [activeWorkoutMode, setActiveWorkoutMode] = useState(false);

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
    const newRoutine = [...routine];
    newRoutine[exerciseToEditIndex] = updated;
    setRoutine(newRoutine);
  };

  const handleAddExerciseToRoutine = (exercise) => {
    // Add default values for duration/sets if not present
    const item = {
      ...exercise,
      defaultSets: exercise.defaultSets || 3,
      defaultReps: exercise.defaultReps || 10,
      defaultDuration: exercise.defaultDuration || 0
    };
    setRoutine([...routine, item]);
    refreshCustomExercises(); // reload in case a custom workout was created
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
                onClose={() => {}}
                onAddExercise={handleAddExerciseToRoutine}
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

      {/* Mobile Sticky Navigation Tabs */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        routineCount={routine.length}
      />
    </div>
  );
}
