import React, { useState } from "react";
import WorkoutCard from "./WorkoutCard";

export default function WorkoutList({
  routine,
  setRoutine,
  onEditExercise,
  onDeleteExercise,
  onViewVideo
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newRoutine = [...routine];
    const temp = newRoutine[index];
    newRoutine[index] = newRoutine[index - 1];
    newRoutine[index - 1] = temp;
    setRoutine(newRoutine);
  };

  const handleMoveDown = (index) => {
    if (index === routine.length - 1) return;
    const newRoutine = [...routine];
    const temp = newRoutine[index];
    newRoutine[index] = newRoutine[index + 1];
    newRoutine[index + 1] = temp;
    setRoutine(newRoutine);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    // Needed for Firefox support
    e.dataTransfer.setData("text/plain", index);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Required to allow drop
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Smooth dynamic reordering during drag
    const newRoutine = [...routine];
    const draggedItem = newRoutine[draggedIndex];
    newRoutine.splice(draggedIndex, 1);
    newRoutine.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setRoutine(newRoutine);
  };

  if (!routine || routine.length === 0) {
    return (
      <div className="empty-routine-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "12px", opacity: 0.5}}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
          <line x1="9" y1="19" x2="15" y2="19"></line>
          <line x1="9" y1="11" x2="10" y2="11"></line>
        </svg>
        <p>Your routine is empty.</p>
        <p className="sub-text">Go to the Planner to generate recommendations or Add custom workouts!</p>
      </div>
    );
  }

  return (
    <div className="workout-list">
      {routine.map((exercise, index) => (
        <div
          key={`${exercise.id}-${index}`}
          onDragOver={(e) => handleDragOver(e, index)}
          className="drag-target-zone"
        >
          <WorkoutCard
            exercise={exercise}
            index={index}
            totalCount={routine.length}
            onEdit={onEditExercise}
            onDelete={onDeleteExercise}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onViewVideo={onViewVideo}
            dragHandlers={{
              draggable: true,
              onDragStart: (e) => handleDragStart(e, index),
              onDragEnd: handleDragEnd
            }}
          />
        </div>
      ))}
    </div>
  );
}
