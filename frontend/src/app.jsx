import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./app.css";
import './main.scss';
import {Routes, Route, NavLink, useLocation } from "react-router-dom";
import Upload from "./upload/Upload.jsx";
import Stats from "./stats/Stats.jsx";

export default function App() {
  const location = useLocation();

  return (
      <div className="d-flex flex-column min-vh-100 body text-light">
        <header className="custom-dark text-light py-3" style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1030,
          height: "var(--header-height)"
        }}>
          <div className="container d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img
                src="/meterBoxdv3Transparent.png"
                alt="Meterboxd Logo"
                style={{ height: "64px", width: "64px", marginRight: "16px" }}
              />
              <div>
                <h1 className="mb-0">Meterboxd</h1>
                <p className="mb-0">Metrics for your Letterboxd data.</p>
              </div>
            </div>
            {location.pathname === "/stats" && (
              <NavLink
                to="/"
                className="modern-upload-btn back-button-nav"
                style={{ marginLeft: "16px", cursor: "pointer", textDecoration: "none" }}
              >
                <i className="upload-icon bi bi-arrow-left"></i>
                &larr; Back to Upload
              </NavLink>
            )}
          </div>
        </header>
        <main
          className="flex-grow-1 d-flex justify-content-center align-items-center bg-dark text-light"
          style={{ minHeight: 0, paddingTop: "var(--header-height)" }}
        >
          <Routes>
            <Route path="/" element={<Upload />} exact />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="bg-dark text-secondary py-3 mt-auto">
          <div className="container text-center">
            <small>Built by Jake Nef</small> <a href="https://github.com/jakenef/meterboxd" target="_blank" rel="noopener noreferrer" className="github-link">Github</a>
          </div>
        </footer>
      </div>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
