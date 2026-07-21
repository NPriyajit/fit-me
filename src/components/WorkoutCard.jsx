import React from "react";

export default function WorkoutCard({
  exercise,
  index,
  totalCount,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onViewVideo,
  dragHandlers
}) {
  const { name, target, category, defaultSets, defaultReps, defaultDuration, videoUrl } = exercise;

  // Generate tag classes/colors based on category & muscle
  const getCategoryClass = () => {
    if (category === "warmup") return "badge-warmup";
    if (category === "cooldown") return "badge-cooldown";
    return "badge-main";
  };

  const formatVolume = () => {
    if (defaultDuration > 0 && defaultReps <= 1) {
      return `${defaultSets} Set${defaultSets > 1 ? "s" : ""} &times; ${defaultDuration}s`;
    }
    return `${defaultSets} Set${defaultSets > 1 ? "s" : ""} &times; ${defaultReps} Reps`;
  };

  return (
    <div 
      className={`workout-card ${category}`}
      {...dragHandlers}
    >
      {/* Drag Handle for desktop/advanced touch */}
      <div className="drag-handle" title="Drag to reorder">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="5" r="1"></circle>
          <circle cx="9" cy="12" r="1"></circle>
          <circle cx="9" cy="19" r="1"></circle>
          <circle cx="15" cy="5" r="1"></circle>
          <circle cx="15" cy="12" r="1"></circle>
          <circle cx="15" cy="19" r="1"></circle>
        </svg>
      </div>

      <div className="card-body">
        <div className="card-tags">
          <span className={`badge ${getCategoryClass()}`}>
            {category.toUpperCase()}
          </span>
          <span className="badge badge-muscle">
            {target}
          </span>
        </div>
        
        <h4 className="exercise-title">{name}</h4>
        
        <p 
          className="exercise-volume"
          dangerouslySetInnerHTML={{ __html: formatVolume() }}
        />
      </div>

      {/* Action Buttons */}
      <div className="card-actions">
        {/* View Video / Guide */}
        <button 
          className={`action-btn view-btn ${videoUrl ? "has-video" : ""}`}
          onClick={() => onViewVideo(exercise)}
          title="View reference guide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        </button>

        {/* Edit Details */}
        <button 
          className="action-btn edit-btn"
          onClick={() => onEdit(exercise, index)}
          title="Edit sets/reps"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        {/* Reordering via chevrons (essential for easy mobile typing/tapping) */}
        <div className="reorder-controls">
          <button 
            className="reorder-btn"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            title="Move up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          
          <button 
            className="reorder-btn"
            disabled={index === totalCount - 1}
            onClick={() => onMoveDown(index)}
            title="Move down"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>

        {/* Delete */}
        <button 
          className="action-btn delete-btn"
          onClick={() => onDelete(index)}
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
}
