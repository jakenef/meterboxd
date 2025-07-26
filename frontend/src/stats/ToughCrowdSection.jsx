import React from "react";
import Speedometer from "../speedometer/Speedometer";

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

  return (
    <div className="row row-cols-1 row-cols-md-2 align-items-center">
      <div className="col">
        <h2 className="mb-4 text-light">Tough Crowd Meter</h2>
        <Speedometer
          min={-1}
          max={1}
          value={stats.rating_stats.average_rating_difference}
          startColor="#FFFF5F"
          endColor="#FF3A36"
        />
      </div>
      <div className="col">
        <h4 className="text-light">Most Overrated Movies:</h4>
        <div className="table-responsive">
          <table className="table table-dark table-striped mb-5">
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
        <h4 className="text-light">Most Underrated Movies:</h4>
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
