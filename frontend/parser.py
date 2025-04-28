import sys
import os
import traceback
from rich.traceback import install

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.stats import getObscurityData, getRatingData
install()

def main():
    if len(sys.argv) != 2:
        print("Usage: python parser.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    print("Obscurity data: ", getObscurityData(file_path))
    print("Rating data: ", getRatingData(file_path))

if __name__ == "__main__":
    main()