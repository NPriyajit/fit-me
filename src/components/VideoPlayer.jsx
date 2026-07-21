import React from "react";

export default function VideoPlayer({ exercise, onClose }) {
  if (!exercise) return null;

  const { name, videoUrl, searchQuery } = exercise;

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = null;
    try {
      const parsedUrl = new URL(url);
      
      if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else if (parsedUrl.hostname.includes("youtube.com")) {
        if (parsedUrl.pathname.startsWith("/shorts/")) {
          videoId = parsedUrl.pathname.split("/")[2];
        } else {
          videoId = parsedUrl.searchParams.get("v");
        }
      }
    } catch (e) {
      // Fallback regex matching if URL parsing fails
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : null;
  };

  const isImageOrGif = (url) => {
    if (!url) return false;
    return /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(url) || url.includes("giphy.com/media/");
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  const isImg = isImageOrGif(videoUrl);
  
  // Format target search query
  const queryText = searchQuery || `how to do ${name} exercise form`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(queryText)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{name} Reference</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        
        <div className="video-player-body">
          {videoUrl ? (
            <div className="media-container">
              {embedUrl ? (
                <iframe
                  title={`${name} guide`}
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="media-iframe"
                />
              ) : isImg ? (
                <img src={videoUrl} alt={`${name} guide`} className="media-img" />
              ) : (
                <div className="unsupported-link">
                  <p>Custom reference link provided:</p>
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="external-link-btn">
                    Open Custom Link
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: "6px"}}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="no-video-placeholder">
              <div className="placeholder-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <h4>No reference video loaded</h4>
              <p>Search standard form guides on YouTube or add your own video link via the edit button.</p>
            </div>
          )}

          <div className="search-assistance">
            <p className="search-tip">Want to see professional trainers perform this?</p>
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="search-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              Search "{queryText}" on YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
