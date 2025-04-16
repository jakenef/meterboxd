import sys
import os

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.stats import getStats

def main():
    if len(sys.argv) != 2:
        print("Usage: python parser.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        with open(file_path, 'r') as file:
            # Pass the file to the getStats function
            result = getStats(file)
            print(result)
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()