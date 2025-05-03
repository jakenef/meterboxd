import sys
import os
from rich.traceback import install

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.stats import get_obscurity_data, get_rating_data
from rich.console import Console
from rich.table import Table
install()

def main():
    if len(sys.argv) != 2:
        print("Usage: python parser.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    average_popularity_score, least_obscure_movie, most_obscure_movie = get_obscurity_data(file_path)
    average_rating_difference, most_underrated_movie, most_overrated_movie = get_rating_data(file_path)

    console = Console()
    table = Table(title="Movie Statistics")

    table.add_column("Metric", style="bold cyan")
    table.add_column("Value", style="bold green")

    table.add_row("Average Popularity Score", str(average_popularity_score))
    table.add_row("Least Obscure Movie", str(least_obscure_movie))
    table.add_row("Most Obscure Movie", str(most_obscure_movie))
    table.add_row("Average Rating Difference", str(average_rating_difference))
    table.add_row("Most Underrated Movie", str(most_underrated_movie))
    table.add_row("Most Overrated Movie", str(most_overrated_movie))

    console.print(table)

if __name__ == "__main__":
    main()