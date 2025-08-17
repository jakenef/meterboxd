import React, { useState, useRef, useEffect } from 'react';

const ShareableImage = ({ stats }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Generate image preview using Canvas
  const generateCanvasPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !stats) return;

    const ctx = canvas.getContext('2d');
    // Much taller for modern phone screens (9:16 aspect ratio like Instagram stories)
    const width = 500;
    const height = 888; // 9:16 ratio
    
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1f252c');
    gradient.addColorStop(0.5, '#14191d');
    gradient.addColorStop(1, '#0f1419');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle texture overlay
    ctx.fillStyle = 'rgba(64, 186, 244, 0.05)';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Get rating data
    const avgRatingDiff = stats?.rating_stats?.average_rating_difference || 0;
    const isMoreStars = avgRatingDiff > 0;
    const moreOrLess = isMoreStars ? "more" : "less";
    const ratingColor = isMoreStars ? '#28a745' : '#fd7e14';

    // Header with branding (fixed spelling)
    ctx.fillStyle = '#40baf4';
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(64, 186, 244, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText('Meterboxd', width / 2, 80);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Main text (moved down more for better spacing)
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('On average, you give movies', width / 2, 160);

    // Rating number with glow effect (bigger and more prominent)
    ctx.shadowColor = ratingColor;
    ctx.shadowBlur = 25;
    ctx.fillStyle = ratingColor;
    ctx.font = 'bold 120px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(Math.abs(avgRatingDiff).toFixed(1), width / 2, 280);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // More/Less stars text (bigger)
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${moreOrLess.toUpperCase()} STARS`, width / 2, 340);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('than other users', width / 2, 380);

    // Tagline without quotes
    ctx.fillStyle = '#40baf4';
    ctx.font = 'italic 24px -apple-system, BlinkMacSystemFont, sans-serif';
    const tagline = getUserTagline(avgRatingDiff);
    ctx.fillText(tagline, width / 2, 450);

    // Movie cards preview section (more space)
    const overratedMovies = stats?.rating_stats?.overrated_movies || [];
    const underratedMovies = stats?.rating_stats?.underrated_movies || [];
    
    let movieY = 530;
    
    // Section title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Your Most Extreme Ratings:', width / 2, movieY);
    movieY += 60;
    
    // Draw movie cards side by side (bigger cards)
    if (overratedMovies.length > 0 && underratedMovies.length > 0) {
      drawMovieCard(ctx, overratedMovies[0], width / 2 - 110, movieY, 'overrated');
      drawMovieCard(ctx, underratedMovies[0], width / 2 + 110, movieY, 'underrated');
    } else if (overratedMovies.length > 0) {
      drawMovieCard(ctx, overratedMovies[0], width / 2, movieY, 'overrated');
    } else if (underratedMovies.length > 0) {
      drawMovieCard(ctx, underratedMovies[0], width / 2, movieY, 'underrated');
    }
    
    // Footer with subtle styling (more space at bottom)
    ctx.fillStyle = '#6c757d';
    ctx.font = '20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('Share your movie stats at', width / 2, height - 60);
    
    ctx.fillStyle = '#40baf4';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('meterboxd.com', width / 2, height - 30);
  };

  const drawMovieCard = (ctx, movie, x, y, type) => {
    // Card background with gradient (bigger for higher resolution and taller for longer titles)
    const cardWidth = 200;
    const cardHeight = 180; // Increased height to accommodate longer titles
    
    // Create gradient for card background
    const cardGradient = ctx.createLinearGradient(x - cardWidth/2, y, x + cardWidth/2, y + cardHeight);
    cardGradient.addColorStop(0, 'rgba(44, 62, 80, 0.9)');
    cardGradient.addColorStop(1, 'rgba(52, 73, 94, 0.7)');
    ctx.fillStyle = cardGradient;
    
    // Draw rounded rectangle background
    const radius = 12;
    ctx.beginPath();
    ctx.moveTo(x - cardWidth/2 + radius, y);
    ctx.lineTo(x + cardWidth/2 - radius, y);
    ctx.quadraticCurveTo(x + cardWidth/2, y, x + cardWidth/2, y + radius);
    ctx.lineTo(x + cardWidth/2, y + cardHeight - radius);
    ctx.quadraticCurveTo(x + cardWidth/2, y + cardHeight, x + cardWidth/2 - radius, y + cardHeight);
    ctx.lineTo(x - cardWidth/2 + radius, y + cardHeight);
    ctx.quadraticCurveTo(x - cardWidth/2, y + cardHeight, x - cardWidth/2, y + cardHeight - radius);
    ctx.lineTo(x - cardWidth/2, y + radius);
    ctx.quadraticCurveTo(x - cardWidth/2, y, x - cardWidth/2 + radius, y);
    ctx.closePath();
    ctx.fill();

    // Add border
    ctx.strokeStyle = 'rgba(64, 186, 244, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Movie title with text wrapping
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    
    // Function to wrap text
    const wrapText = (text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Determine font size based on title length - longer titles get smaller font
    let fontSize = 16;
    if (movie.title.length <= 20) {
      fontSize = 20; // Larger font for short titles
    } else if (movie.title.length <= 35) {
      fontSize = 18; // Medium font for medium titles
    } else {
      fontSize = 16; // Smaller font for long titles
    }
    
    ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;

    // Wrap the movie title to fit within the card
    const titleLines = wrapText(movie.title, cardWidth - 20); // 20px padding
    const lineHeight = fontSize + 2; // Adjust line height based on font size
    
    // Calculate total title height
    const totalTitleHeight = titleLines.length * lineHeight;
    
    // Center the title in the top third of the card, with better spacing
    const topSectionHeight = cardHeight / 3;
    const titleStartY = y + (topSectionHeight - totalTitleHeight) / 2 + lineHeight;

    // If title is too long (more than 3 lines), truncate it
    const maxLines = 3;
    const displayLines = titleLines.slice(0, maxLines);
    if (titleLines.length > maxLines) {
      // Truncate the last line and add ellipsis
      const lastLine = displayLines[maxLines - 1];
      const ellipsis = '...';
      let truncatedLine = lastLine;
      
      while (ctx.measureText(truncatedLine + ellipsis).width > cardWidth - 20 && truncatedLine.length > 0) {
        truncatedLine = truncatedLine.slice(0, -1);
      }
      displayLines[maxLines - 1] = truncatedLine + ellipsis;
    }

    // Draw each line of the title
    displayLines.forEach((line, index) => {
      ctx.fillText(line, x, titleStartY + (index * lineHeight));
    });

    // Fixed positions for consistent layout with better spacing
    const ratingY = y + cardHeight/2 + 10; // Slightly lower in middle section
    const labelY = y + cardHeight - 45; // Near bottom
    const detailsY = y + cardHeight - 20; // Bottom

    // Rating difference with glow (bigger)
    const diff = movie.rating_difference || 0;
    const diffColor = diff > 0 ? '#28a745' : '#fd7e14';
    ctx.shadowColor = diffColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = diffColor;
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${diff > 0 ? '+' : ''}${diff.toFixed(1)}★`, x, ratingY);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Type label (bigger)
    ctx.fillStyle = '#adb5bd';
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif';
    const label = type === 'overrated' ? 'You rated lower' : 'You rated higher';
    ctx.fillText(label, x, labelY);

    // Your rating vs avg (bigger)
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px -apple-system, BlinkMacSystemFont, sans-serif';
    const userRating = (movie.user_rating || 0).toFixed(1);
    const avgRating = (movie.public_rating || 0).toFixed(1);
    ctx.fillText(`You: ${userRating}★ | Avg: ${avgRating}★`, x, detailsY);
  };

  const getUserTagline = (averageDiff) => {
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

  const generateImage = () => {
    // No need to generate from backend, we'll use the canvas preview
    setIsGenerating(true);
    setError(null);

    // Small delay to show the loading state
    setTimeout(() => {
      setIsGenerating(false);
      // Create a blob URL from the canvas for download
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        }, 'image/png', 1.0);
      }
    }, 500);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Create a much higher resolution version for download (4x resolution for crisp mobile display)
      const downloadCanvas = document.createElement('canvas');
      const downloadCtx = downloadCanvas.getContext('2d');
      
      // Scale up for much better quality (4x resolution = 2000x3552 final image)
      const scale = 4;
      downloadCanvas.width = canvas.width * scale;
      downloadCanvas.height = canvas.height * scale;
      
      // Enable high-quality image rendering
      downloadCtx.imageSmoothingEnabled = true;
      downloadCtx.imageSmoothingQuality = 'high';
      
      // Scale the context and redraw at much higher resolution
      downloadCtx.scale(scale, scale);
      downloadCtx.drawImage(canvas, 0, 0);
      
      // Download the high-res image
      downloadCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meterboxd-stats.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png', 1.0);
    }
  };

  useEffect(() => {
    if (stats) {
      generateCanvasPreview();
    }
  }, [stats]);

  if (!stats) {
    return null;
  }

  return (
    <div className="shareable-image-container mt-5 mb-5">
      <div className="row align-items-center">
        {/* Preview Section */}
        <div className="col-md-6 text-center">
          <h4 className="text-light mb-3">Share Your Results</h4>
          <div className="preview-container">
            <canvas
              ref={canvasRef}
              className="image-preview"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '2px solid #40baf4',
                borderRadius: '12px',
                backgroundColor: '#14191d'
              }}
            />
          </div>
        </div>

        {/* Download Section */}
        <div className="col-md-6 text-center">
          <div className="download-section">
            <h5 className="text-light mb-3">Perfect for sharing!</h5>
            <p className="text-light mb-4">
              Download this preview as a high-quality PNG, perfect for Instagram stories or social media.
            </p>
            
            <button
              className="modern-upload-btn"
              onClick={downloadImage}
              style={{ 
                width: '200px',
              }}
            >
              <i className="upload-icon bi bi-download"></i>
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareableImage;
