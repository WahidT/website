#!/usr/bin/env python3
"""Write data/regulations-data.js from data/regulations.json.

The map page loads its dataset as a plain script (window.REGULATIONS_DATA) so it works from
file:// and from any static host without a fetch. That file used to be maintained by hand
beside the JSON, so the two could drift. This script makes the JSON the only source: edit
regulations.json, run `python3 build_data.py`, commit both.

    python3 build_data.py            rewrite data/regulations-data.js
    python3 build_data.py --check    exit 1 if the JS file is stale (no write)
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "data" / "regulations.json"
OUT = ROOT / "data" / "regulations-data.js"


def render(doc):
    # separators and ensure_ascii match the file as it was hand-written, so a regeneration
    # of unchanged data is a no-op diff.
    return "window.REGULATIONS_DATA = " + json.dumps(doc, ensure_ascii=True, separators=(", ", ": ")) + ";\n"


def main(argv):
    doc = json.loads(SRC.read_text(encoding="utf-8"))
    regs = doc["regulations"]
    summary = f"{len(regs)} regulations, {len({r['iso'] for r in regs})} countries, {len({r['sector'] for r in regs})} sectors"
    new = render(doc)
    if "--check" in argv:
        old = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if old == new:
            print(f"up to date: {OUT.name} ({summary})")
            return 0
        print(f"STALE: {OUT.name} differs from {SRC.name}; run python3 build_data.py")
        return 1
    OUT.write_text(new, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({summary})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
