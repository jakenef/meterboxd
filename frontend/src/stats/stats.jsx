import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Speedometer from "../speedometer/speedometer";

export default function Stats() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const file = state?.file;
  const fileName = state?.fileName;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setError("No ZIP file provided");
      setLoading(false);
      return;
    }

    const uploadAndGetStats = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("zip", file, fileName);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        //setError("Failed to load stats: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    uploadAndGetStats();
  }, [file, fileName]);

  const renderBackButton = () => (
    <button className="btn btn-secondary mb-4" onClick={() => navigate("/")}>
      Back to Upload
    </button>
  );

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

  function renderObscurityRows(arr) {
    return arr.slice(0, 5).map((movie) => (
      <tr key={movie.title}>
        <td>{movie.title}</td>
        <td>{movie.vote_count_popularity.toFixed(1)}</td>
      </tr>
    ));
  }

  if (loading) {
    return (
      <div className="container text-center">
        <p className="text-light">Loading stats...</p>
        {renderBackButton()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center">
        <p className="text-danger">{error}</p>
        {renderBackButton()}
      </div>
    );
  }

  return (
    <div className="container text-center">
      <div className="row row-cols-1 row-cols-md-2 align-items-center">
        <div className="col">
          <h2 className="mb-4 text-light">Tough Crowd Meter</h2>
          <Speedometer
            min={-100}
            max={100}
            value={55}
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
              <tbody>{stats && stats.overrated ? renderToughCrowdRows(stats.overrated) : null}</tbody>
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
              <tbody>{stats && stats.underrated ? renderToughCrowdRows(stats.underrated) : null}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2">
        <div className="col">
          <h2 className="mt-5 mb-4 text-light">Obscurity Meter</h2>
          <Speedometer
            min={0}
            max={100}
            value={22}
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
              <tbody>{stats && stats.overrated ? renderObscurityRows(stats.mostObscure) : null}</tbody>
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
              <tbody>{stats && stats.underrated ? renderObscurityRows(stats.leastObscure) : null}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
