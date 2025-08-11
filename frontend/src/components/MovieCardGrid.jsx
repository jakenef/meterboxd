import React from "react";

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const getDifferenceColor = (difference) => {
    if (difference > 0) return "#28a745"; // Green from main.scss
    if (difference < 0) return "#fd7e14"; // Orange from main.scss
    return "#6c757d"; // Gray for zero
  };

  const formatRating = (rating) => {
    return typeof rating === 'number' ? rating.toFixed(1) : '—';
  };

  const formatDifference = (difference) => {
    if (typeof difference !== 'number') return '—';
    const sign = difference > 0 ? '+' : '';
    return `${sign}${difference.toFixed(1)}`;
  };

  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={`${movie.title} poster`}
            className="movie-poster"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="movie-poster-placeholder" style={{ display: movie.poster_url ? 'none' : 'flex' }}>
          <i className="bi bi-film"></i>
        </div>
      </div>
      
      <div className="movie-info">
        <h6 className="movie-title" title={movie.title}>
          {movie.title}
        </h6>
        
        <div className="movie-ratings">
          <div className="rating-item">
            <span className="rating-label">Avg Rating</span>
            <span className="rating-value">{formatRating(movie.public_rating)}</span>
          </div>
          
          <div className="rating-item">
            <span className="rating-label">Your Rating</span>
            <span className="rating-value">{formatRating(movie.user_rating)}</span>
          </div>
          
          <div className="rating-item">
            <span className="rating-label">Difference</span>
            <span 
              className="rating-value difference"
              style={{ color: getDifferenceColor(movie.rating_difference) }}
            >
              {formatDifference(movie.rating_difference)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieCardGrid = ({ movies, title }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="movie-grid-container">
        <h4 className="text-light mb-3">{title}</h4>
        <div className="text-center text-muted">
          <p>No movies to display</p>
        </div>
      </div>
    );
  }

  // Group movies into rows based on screen size for centering logic
  const movieSlice = movies.slice(0, 8);

  return (
    <div className="movie-grid-container">
      <h4 className="text-light mb-3">{title}</h4>
      <div className="movie-grid-wrapper">
        <div className="movie-grid">
          {movieSlice.map((movie, index) => (
            <MovieCard key={`${movie.title}-${movie.year || index}`} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCardGrid;
