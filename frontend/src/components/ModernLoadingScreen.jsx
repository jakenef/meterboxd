import React, { useState, useEffect } from "react";

const ModernLoadingScreen = () => {
  const [loadingText, setLoadingText] = useState("Analyzing your movie taste");
  const [progress, setProgress] = useState(0);

  const loadingMessages = [
    "Analyzing your movie taste...",
    "Crunching the numbers...",
    "Comparing with other film buffs...",
    "Calculating your cinema DNA...",
    "Processing your ratings...",
    "Discovering your film patterns...",
    "Generating your movie insights...",
    "Almost ready with your stats..."
  ];

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setLoadingText(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% to avoid reaching 100% before actual completion
        return prev + Math.random() * 15;
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="modern-loading-container">
      <div className="loading-content">
        {/* Animated Logo/Icon */}
        <div className="loading-icon-container">
          <div className="loading-icon">
            <i className="bi bi-film pulse-icon"></i>
          </div>
          <div className="loading-rings">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h3 className="loading-title">Meterboxd</h3>
        <p className="loading-message">{loadingText}</p>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(progress, 90)}%` }}
            ></div>
          </div>
          <div className="progress-text">{Math.floor(Math.min(progress, 90))}%</div>
        </div>

        {/* Fun Facts */}
        <div className="loading-facts">
          <p className="fact-text">
            <i className="bi bi-lightbulb"></i>
            Did you know? The average person watches 5 movies per month!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernLoadingScreen;
