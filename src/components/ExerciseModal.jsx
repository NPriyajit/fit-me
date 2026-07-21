import React, { useState, useEffect } from "react";
import { MUSCLE_GROUPS } from "../data/exercises";
import { addCustomExercise, getMergedLibrary } from "../utils/store";

export default function ExerciseModal({
  mode, // 'add' (library list) or 'edit' (edit single workout parameters) or 'create'
  exerciseToEdit,
  onClose,
  onSave, // callback for editing
  onAddExercise, // callback for adding an exercise from the library
  isFlat = false,
  onEditExercise = null
}) {
  // Active states
  const [activeSubMode, setActiveSubMode] = useState(mode); // 'add' or 'create'
  
  // Search & Filters (for 'add' mode)
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Form states (for 'create' / 'edit' modes)
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("Chest");
  const [formCategory, setFormCategory] = useState("main");
  const [formSets, setFormSets] = useState(3);
  const [formReps, setFormReps] = useState(10);
  const [formDuration, setFormDuration] = useState(0);
  const [formDesc, setFormDesc] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");

  // Load initial edit data if in edit mode
  useEffect(() => {
    if (mode === "edit" && exerciseToEdit) {
      setFormName(exerciseToEdit.name || "");
      setFormTarget(exerciseToEdit.target || "Chest");
      setFormCategory(exerciseToEdit.category || "main");
      setFormSets(exerciseToEdit.defaultSets || 3);
      setFormReps(exerciseToEdit.defaultReps || 10);
      setFormDuration(exerciseToEdit.defaultDuration || 0);
      setFormDesc(exerciseToEdit.description || "");
      setFormVideoUrl(exerciseToEdit.videoUrl || "");
    } else {
      // Defaults for create mode
      setFormName("");
      setFormTarget("Chest");
      setFormCategory("main");
      setFormSets(3);
      setFormReps(10);
      setFormDuration(0);
      setFormDesc("");
      setFormVideoUrl("");
    }
  }, [mode, exerciseToEdit]);

  // Combine default library with user custom exercises merged with overrides
  const library = getMergedLibrary();

  // Filter library exercises
  const filteredLibrary = library.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || 
                          ex.description.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = filterMuscle ? ex.target === filterMuscle : true;
    const matchesCategory = filterCategory ? ex.category === filterCategory : true;
    return matchesSearch && matchesMuscle && matchesCategory;
  });

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter an exercise name");
      return;
    }

    const exerciseData = {
      name: formName.trim(),
      target: formTarget,
      category: formCategory,
      defaultSets: parseInt(formSets) || 3,
      defaultReps: parseInt(formReps) || 0,
      defaultDuration: parseInt(formDuration) || 0,
      description: formDesc.trim(),
      videoUrl: formVideoUrl.trim()
    };

    if (mode === "edit" && exerciseToEdit) {
      // Merge with existing exercise ID and save
      onSave({ ...exerciseToEdit, ...exerciseData });
    } else {
      // Create new custom exercise, save to store, then add to current routine
      const savedEx = addCustomExercise(exerciseData);
      onAddExercise(savedEx);
    }
    onClose();
  };

  if (isFlat) {
    return (
      <div className="library-mode-flat">
        {/* Filter controls */}
        <div className="filters-grid">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search exercise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input search-input"
            />
          </div>
          
          <div className="filter-selects">
            <select 
              value={filterMuscle} 
              onChange={(e) => setFilterMuscle(e.target.value)}
              className="form-input filter-dropdown"
            >
              <option value="">All Muscles</option>
              {MUSCLE_GROUPS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input filter-dropdown"
            >
              <option value="">All Types</option>
              <option value="warmup">Warmup</option>
              <option value="main">Main Lift</option>
              <option value="cooldown">Cooldown</option>
            </select>
          </div>
        </div>

        {/* Exercises list */}
        <div className="library-list-container flat-library-list">
          {filteredLibrary.length > 0 ? (
            filteredLibrary.map((ex) => (
              <div key={ex.id} className="library-item-card">
                <div className="item-details">
                  <h4>{ex.name}</h4>
                  <div className="item-badges">
                    <span className={`badge badge-${ex.category}`}>{ex.category.toUpperCase()}</span>
                    <span className="badge badge-muscle">{ex.target}</span>
                    {ex.isCustom && <span className="badge badge-custom">CUSTOM</span>}
                  </div>
                  <p className="item-desc">{ex.description}</p>
                </div>
                <div className="library-item-actions">
                  {onEditExercise && (
                    <button
                      className="btn btn-secondary edit-item-btn"
                      onClick={() => onEditExercise(ex)}
                      title="Edit exercise details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                  <button
                    className="btn btn-primary add-item-btn"
                    onClick={() => {
                      onAddExercise(ex);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results-msg">No exercises match your filter criteria.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content main-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {mode === "edit" ? "Edit Workout Details" : activeSubMode === "add" ? "Add Exercise from Library" : "Create Custom Exercise"}
          </h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {/* Sub-navigation for switching between Library and Create custom (only in non-edit mode) */}
        {mode !== "edit" && mode !== "create" && (
          <div className="modal-tabs">
            <button 
              className={`modal-tab-btn ${activeSubMode === "add" ? "active" : ""}`}
              onClick={() => setActiveSubMode("add")}
            >
              Browse Library
            </button>
            <button 
              className={`modal-tab-btn ${activeSubMode === "create" ? "active" : ""}`}
              onClick={() => setActiveSubMode("create")}
            >
              Create New
            </button>
          </div>
        )}

        <div className="modal-body">
          {/* BROWSE & ADD LIBRARY MODE */}
          {mode !== "edit" && activeSubMode === "add" && (
            <div className="library-mode-content">
              {/* Filter controls */}
              <div className="filters-grid">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search exercise..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input search-input"
                  />
                </div>
                
                <div className="filter-selects">
                  <select 
                    value={filterMuscle} 
                    onChange={(e) => setFilterMuscle(e.target.value)}
                    className="form-input filter-dropdown"
                  >
                    <option value="">All Muscles</option>
                    {MUSCLE_GROUPS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="form-input filter-dropdown"
                  >
                    <option value="">All Types</option>
                    <option value="warmup">Warmup</option>
                    <option value="main">Main Lift</option>
                    <option value="cooldown">Cooldown</option>
                  </select>
                </div>
              </div>

              {/* Exercises list */}
              <div className="library-list-container">
                {filteredLibrary.length > 0 ? (
                  filteredLibrary.map((ex) => (
                    <div key={ex.id} className="library-item-card">
                      <div className="item-details">
                        <h4>{ex.name}</h4>
                        <div className="item-badges">
                          <span className={`badge badge-${ex.category}`}>{ex.category.toUpperCase()}</span>
                          <span className="badge badge-muscle">{ex.target}</span>
                          {ex.isCustom && <span className="badge badge-custom">CUSTOM</span>}
                        </div>
                        <p className="item-desc">{ex.description}</p>
                      </div>
                      <div className="library-item-actions">
                        {onEditExercise && (
                          <button
                            className="btn btn-secondary edit-item-btn"
                            onClick={() => onEditExercise(ex)}
                            title="Edit exercise details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        )}
                        <button
                          className="btn btn-primary add-item-btn"
                          onClick={() => {
                            onAddExercise(ex);
                            onClose();
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-results-msg">No exercises match your filter criteria.</p>
                )}
              </div>
            </div>
          )}

          {/* CREATE / EDIT CUSTOM EXERCISE FORM */}
          {(mode === "edit" || activeSubMode === "create") && (
            <form onSubmit={handleSubmitForm} className="custom-exercise-form">
              <div className="form-group">
                <label className="form-label">Exercise Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Dumbbell Fly"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target Muscle</label>
                  <select 
                    value={formTarget} 
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="form-input"
                  >
                    {MUSCLE_GROUPS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Workout Category</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="warmup">Warmup / Pre-Stretch</option>
                    <option value="main">Main Exercise</option>
                    <option value="cooldown">Cooldown / Post-Stretch</option>
                  </select>
                </div>
              </div>

              <div className="form-row volume-settings">
                <div className="form-group">
                  <label className="form-label">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formSets}
                    onChange={(e) => setFormSets(Math.max(1, parseInt(e.target.value) || 1))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reps (0 if timed)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formReps}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setFormReps(val);
                      if (val > 0) setFormDuration(0); // mutually exclusive
                    }}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (sec)</label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={formDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setFormDuration(val);
                      if (val > 0) setFormReps(0); // mutually exclusive
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Media Reference URL (Optional)</label>
                <div className="input-with-icon-wrapper">
                  <input
                    type="url"
                    placeholder="e.g. YouTube Video, Short, or GIF link"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    className="form-input input-with-icon"
                  />
                  {formVideoUrl ? (
                    <button
                      type="button"
                      className="input-play-btn"
                      onClick={() => window.open(formVideoUrl, "_blank")}
                      title="Open and verify the entered media URL in a new tab"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="video-play-svg">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="input-sparkle-btn"
                      onClick={() => {
                        const query = formName.trim() ? `how to do ${formName.trim()} exercise form guide` : "gym exercise guide";
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
                      }}
                      title="AI Dynamic Search: Lookup video guides on YouTube for this workout"
                      disabled={!formName.trim()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="sparkle-svg">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                        <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z"></path>
                        <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"></path>
                      </svg>
                    </button>
                  )}
                </div>
                <small className="help-text">
                  {formVideoUrl
                    ? "Tap the Play icon on the right to open and verify the entered media URL."
                    : !formName.trim()
                    ? "Enter an exercise name above to enable the AI Sparkle search lookup helper."
                    : "Tap the AI Sparkle sparkles icon on the right to search YouTube for this form guide."}
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions / Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe step-by-step form instructions..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="form-input form-textarea"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {mode === "edit" ? "Save Changes" : "Add to Routine"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
