import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <div className="body bg-dark text-light">
        <header className="bg-primary text-white py-3">
            <div className="container">
                <h1 className="mb-0">Meterboxd</h1>
                <p className="mb-0">Metrics for your Letterboxd data.</p>
            </div>
        </header>
        App will display here
        <main></main>
        <footer className="bg-secondary text-white py-3 mt-auto">
            <div className="container text-center">
                <small>&copy; 2023 Meterboxd. All rights reserved.</small>
            </div>
        </footer>
    </div>
  );
}