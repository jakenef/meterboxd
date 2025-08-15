/**
 * Helper function to determine a user's tagline based on their rating behavior
 * @param {number} averageDiff - The user's average rating difference versus the public rating
 * @returns {string} A fun tagline describing the user's critic style
 */
export const getUserTagline = (averageDiff) => {
  if (averageDiff <= -1.0) {
    return "perfectionist alert!";
  } else if (averageDiff < -0.2) {
    return "wow! tough critic!";
  } else if (Math.abs(averageDiff) <= 0.2) {
    return "almost spot-on with the rest of us!";
  } else if (averageDiff < 1.0) {
    return "generosity level: high";
  } else {
    return "Your favorite movie was whatever you saw last, wasn't it?";
  }
};
