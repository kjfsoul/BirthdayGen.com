#!/bin/zsh
set -euo pipefail

INCLUDE_TIME=0
RECURSIVE=0
SEPARATOR="__"
PAUSE_WHEN_DONE=1

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

"$PYTHON_BIN" - "$SCRIPT_DIR" "$SCRIPT_PATH" "$INCLUDE_TIME" "$RECURSIVE" "$SEPARATOR" <<'PY'
import os
import re
import sys
from datetime import datetime
from pathlib import Path

TARGET_EXTS = {".txt", ".doc", ".docx", ".pdf", ".rtf", ".md"}
LEADING_DATE_RE = re.compile(r"^\d{8}([-_]\d{6})?__")

def creation_datetime_mac(path: Path) -> datetime:
    st = path.stat()
    birth = getattr(st, "st_birthtime", None)
    ts = birth if birth not in (None, 0) else st.st_mtime
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

def iter_files(folder: Path, recursive: bool):
    if recursive:
        for p in folder.rglob("*"):
            if p.is_file():
                yield p
    else:
        for p in folder.iterdir():
            if p.is_file():
                yield p

def main() -> int:
    script_dir = Path(sys.argv[1]).resolve()
    script_path = Path(sys.argv[2]).resolve()
    include_time = sys.argv[3] == "1"
    recursive = sys.argv[4] == "1"
    separator = sys.argv[5]
    date_fmt = "%Y%m%d-%H%M%S" if include_time else "%Y%m%d"

    changed = 0
    for p in iter_files(script_dir, recursive):
        if p.resolve() == script_path:
            continue
        if p.suffix.lower() not in TARGET_EXTS:
            continue
        if LEADING_DATE_RE.match(p.name):
            continue

        stamp = creation_datetime_mac(p).strftime(date_fmt)
        dest = unique_path(p.with_name(f"{stamp}{separator}{p.name}"))
        os.rename(p, dest)
        print(f"REN: {p.name}  ->  {dest.name}")
        changed += 1

    print(f"\nDone. Renamed {changed} file(s).")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
PY

if [[ "$PAUSE_WHEN_DONE" -eq 1 ]]; then
  echo ""
  echo "Press Enter to close..."
  read
fi
