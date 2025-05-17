import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./app.css";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Upload from "./upload/upload.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100 body bg-dark text-light">
        <header className="bg-primary text-white py-3">
          <div className="container">
            <h1 className="mb-0">Meterboxd</h1>
            <p className="mb-0">Metrics for your Letterboxd data.</p>
          </div>
        </header>
        <main
          className="flex-grow-1 d-flex justify-content-center align-items-center bg-dark text-light"
          style={{ minHeight: 0 }}
        >
          <Routes>
            <Route path="/" element={<Upload />} exact />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="bg-secondary text-white py-3 mt-auto">
          <div className="container text-center">
            <small>&copy; 2025 Meterboxd. All rights reserved.</small>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}
