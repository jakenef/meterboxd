import pandas as pd

def load_ratings_csv(path: str) -> pd.DataFrame:
    ratings = pd.read_csv(path)
    ratings.columns = ratings.columns.str.strip()
    return ratings

def getStats(file_path: str) -> pd.DataFrame:
    csv_data = load_ratings_csv(file_path)
    return csv_data