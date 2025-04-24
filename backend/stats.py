from backend.csvReader import load_ratings_csv
from dataclasses import dataclass
@dataclass
class MovieData:
    title: str
    year: int
    publicRating: float
    userRating: float
    popularityScore: float

def getStats(file):
    csv_data = load_ratings_csv(file)

    return csv_data

def getRatingData(csv_data):
    maxDifMovie = None
    minDifMovie = None
    for entry in csv_data:
        publicMovieRating = getPublicMovieData(entry)
        difference = publicMovieRating - entry['rating']
        if (difference > maxDif):
            maxDif = dif


