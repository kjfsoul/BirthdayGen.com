#!/bin/zsh
set -euo pipefail

# =======================
# RECURSIVE DOCS-ONLY MODE
# - Processes THIS folder + all subfolders
# - Skips Next.js/Vite/Node standard folders
# =======================

INCLUDE_TIME=0        # 0 => YYYYMMDD, 1 => YYYYMMDD-HHMMSS
SEPARATOR="__"        # date + separator + original name
PAUSE_WHEN_DONE=1     # keeps Terminal window open

SCRIPT_PATH="$0"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"

PYTHON_BIN="$(command -v python3 || true)"
if [[ -z "${PYTHON_BIN}" && -x /usr/bin/python3 ]]; then
  PYTHON_BIN="/usr/bin/python3"
fi

if [[ -z "${PYTHON_BIN}" ]]; then
  echo "ERROR: python3 not found."
  if [[ "$PAUSE_WHEN_DONE" -eq 1 ]]; then
    echo "Press Enter to close..."
    read
  fi
  exit 1
fi

"$PYTHON_BIN" - "$SCRIPT_DIR" "$SCRIPT_PATH" "$INCLUDE_TIME" "$SEPARATOR" <<'PY'
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Only rename the doc formats you care about
TARGET_EXTS = {".txt", ".doc", ".docx", ".pdf", ".rtf", ".md"}

# Skip if already stamped like:
# 20251226__file.ext or 20251226-153012__file.ext
LEADING_DATE_RE = re.compile(r"^\d{8}([-_]\d{6})?__")

# Standard “don’t touch this” folders for Next.js/Vite/Node repos + common build artifacts
EXCLUDE_DIRS = {
    ".git", ".svn", ".hg",
    ".next", ".vercel", ".turbo",
    "node_modules",
    "dist", "build", "out",
    ".vite", ".cache", ".parcel-cache",
    "coverage",
    "__pycache__", ".pytest_cache",
    ".idea", ".vscode",
}

SKIP_HIDDEN_DIRS = True  # ignores dot-folders (except those explicitly excluded already)

def creation_datetime_mac(path: Path) -> datetime:
    st = path.stat()
    birth = getattr(st, "st_birthtime", None)  # macOS creation date
    ts = birth if birth not in (None, 0) else st.st_mtime  # fallback
    return datetime.fromtimestamp(ts)

def unique_path(desired: Path) -> Path:
    if not desired.exists():
        return desired
    parent = desired.parent
    stem = desired.stem
    suffix = desired.suffix
    i = 1
    while True:
        candidate = parent / f"{stem}__{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1

def iter_files_recursive(root: Path):
    for cur_root, dirs, files in os.walk(root):
        # prune directories we don’t want to walk into
        pruned = []
        for d in dirs:
            if d in EXCLUDE_DIRS:
                continue
            if SKIP_HIDDEN_DIRS and d.startswith("."):
                continue
            pruned.append(d)
        dirs[:] = pruned

        cur_path = Path(cur_root)
        for name in files:
            p = cur_path / name
            if p.is_file():
                yield p

def main() -> int:
    script_dir = Path(sys.argv[1]).resolve()
    script_path = Path(sys.argv[2]).resolve()
    include_time = sys.argv[3] == "1"
    separator = sys.argv[4]
    date_fmt = "%Y%m%d-%H%M%S" if include_time else "%Y%m%d"

    scanned = 0
    renamed = 0
    skipped = 0

    for p in iter_files_recursive(script_dir):
        scanned += 1

        # don’t rename this .command file itself
        if p.resolve() == script_path:
            continue

        # only rename the doc formats you asked for
        if p.suffix.lower() not in TARGET_EXTS:
            continue

        # skip if already stamped
        if LEADING_DATE_RE.match(p.name):
            skipped += 1
            continue

        stamp = creation_datetime_mac(p).strftime(date_fmt)
        dest = unique_path(p.with_name(f"{stamp}{separator}{p.name}"))

        os.rename(p, dest)
        print(f"REN: {p}  ->  {dest}")
        renamed += 1

    print(f"\nDone.")
    print(f"Scanned: {scanned}")
    print(f"Renamed: {renamed}")
    print(f"Skipped (already stamped): {skipped}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
PY

if [[ "$PAUSE_WHEN_DONE" -eq 1 ]]; then
  echo ""
  echo "Press Enter to close..."
  read
fi
