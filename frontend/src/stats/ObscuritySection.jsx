import React from "react";
import Speedometer from "../speedometer/Speedometer.jsx";

export default function ObscuritySection({ stats }) {
  function renderObscurityRows(arr) {
    return arr.slice(0, 5).map((movie) => (
      <tr key={movie.title}>
        <td>{movie.title}</td>
        <td>{movie.vote_count_popularity.toFixed(1)}</td>
      </tr>
    ));
  }

  return (
    <div className="row row-cols-1 row-cols-md-2">
      <div className="col">
        <h2 className="mt-5 mb-4 text-light">Obscurity Meter</h2>
        <Speedometer
          min={-1000}
          max={1000}
          value={stats.obscurity_stats.obscurity_score}
          endColor="#01e154"
          startColor="#444"
        />
      </div>
      <div className="col">
        <h4 className="text-light">Most Obscure Movies:</h4>
        <div className="table-responsive">
          <table className="table table-dark table-striped mb-5">
            <thead>
              <tr>
                <th>
                  <i>Movie</i>
                </th>
                <th>
                  <i>Popularity Score</i>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats && stats.obscurity_stats
                ? renderObscurityRows(stats.obscurity_stats.most_obscure_movies)
                : null}
            </tbody>
          </table>
        </div>
        <h4 className="text-light">Least Obscure Movies:</h4>
        <div className="table-responsive">
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>
                  <i>Movie</i>
                </th>
                <th>
                  <i>Popularity Score</i>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats && stats.obscurity_stats
                ? renderObscurityRows(
                    stats.obscurity_stats.least_obscure_movies
                  )
                : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
