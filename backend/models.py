from dataclasses import dataclass


@dataclass
class MovieData:
    title: str
    year: int
    public_rating: float
    user_rating: float
    rating_difference: float
    vote_count: float
    normalized_vote_count: float
    popularity: float
    vote_count_popularity: float

    def __str__(self):
        return (
            f"🎬 '{self.title}' ({self.year})\n"
            f"   - User Rating: {self.user_rating:.1f}/5\n"
            f"   - Public Rating: {self.public_rating:.1f}/5\n"
            f"   - Difference: {self.rating_difference:+.1f}\n"
            f"   - Vote Count: {self.vote_count:,} votes\n"
            f"   - Normalized Vote Count: {self.normalized_vote_count:+.1f}\n"
            f"   - Popularity: {self.popularity:+.1f}\n"
            f"   - Vote Count Popularity: {self.vote_count_popularity:+.1f}\n"
        )
