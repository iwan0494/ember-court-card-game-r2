#!/usr/bin/env python3
"""Ember Court — deterministic screenshots (1280x800, JPEG < 256 KiB each).
Usage: python3 shots.py [base_url]   (default http://localhost:8901)
Captures ?shot=title|table|win|loss into shots/*.jpg and plays one full
interactive turn in the live game to prove there are no JS errors.
"""
import json
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).parent
SHOTS = ROOT / "shots"
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8901"

def main():
    SHOTS.mkdir(exist_ok=True)
    errors = []
    report = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))

        for shot in ("title", "table", "win", "loss"):
            page.goto(f"{BASE}/?shot={shot}", wait_until="networkidle")
            page.wait_for_timeout(700)
            out = SHOTS / f"{shot}.jpg"
            page.screenshot(path=str(out), type="jpeg", quality=82)
            size = out.stat().st_size
            report[shot] = {"file": f"shots/{shot}.jpg", "bytes": size, "under_256kib": size < 262144}
            print(f"{shot}: {size} bytes, under 256 KiB: {size < 262144}")

        # Interactive smoke test: start a real game, play a card, end turn.
        page.goto(BASE + "/", wait_until="networkidle")
        page.wait_for_timeout(400)
        page.click("#btn-start")
        page.wait_for_timeout(400)
        page.keyboard.press("1")
        page.wait_for_timeout(200)
        page.keyboard.press("Enter")
        page.wait_for_timeout(400)
        page.keyboard.press("e")
        page.wait_for_timeout(600)
        state = page.evaluate(
            "() => ({ phase: document.body.className, "
            "log: document.querySelectorAll('#duel-log li').length, "
            "hand: document.querySelectorAll('#player-hand .card').length })"
        )
        report["smoke_test"] = state
        print("smoke test:", state)
        browser.close()

    report["js_errors"] = errors
    (ROOT / "shots.json").write_text(json.dumps(report, indent=2))
    print("JS errors:", errors if errors else "none")
    if errors:
        sys.exit(1)

if __name__ == "__main__":
    main()
