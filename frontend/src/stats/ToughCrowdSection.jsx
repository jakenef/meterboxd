import React, { useEffect, useState, useMemo } from "react";
import Odometer from "../odometer/Odometer";
import FlickerText from "../components/FlickerText";
import MovieCardGrid from "../components/MovieCardGrid";
import { getUserTagline } from "../utils/userTaglines";

export default function ToughCrowdSection({ stats }) {
  const [showTagline, setShowTagline] = useState(false);

  const ratingDifference = stats?.rating_stats?.average_rating_difference || 0;
  const isMoreStars = ratingDifference > 0;
  const moreOrLess = isMoreStars ? "more" : "less";

  // Memoize the Odometer to prevent re-rendering when tagline state changes
  const memoizedOdometer = useMemo(() => (
    <Odometer value={ratingDifference} />
  ), [ratingDifference]);
  useEffect(() => {
    // Initialize all tooltips on the page
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipList = [...tooltipTriggerList].map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );

    // Cleanup tooltips on component unmount
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, []);

  useEffect(() => {
    // Show tagline after odometer animation completes (longer delay to ensure all animations finish)
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 3500); // Increased from 2300ms to 3500ms

    return () => clearTimeout(taglineTimer);
  }, []);

  console.log(
    "Rating difference:",
    ratingDifference,
    "Is more stars:",
    isMoreStars,
    "Text should be:",
    moreOrLess
  );

  return (
    <div className="d-flex flex-column align-items-center tough-crowd-mobile">
      {/* Main Focus Section */}
      <div className="mb-5" style={{ maxWidth: "800px", width: "100%" }}>
        {/* Main Statement - Left Aligned */}
        <div className="mb-4">
          <h3
            className="text-light tough-crowd-intro"
            style={{
              fontSize: "1.8rem",
              lineHeight: "1.4",
              textAlign: "left",
              marginBottom: "5px",
            }}
          >
            On average, you give movies
          </h3>

          {/* Odometer and More/Less Statement - Side by Side */}
          <div
            className="d-flex align-items-center gap-4 tough-crowd-content"
            style={{ justifyContent: "flex-start" }}
          >
            {memoizedOdometer}
            <div
              className="d-flex flex-column tough-crowd-text"
              style={{ textAlign: "left" }}
            >
              <h3
                className="tough-crowd-main-text"
                style={{
                  fontSize: "3.2rem",
                  fontWeight: "bold",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  margin: 0,
                }}
              >
                <FlickerText finalText={moreOrLess} isMoreStars={isMoreStars} />
                <span
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  data-bs-title="out of five"
                  className="text-white"
                >
                  {" "}
                  STARS
                </span>
              </h3>
              <h4
                className="text-white tough-crowd-sub-text"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "normal",
                  margin: 0,
                  marginTop: "8px",
                }}
              >
                than other users
              </h4>
            </div>
          </div>
        </div>
        
        {/* Tagline centered below the entire odometer/text section - always takes space */}
        <div className="text-center" style={{ marginTop: "24px", minHeight: "32px" }}>
          <p
            className="user-tagline"
            style={{
              fontSize: "1.1rem",
              fontStyle: "italic",
              color: "#40baf4",
              margin: 0,
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              opacity: showTagline ? 1 : 0,
              transition: "opacity 0.8s ease-out",
              visibility: showTagline ? "visible" : "hidden"
            }}
          >
            {getUserTagline(ratingDifference)}
          </p>
        </div>
      </div>

      <MovieCardGrid 
        movies={stats?.rating_stats?.overrated_movies} 
        title="Most Overrated Movies:" 
      />

      <MovieCardGrid 
        movies={stats?.rating_stats?.underrated_movies} 
        title="Most Underrated Movies:" 
      />
    </div>
  );
}
