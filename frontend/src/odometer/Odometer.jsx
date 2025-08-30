import React, { useState, useEffect } from 'react';
import './odometer.css';

const Odometer = ({ value }) => {
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Ensure value is always positive for display
  const absValue = Math.abs(value);
  
  // Split the value into integer and decimal parts
  const integerPart = Math.floor(absValue);
  const decimalPart = absValue - integerPart;
  
  // Get 4 decimal places
  const decimal1 = Math.floor((decimalPart * 10) % 10);
  const decimal2 = Math.floor((decimalPart * 100) % 10);
  const decimal3 = Math.floor((decimalPart * 1000) % 10);
  const decimal4 = Math.floor((decimalPart * 10000) % 10);

  useEffect(() => {
    // Start animation after component mounts with a longer delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const DigitWheel = ({ digit, isDecimal = false, delay = 0 }) => {
    const [currentDigit, setCurrentDigit] = useState(9);
    
    useEffect(() => {
      if (!isAnimating) {
        const timer = setTimeout(() => {
          console.log(`Setting digit to: ${digit}, delay: ${delay}, isDecimal: ${isDecimal}`);
          setCurrentDigit(digit);
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }, [isAnimating, digit, delay]);

    return (
      <div className={`digit-wheel ${isDecimal ? 'decimal' : ''}`}>
        <div className="digit-container">
          <div className="digit-roll-container" 
               style={{ 
                 transform: `translateY(-${currentDigit * 10}%)`,
                 transitionDelay: `${delay}ms`
               }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div key={num} className="digit-roll-item">
                {num}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="odometer-container">
      <div className="odometer-frame">
        <div className="odometer-display">
          <DigitWheel digit={integerPart} delay={0} />
          <div className="decimal-point">.</div>
          <DigitWheel digit={decimal1} isDecimal={true} delay={200} />
          <DigitWheel digit={decimal2} isDecimal={true} delay={400} />
          <DigitWheel digit={decimal3} isDecimal={true} delay={600} />
          <DigitWheel digit={decimal4} isDecimal={true} delay={800} />
        </div>
      </div>
    </div>
  );
};

export default Odometer;
