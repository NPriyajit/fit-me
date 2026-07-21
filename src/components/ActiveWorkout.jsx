import React, { useState, useEffect, useRef } from "react";
import { logCompletedWorkout } from "../utils/store";

export default function ActiveWorkout({ routine, onExit, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState("active"); // 'active' or 'rest'
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Stats tracking
  const [totalTime, setTotalTime] = useState(0);

  // References
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);

  const activeExercise = routine[currentIndex];
  const isTimedExercise = activeExercise && activeExercise.defaultDuration > 0;
  
  // 1. Synthetic Web Audio API Beep Generator (100% local, no assets required)
  const playSound = (type = "success") => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === "beep") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = 880;
        osc.type = "sine";
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === "success") {
        // Double tone ascending beep
        const playTone = (freq, start, duration) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.value = freq;
          osc.type = "triangle";
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
          osc.start(audioCtx.currentTime + start);
          osc.stop(audioCtx.currentTime + start + duration);
        };
        playTone(523.25, 0, 0.15); // C5
        playTone(659.25, 0.15, 0.25); // E5
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
    playSound("beep");
    if (phase === "active") {
      // Finished a timed set
      goToRestOrNext();
    } else {
      // Rest is over, back to active workout
      setPhase("active");
    }
  };

  const goToRestOrNext = () => {
    const totalSets = activeExercise.defaultSets || 3;
    if (currentSet < totalSets) {
      // Move to next set of current exercise
      setPhase("rest");
      setCurrentSet((s) => s + 1);
    } else {
      // Move to next exercise
      if (currentIndex < routine.length - 1) {
        setPhase("rest");
        setCurrentIndex((i) => i + 1);
        setCurrentSet(1);
      } else {
        // Workout fully completed!
        finishWorkout();
      }
    }
  };

  const skipRest = () => {
    setPhase("active");
  };

  const adjustRestTime = (amount) => {
    setTimeLeft((prev) => Math.max(5, prev + amount));
  };

  const finishWorkout = () => {
    clearInterval(totalTimerRef.current);
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    playSound("success");
    logCompletedWorkout(routine, totalTime);
    setWorkoutFinished(true);
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
      <div className="player-header">
        <button className="btn-icon exit-btn" onClick={() => setShowExitConfirm(true)} aria-label="Exit workout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="workout-progress-text">
          Exercise {currentIndex + 1} of {routine.length}
        </div>
        <div className="elapsed-time">⏱️ {formatTime(totalTime)}</div>
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
            {activeExercise.videoUrl ? (
              <a 
                href={activeExercise.videoUrl} 
                target="_blank" 
                className="btn-media-link"
                rel="noopener noreferrer"
              >
                🎥 Open Video reference
              </a>
            ) : (
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeExercise.searchQuery || `how to do ${activeExercise.name} exercise form`)}`}
                target="_blank" 
                className="btn-media-link"
                rel="noopener noreferrer"
              >
                🔍 Search Guide on YouTube
              </a>
            )}
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
    </div>
  );
}
