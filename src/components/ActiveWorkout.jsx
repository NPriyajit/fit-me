import React, { useState, useEffect, useRef } from "react";
import { logCompletedWorkout, getMergedLibrary, saveExerciseOverride, addCustomExercise } from "../utils/store";
import { MUSCLE_GROUPS } from "../data/exercises";
import VideoPlayer from "./VideoPlayer";

export default function ActiveWorkout({ routine, setRoutine, routineName, onExit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState("active"); // 'active' or 'rest'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageTab, setManageTab] = useState("current"); // 'current' or 'add'
  const [addTab, setAddTab] = useState("search"); // 'search' or 'create'
  const [searchQuery, setSearchQuery] = useState("");
  const [addedExId, setAddedExId] = useState(null);
  
  const [customForm, setCustomForm] = useState({
    name: "",
    category: "main",
    target: "Chest",
    defaultSets: 3,
    defaultReps: 10,
    defaultDuration: 0
  });

  const [showVideoModal, setShowVideoModal] = useState(false);

  // Stats tracking
  const [totalTime, setTotalTime] = useState(0);

  // References
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const wasRunningBeforeModalRef = useRef(false);

  const activeExercise = routine[currentIndex];
  const isTimedExercise = activeExercise && activeExercise.defaultDuration > 0;
  
  // 1. Synthetic Web Audio API Beep Generator (100% local, no assets required)
  const playSound = (type = "success") => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (freq, start, duration, typeOsc = "sine", gainVal = 0.2) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        osc.type = typeOsc;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(gainVal, audioCtx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      if (type === "start-set") {
        // High ascending double-beep (Go!)
        playTone(660, 0, 0.1, "sine", 0.2);
        playTone(880, 0.1, 0.15, "sine", 0.2);
      } else if (type === "end-set") {
        // Downward double-beep (Rest/Done)
        playTone(554.37, 0, 0.12, "sine", 0.25);
        playTone(440, 0.12, 0.18, "sine", 0.25);
      } else if (type === "success") {
        // Upward arpeggio celebration (Winner!)
        playTone(523.25, 0, 0.15, "triangle", 0.25); // C5
        playTone(659.25, 0.12, 0.15, "triangle", 0.25); // E5
        playTone(783.99, 0.24, 0.15, "triangle", 0.25); // G5
        playTone(1046.50, 0.36, 0.35, "sine", 0.3); // C6 (long ring)
      } else if (type === "beep") {
        // General beep fallback
        playTone(880, 0, 0.15, "sine", 0.2);
      }
    } catch (e) {
      console.warn("AudioContext block/error", e);
    }
  };

  // 2. Track total workout timer
  useEffect(() => {
    totalTimerRef.current = setInterval(() => {
      setTotalTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(totalTimerRef.current);
  }, []);

  // 3. Handle active/rest timer countdowns
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      clearInterval(timerRef.current);
      setIsTimerRunning(false);
      handleTimerExpiration();
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning, timeLeft]);

  // 3b. Auto-pause and auto-resume workout timer when overlay modals open/close
  useEffect(() => {
    const isAnyModalOpen = showExitConfirm || showManageModal || showVideoModal;
    
    if (isAnyModalOpen) {
      if (isTimerRunning) {
        wasRunningBeforeModalRef.current = true;
        setIsTimerRunning(false);
      }
    } else {
      if (wasRunningBeforeModalRef.current) {
        setIsTimerRunning(true);
        wasRunningBeforeModalRef.current = false;
      }
    }
  }, [showExitConfirm, showManageModal, showVideoModal]);

  // Screen Wake Lock API to keep the display awake during workout
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      if (!("wakeLock" in navigator)) return;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.warn(`Wake Lock failed: ${err.name}, ${err.message}`);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && !wakeLock) {
        await requestWakeLock();
      }
    };

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release()
          .then(() => {
            wakeLock = null;
          })
          .catch((err) => console.error("Release Wake Lock failed", err));
      }
    };
  }, []);

  // 4. Reset timers on phase changes or index changes
  useEffect(() => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);

    if (phase === "rest") {
      setTimeLeft(45); // Standard 45s rest
      setIsTimerRunning(true);
    } else {
      // Active Phase
      if (isTimedExercise) {
        setTimeLeft(activeExercise.defaultDuration);
        setIsTimerRunning(true);
      } else {
        setTimeLeft(0);
      }
    }
  }, [currentIndex, currentSet, phase]);

  const handleTimerExpiration = () => {
    if (phase === "active") {
      // Finished a timed set
      goToRestOrNext();
    } else {
      // Rest is over, back to active workout
      setPhase("active");
      playSound("start-set");
    }
  };

  const goToRestOrNext = () => {
    const totalSets = activeExercise.defaultSets || 3;
    if (currentSet < totalSets) {
      // Move to next set of current exercise
      setPhase("rest");
      setCurrentSet((s) => s + 1);
      playSound("end-set");
    } else {
      // Move to next exercise
      if (currentIndex < routine.length - 1) {
        setPhase("rest");
        setCurrentIndex((i) => i + 1);
        setCurrentSet(1);
        playSound("end-set");
      } else {
        // Workout fully completed!
        finishWorkout();
      }
    }
  };

  const skipRest = () => {
    setPhase("active");
    playSound("start-set");
  };

  const adjustRestTime = (amount) => {
    setTimeLeft((prev) => Math.max(5, prev + amount));
  };

  const finishWorkout = () => {
    clearInterval(totalTimerRef.current);
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    playSound("success");
    logCompletedWorkout(routine, totalTime, routineName);
    setWorkoutFinished(true);
  };

  const getRemainingTime = () => {
    let totalSecs = 0;
    if (!activeExercise) return 0;
    
    // Current exercise remaining sets time
    if (phase === "rest") {
      totalSecs += timeLeft;
      const remainingSetsOfCurrent = Math.max(0, activeExercise.defaultSets - currentSet);
      totalSecs += remainingSetsOfCurrent * (activeExercise.defaultDuration > 0 ? activeExercise.defaultDuration : 30);
      totalSecs += Math.max(0, remainingSetsOfCurrent - 1) * 45;
      
      if (currentIndex < routine.length - 1 && remainingSetsOfCurrent > 0) {
        totalSecs += 45;
      }
    } else {
      totalSecs += isTimedExercise ? timeLeft : 30;
      const remainingSetsOfCurrent = Math.max(0, activeExercise.defaultSets - currentSet);
      totalSecs += remainingSetsOfCurrent * (activeExercise.defaultDuration > 0 ? activeExercise.defaultDuration : 30);
      totalSecs += remainingSetsOfCurrent * 45;
    }

    // Subsequent exercises in routine
    for (let i = currentIndex + 1; i < routine.length; i++) {
      const ex = routine[i];
      const sets = ex.defaultSets || 3;
      const setDuration = ex.defaultDuration > 0 ? ex.defaultDuration : 30;
      totalSecs += 45; // Rest before starting this exercise
      totalSecs += sets * setDuration;
      totalSecs += (sets - 1) * 45;
    }
    
    return totalSecs;
  };

  const handleRemoveExercise = (idx) => {
    if (routine.length <= 1) {
      alert("Cannot remove the only exercise. Please exit the workout instead.");
      return;
    }
    
    const newRoutine = [...routine];
    newRoutine.splice(idx, 1);
    setRoutine(newRoutine);
    
    if (idx === currentIndex) {
      if (currentIndex >= newRoutine.length) {
        // Deleted the last exercise, finish workout
        clearInterval(totalTimerRef.current);
        clearInterval(timerRef.current);
        setIsTimerRunning(false);
        playSound("success");
        logCompletedWorkout(newRoutine, totalTime, routineName);
        setWorkoutFinished(true);
      } else {
        // Stay on same index, reset sets & phase
        setCurrentSet(1);
        setPhase("active");
        const nextEx = newRoutine[currentIndex];
        setTimeLeft(nextEx.defaultDuration > 0 ? nextEx.defaultDuration : 0);
      }
    } else if (idx < currentIndex) {
      // Deleted an item before active one, adjust index down
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleAddExercise = (exercise) => {
    const item = {
      ...exercise,
      defaultSets: exercise.defaultSets || 3,
      defaultReps: exercise.defaultReps || 10,
      defaultDuration: exercise.defaultDuration || 0
    };
    
    const newRoutine = [...routine];
    newRoutine.push(item);
    setRoutine(newRoutine);
    
    setAddedExId(exercise.id);
    setTimeout(() => setAddedExId(null), 1000);
  };

  const handleCreateAndAdd = () => {
    if (!customForm.name.trim()) {
      alert("Please enter an exercise name.");
      return;
    }
    
    const newEx = addCustomExercise({
      name: customForm.name.trim(),
      category: customForm.category,
      target: customForm.target,
      defaultSets: parseInt(customForm.defaultSets) || 3,
      defaultReps: parseInt(customForm.defaultReps) || 10,
      defaultDuration: parseInt(customForm.defaultDuration) || 0,
      equipment: "gym"
    });
    
    const newRoutine = [...routine];
    newRoutine.push(newEx);
    setRoutine(newRoutine);
    
    setCustomForm({
      ...customForm,
      name: ""
    });
    
    setAddedExId(newEx.id);
    setTimeout(() => setAddedExId(null), 1000);
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newRoutine = [...routine];
    const temp = newRoutine[idx];
    newRoutine[idx] = newRoutine[idx - 1];
    newRoutine[idx - 1] = temp;
    setRoutine(newRoutine);

    if (idx === currentIndex) {
      setCurrentIndex(idx - 1);
    } else if (idx - 1 === currentIndex) {
      setCurrentIndex(idx);
    }
  };

  const handleMoveDown = (idx) => {
    if (idx === routine.length - 1) return;
    const newRoutine = [...routine];
    const temp = newRoutine[idx];
    newRoutine[idx] = newRoutine[idx + 1];
    newRoutine[idx + 1] = temp;
    setRoutine(newRoutine);

    if (idx === currentIndex) {
      setCurrentIndex(idx + 1);
    } else if (idx + 1 === currentIndex) {
      setCurrentIndex(idx);
    }
  };

  // Skip manually (reps-based active movement or forcing progress)
  const handleMarkSetDone = () => {
    goToRestOrNext();
  };

  const handleSkipExercise = () => {
    if (currentIndex < routine.length - 1) {
      setCurrentIndex((i) => i + 1);
      setCurrentSet(1);
      setPhase("active");
      playSound("start-set");
    } else {
      finishWorkout();
    }
  };

  const handlePreviousExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setCurrentSet(1);
      setPhase("active");
    }
  };

  // Circular progress math
  const getProgressPercentage = () => {
    if (phase === "rest") {
      return (timeLeft / 45) * 100;
    }
    if (isTimedExercise) {
      return (timeLeft / activeExercise.defaultDuration) * 100;
    }
    return 100;
  };

  const strokeDashoffset = () => {
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const percentage = getProgressPercentage();
    return circumference - (percentage / 100) * circumference;
  };

  // Helper formatting for timers
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  if (workoutFinished) {
    // Workout Summary Screen
    const estCalories = Math.round((totalTime / 60) * 6.5); // Average 6.5 cals/min
    return (
      <div className="workout-container summary-screen">
        <div className="celebration-badge">🎉</div>
        <h2>Workout Completed!</h2>
        <p className="congrats-text">Great effort. You showed up and crushed it!</p>

        <div className="stats-box-grid">
          <div className="stat-card">
            <span className="stat-label">Total Time</span>
            <span className="stat-value">{formatTime(totalTime)}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Exercises Done</span>
            <span className="stat-value">{routine.length}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Est. Calories</span>
            <span className="stat-value">{estCalories} kcal</span>
          </div>
        </div>

        <div className="routine-summary-log">
          <h3>Exercises Completed</h3>
          <div className="summary-list">
            {routine.map((ex, i) => (
              <div key={i} className="summary-list-item">
                <span className="summary-index">{i + 1}</span>
                <div className="summary-details">
                  <h4>{ex.name}</h4>
                  <p>{ex.defaultSets} sets &bull; {ex.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary exit-summary-btn" onClick={onFinish}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle errors or empty routine safely
  if (!activeExercise) return null;

  return (
    <div className="workout-container player-screen">
      {/* Header */}
      <div className="player-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "12px 20px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="btn-icon exit-btn" onClick={() => setShowExitConfirm(true)} aria-label="Exit workout" style={{ margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <button 
            className="btn-icon" 
            onClick={() => setShowManageModal(true)} 
            aria-label="Manage workout" 
            style={{ 
              margin: 0, 
              background: "rgba(255, 255, 255, 0.08)", 
              border: "1px solid var(--border-color)", 
              padding: "6px", 
              borderRadius: "8px", 
              color: "white" 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="workout-progress-text" style={{ fontSize: "0.95rem", fontWeight: "600", color: "white" }}>
          Exercise {currentIndex + 1} of {routine.length}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1px" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", letterSpacing: "0.05em" }}>ELAPSED: {formatTime(totalTime)}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--accent-neon)", display: "flex", alignItems: "center", gap: "3px" }}>
            ⏱️ ~{formatTime(getRemainingTime())}
          </span>
        </div>
      </div>

      {/* REST PHASE OVERLAY UI */}
      {phase === "rest" ? (
        <div className="rest-phase-container">
          <div className="rest-timer-wrapper">
            <span className="rest-label">REST</span>
            <h2 className="countdown-display">{formatTime(timeLeft)}</h2>
            
            <div className="rest-adjust-buttons">
              <button className="btn-adjust" onClick={() => adjustRestTime(-10)}>-10s</button>
              <button className="btn-adjust" onClick={() => adjustRestTime(10)}>+10s</button>
            </div>
          </div>

          <div className="next-up-card">
            <span className="next-tag">NEXT UP</span>
            <h3>{activeExercise.name}</h3>
            <p>{activeExercise.defaultSets} Sets &bull; {activeExercise.target}</p>
          </div>

          <button className="btn btn-primary skip-rest-btn" onClick={skipRest}>
            Skip Rest
          </button>
        </div>
      ) : (
        /* ACTIVE EXERCISE PLAYER UI */
        <div className="active-phase-container">
          {/* Card Info */}
          <div className="exercise-player-card">
            <div className="card-tags">
              <span className={`badge badge-${activeExercise.category}`}>{activeExercise.category.toUpperCase()}</span>
              <span className="badge badge-muscle">{activeExercise.target}</span>
            </div>
            
            <h2 className="player-title">{activeExercise.name}</h2>
            
            <div className="set-indicator">
              Set {currentSet} of {activeExercise.defaultSets}
            </div>

            {/* Instruction description scrollable block */}
            <div className="player-description">
              <p>{activeExercise.description}</p>
            </div>

            {/* Search Helper / Video link in player */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="btn btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-color)",
                background: activeExercise.videoUrl ? "rgba(16, 185, 129, 0.06)" : "rgba(255,255,255,0.04)",
                color: activeExercise.videoUrl ? "var(--accent-neon)" : "white",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: activeExercise.videoUrl ? "0 0 10px rgba(16, 185, 129, 0.15)" : "none",
                outline: "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = activeExercise.videoUrl ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = activeExercise.videoUrl ? "var(--accent-neon)" : "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = activeExercise.videoUrl ? "rgba(16, 185, 129, 0.06)" : "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              {activeExercise.videoUrl ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                  <span>Watch Reference Video</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Add / Search Video Guide</span>
                </>
              )}
            </button>
          </div>

          {/* TIMER ZONE (If timed exercise, circular countdown. If reps, circular completed count) */}
          <div className="timer-section">
            {isTimedExercise ? (
              <div className="circular-timer-container">
                <svg className="progress-ring" width="220" height="220">
                  <circle
                    className="progress-ring__circle-bg"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                    r="90"
                    cx="110"
                    cy="110"
                  />
                  <circle
                    className="progress-ring__circle"
                    stroke="#10b981" // neon green
                    strokeWidth="10"
                    fill="transparent"
                    r="90"
                    cx="110"
                    cy="110"
                    strokeDasharray={2 * Math.PI * 90}
                    strokeDashoffset={strokeDashoffset()}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="timer-inner-text">
                  <span className="timer-val">{formatTime(timeLeft)}</span>
                  <span className="timer-lbl">COUNTDOWN</span>
                </div>
              </div>
            ) : (
              <div className="rep-counter-container">
                <div className="rep-large-circle">
                  <span className="rep-number">{activeExercise.defaultReps}</span>
                  <span className="rep-label">REPS</span>
                </div>
              </div>
            )}
          </div>

          {/* Timer controls */}
          {isTimedExercise && (
            <div className="timer-buttons">
              <button
                className={`btn btn-timer-play ${isTimerRunning ? "pause" : "play"}`}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? "PAUSE" : "RESUME"}
              </button>
            </div>
          )}

          {/* Navigation and set validation */}
          <div className="player-navigation">
            <button
              className="btn btn-secondary nav-btn"
              disabled={currentIndex === 0 && currentSet === 1}
              onClick={handlePreviousExercise}
            >
              Previous
            </button>

            {/* Set check mark button */}
            <button className="btn btn-primary action-btn-done" onClick={handleMarkSetDone}>
              {currentSet === activeExercise.defaultSets ? "Finish Exercise" : "Done Set"}
            </button>

            <button className="btn btn-secondary nav-btn" onClick={handleSkipExercise}>
              Skip
            </button>
          </div>
        </div>
      )}

      {showManageModal && (
        <div className="modal-overlay" style={{ zIndex: 10002 }} onClick={() => setShowManageModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              maxHeight: "85vh", 
              width: "100%", 
              maxWidth: "460px", 
              display: "flex", 
              flexDirection: "column", 
              borderRadius: "16px",
              overflow: "hidden"
            }}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ padding: "16px 20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "white", margin: 0 }}>Manage Workout</h3>
              <button className="close-btn" onClick={() => setShowManageModal(false)} style={{ fontSize: "1.6rem", margin: 0, padding: 0 }}>&times;</button>
            </div>

            {/* Modal Tabs */}
            <div className="modal-tabs" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <button 
                className={`modal-tab-btn ${manageTab === "current" ? "active" : ""}`}
                onClick={() => setManageTab("current")}
                style={{ 
                  padding: "12px", 
                  background: manageTab === "current" ? "rgba(255,255,255,0.04)" : "none",
                  border: "none",
                  borderBottom: manageTab === "current" ? "2px solid var(--accent-neon)" : "1px solid var(--border-color)",
                  color: manageTab === "current" ? "white" : "var(--text-muted)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Current ({routine.length})
              </button>
              <button 
                className={`modal-tab-btn ${manageTab === "add" ? "active" : ""}`}
                onClick={() => setManageTab("add")}
                style={{ 
                  padding: "12px", 
                  background: manageTab === "add" ? "rgba(255,255,255,0.04)" : "none",
                  border: "none",
                  borderBottom: manageTab === "add" ? "2px solid var(--accent-neon)" : "1px solid var(--border-color)",
                  color: manageTab === "add" ? "white" : "var(--text-muted)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                + Add Exercise
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {manageTab === "current" ? (
                /* List of current exercises */
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {routine.map((ex, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <div 
                        key={`${ex.id}-${idx}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          borderRadius: "10px",
                          background: isCurrent ? "rgba(16, 185, 129, 0.08)" : "rgba(255,255,255,0.02)",
                          border: isCurrent ? "1px solid var(--accent-neon)" : "1px solid var(--border-color)",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", textAlign: "left" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: "700", color: isCurrent ? "var(--accent-neon)" : "white" }}>
                            {ex.name} {isCurrent && " (Active)"}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {ex.defaultSets} sets &bull; {ex.defaultDuration > 0 ? `${ex.defaultDuration}s` : `${ex.defaultReps} reps`}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Move Up */}
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveUp(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: idx === 0 ? "var(--text-muted)" : "white",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: idx === 0 ? 0.3 : 1
                            }}
                            title="Move up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          </button>
                          
                          {/* Move Down */}
                          <button
                            disabled={idx === routine.length - 1}
                            onClick={() => handleMoveDown(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: idx === routine.length - 1 ? "var(--text-muted)" : "white",
                              cursor: idx === routine.length - 1 ? "not-allowed" : "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: idx === routine.length - 1 ? 0.3 : 1
                            }}
                            title="Move down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>

                          {/* Delete */}
                          <button 
                            onClick={() => handleRemoveExercise(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--accent-danger)",
                              cursor: "pointer",
                              padding: "6px",
                              borderRadius: "6px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                            title="Remove exercise"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Add Exercise Section (with search and create custom tabs) */
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Sub-tabs for Add Exercise */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => setAddTab("search")}
                      style={{ 
                        flex: 1, 
                        padding: "8px 12px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--border-color)", 
                        background: addTab === "search" ? "rgba(255,255,255,0.06)" : "none",
                        color: addTab === "search" ? "white" : "var(--text-muted)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      Search Library
                    </button>
                    <button 
                      onClick={() => setAddTab("create")}
                      style={{ 
                        flex: 1, 
                        padding: "8px 12px", 
                        borderRadius: "8px", 
                        border: "1px solid var(--border-color)", 
                        background: addTab === "create" ? "rgba(255,255,255,0.06)" : "none",
                        color: addTab === "create" ? "white" : "var(--text-muted)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      + Create Custom
                    </button>
                  </div>

                  {addTab === "search" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Search library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid var(--border-color)",
                          color: "white",
                          fontSize: "0.85rem",
                          boxSizing: "border-box",
                          outline: "none"
                        }}
                      />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {getMergedLibrary()
                          .filter((ex) => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((ex) => {
                            const isAdded = addedExId === ex.id;
                            return (
                              <div 
                                key={ex.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "10px 12px",
                                  borderRadius: "8px",
                                  background: "rgba(255,255,255,0.01)",
                                  border: "1px solid var(--border-color)",
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                                  <span style={{ fontSize: "0.84rem", fontWeight: "600", color: "white" }}>
                                    {ex.name}
                                  </span>
                                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                    {ex.target} &bull; {ex.equipment}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleAddExercise(ex)}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: isAdded ? "rgba(16, 185, 129, 0.2)" : "var(--accent-neon)",
                                    color: isAdded ? "var(--accent-neon)" : "#090d16",
                                    fontWeight: "700",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  {isAdded ? "✓ Added" : "+ Add"}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : (
                    /* Inline Creation Form */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>EXERCISE NAME</label>
                        <input
                          type="text"
                          placeholder="e.g. Incline Bench Press"
                          value={customForm.name}
                          onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid var(--border-color)",
                            color: "white",
                            fontSize: "0.8rem",
                            boxSizing: "border-box",
                            outline: "none"
                          }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>CATEGORY</label>
                          <select
                            value={customForm.category}
                            onChange={(e) => setCustomForm({ ...customForm, category: e.target.value })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              color: "white",
                              fontSize: "0.8rem",
                              outline: "none"
                            }}
                          >
                            <option value="warmup">Warmup</option>
                            <option value="main">Main Lift</option>
                            <option value="cooldown">Cooldown</option>
                          </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>TARGET MUSCLE</label>
                          <select
                            value={customForm.target}
                            onChange={(e) => setCustomForm({ ...customForm, target: e.target.value })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              color: "white",
                              fontSize: "0.8rem",
                              outline: "none"
                            }}
                          >
                            {MUSCLE_GROUPS.map((m) => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>SETS</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={customForm.defaultSets}
                            onChange={(e) => setCustomForm({ ...customForm, defaultSets: parseInt(e.target.value) || 1 })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border-color)",
                              color: "white",
                              fontSize: "0.8rem",
                              boxSizing: "border-box",
                              outline: "none"
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>REPS</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customForm.defaultReps}
                            onChange={(e) => setCustomForm({ ...customForm, defaultReps: parseInt(e.target.value) || 0, defaultDuration: 0 })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border-color)",
                              color: "white",
                              fontSize: "0.8rem",
                              boxSizing: "border-box",
                              outline: "none"
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "700" }}>SEC</label>
                          <input
                            type="number"
                            min="0"
                            max="300"
                            value={customForm.defaultDuration}
                            onChange={(e) => setCustomForm({ ...customForm, defaultDuration: parseInt(e.target.value) || 0, defaultReps: e.target.value > 0 ? 0 : customForm.defaultReps })}
                            style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid var(--border-color)",
                              color: "white",
                              fontSize: "0.8rem",
                              boxSizing: "border-box",
                              outline: "none"
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleCreateAndAdd}
                        style={{
                          width: "100%",
                          padding: "10px",
                          marginTop: "6px",
                          borderRadius: "8px",
                          border: "none",
                          background: addedExId ? "rgba(16, 185, 129, 0.2)" : "var(--accent-neon)",
                          color: addedExId ? "var(--accent-neon)" : "#090d16",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {addedExId ? "✓ Created and Added!" : "+ Create & Add to Workout"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="modal-overlay" style={{ zIndex: 10002 }} onClick={() => setShowExitConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: "24px", gap: "16px", borderRadius: "16px", margin: "auto 16px" }}>
            <h3 style={{ fontSize: "1.4rem", color: "white" }}>Exit Active Workout?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              You are currently in the middle of your workout session. If you exit now, your active progress in this session will be lost and not saved to history.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button className="btn btn-secondary" onClick={() => setShowExitConfirm(false)} style={{ flex: 1 }}>
                Keep Workout
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit(); // Exits the workout directly
                }} 
                style={{ flex: 1, backgroundColor: "var(--accent-danger)", color: "white", boxShadow: "0 0 10px rgba(255, 71, 87, 0.3)" }}
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
      {showVideoModal && (
        <VideoPlayer
          exercise={activeExercise}
          onClose={() => setShowVideoModal(false)}
          onSaveVideo={(exerciseId, newUrl) => {
            saveExerciseOverride(exerciseId, { videoUrl: newUrl });
            const newRoutine = routine.map(ex => ex.id === exerciseId ? { ...ex, videoUrl: newUrl } : ex);
            setRoutine(newRoutine);
          }}
        />
      )}
    </div>
  );
}
