from backend.csvReader import load_ratings_csv

def getStats(file):
    csv_data = load_ratings_csv(file)
    return csv_data