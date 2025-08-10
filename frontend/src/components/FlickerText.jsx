import React, { useState, useEffect } from 'react';

const FlickerText = ({ finalText, isMoreStars }) => {
  const [flickerText, setFlickerText] = useState("MORE");
  const [isFlickering, setIsFlickering] = useState(true);
  const [flickerSpeed, setFlickerSpeed] = useState(100);

  useEffect(() => {
    if (!isFlickering) return;

    let flickerInterval;
    let speedIncreaseInterval;
    
    // Start with fast flickering
    const startFlickering = () => {
      flickerInterval = setInterval(() => {
        setFlickerText(prev => prev === "MORE" ? "LESS" : "MORE");
      }, flickerSpeed);
    };

    startFlickering();

    // Gradually slow down the flicker speed
    speedIncreaseInterval = setInterval(() => {
      setFlickerSpeed(prevSpeed => {
        const newSpeed = prevSpeed + 10; // Increase interval by 10ms each step (slower progression)
        
        // Clear and restart interval with new speed
        clearInterval(flickerInterval);
        flickerInterval = setInterval(() => {
          setFlickerText(prev => prev === "MORE" ? "LESS" : "MORE");
        }, newSpeed);
        
        return newSpeed;
      });
    }, 300); // Update speed every 300ms (less frequent changes)

    // Stop flickering after 3 seconds, but ensure it lands on the correct final text
    const stopFlicker = setTimeout(() => {
      clearInterval(flickerInterval);
      clearInterval(speedIncreaseInterval);
      setIsFlickering(false);
      setFlickerText(finalText.toUpperCase()); // Force the correct final value
    }, 3000);

    return () => {
      clearInterval(flickerInterval);
      clearInterval(speedIncreaseInterval);
      clearTimeout(stopFlicker);
    };
  }, [finalText]); // Remove flickerSpeed from dependency array

  const getColor = () => {
    if (isFlickering) {
      // During flickering, color based on current flicker text
      return flickerText === "MORE" ? '#28a745' : '#fd7e14';
    }
    // After settling, color based on actual final result
    return isMoreStars ? '#28a745' : '#fd7e14';
  };

  const getCurrentText = () => {
    if (isFlickering) {
      return flickerText;
    }
    return finalText.toUpperCase();
  };

  return (
    <span style={{ 
      color: getColor(),
      transition: isFlickering ? 'none' : 'color 0.5s ease'
    }}>
      {getCurrentText()}
    </span>
  );
};

export default FlickerText;
