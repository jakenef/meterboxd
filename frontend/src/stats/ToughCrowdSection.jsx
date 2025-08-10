import React from "react";
import Odometer from "../odometer/Odometer";
import FlickerText from "../components/FlickerText";

export default function ToughCrowdSection({ stats }) {
  function renderToughCrowdRows(arr) {
    return arr.slice(0, 5).map((movie) => (
      <tr key={movie.title}>
        <td>{movie.title}</td>
        <td>{movie.public_rating.toFixed(1)}</td>
        <td>{movie.user_rating.toFixed(1)}</td>
        <td>{movie.rating_difference.toFixed(1)}</td>
      </tr>
    ));
  }

  const ratingDifference = stats?.rating_stats?.average_rating_difference || 0;
  const isMoreStars = ratingDifference > 0;
  const moreOrLess = isMoreStars ? "more" : "less";
  
  console.log("Rating difference:", ratingDifference, "Is more stars:", isMoreStars, "Text should be:", moreOrLess);

  return (
    <div className="d-flex flex-column align-items-center">
      {/* Main Focus Section */}
      <div className="mb-5" style={{ maxWidth: '800px', width: '100%' }}>
        <h2 className="mb-4 text-light text-center">Tough Crowd Meter</h2>
        
        {/* Main Statement - Left Aligned */}
        <div className="mb-4">
          <h3 className="text-light" style={{ fontSize: '1.8rem', lineHeight: '1.4', textAlign: 'left', marginBottom: '5px' }}>
            On average, you give movies
          </h3>
          
          {/* Odometer and More/Less Statement - Side by Side */}
          <div className="d-flex align-items-center gap-4" style={{ justifyContent: 'flex-start' }}>
            <Odometer value={ratingDifference} />
            <div className="d-flex flex-column" style={{ textAlign: 'left' }}>
              <h3 style={{ 
                    fontSize: '3.2rem', 
                    fontWeight: 'bold', 
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)', 
                    margin: 0
                  }}>
                <FlickerText finalText={moreOrLess} isMoreStars={isMoreStars} />
                <span className="text-white"> STARS</span>
              </h3>
              <h4 className="text-white" 
                  style={{ 
                    fontSize: '1.6rem', 
                    fontWeight: 'normal', 
                    margin: 0,
                    marginTop: '8px'
                  }}>
                than other users
              </h4>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-100 mb-5">
        <h4 className="text-light text-center mb-3">Most Overrated Movies:</h4>
        <div className="table-responsive">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>
                  <i>Movie</i>
                </th>
                <th>
                  <i>Avg. Rating</i>
                </th>
                <th>
                  <i>Your Rating</i>
                </th>
                <th>
                  <i>Difference</i>
                </th>
              </tr>
            </thead>
            <tbody>{stats && stats.rating_stats ? renderToughCrowdRows(stats.rating_stats.overrated_movies) : null}</tbody>
          </table>
        </div>
      </div>
      
      <div className="w-100">
        <h4 className="text-light text-center mb-3">Most Underrated Movies:</h4>
        <div className="table-responsive">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>
                  <i>Movie</i>
                </th>
                <th>
                  <i>Avg. Rating</i>
                </th>
                <th>
                  <i>Your Rating</i>
                </th>
                <th>
                  <i>Difference</i>
                </th>
              </tr>
            </thead>
            <tbody>{stats && stats.rating_stats ? renderToughCrowdRows(stats.rating_stats.underrated_movies) : null}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
