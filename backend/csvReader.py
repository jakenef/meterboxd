import pandas as pd

def load_ratings_csv(file):
    ratings = pd.read_csv(file)
    ratings.columns = ratings.columns.str.strip()
    return ratings