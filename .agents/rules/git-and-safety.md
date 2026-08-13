# Git & Safety Rules

- Git operations are strictly read-only.
- Do not create/switch branches, stage, commit, push, merge, reset, clean, checkout, restore, or discard.
- Source files may only be edited after explicit implementation authorization; Git history and index remain untouched.
- Preserve unrelated working-tree changes.
- Do not change API business-route prefixes: `/api/...`, `/auth/...`, and `/health` remain authoritative.
- Browser automation is authorized ONLY for audit tasks, ONLY via the in-app/GUI browser preview tool
  (not Playwright, not headless CLI scripts, not shelling out to a browser driver). All other tasks stay
  under "no browser automation."
- Any server started for verification must be stopped and its ports checked afterward.
- Do not apply permission backfills to a production database without separate explicit authorization.
