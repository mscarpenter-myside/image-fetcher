import shutil
import os

source = os.path.join(os.path.dirname(__file__), "..", "logo.png")
dest = os.path.join(os.path.dirname(__file__), "logo.png")

if os.path.exists(source):
    shutil.copy(source, dest)
    print(f"Copied {source} to {dest}")
else:
    print(f"Source {source} not found")
