# Wishtaa Sheets - project rules

## Product
A workflow MAP over real Google Sheets. Each sheet is a node; an arrow means
"output of this sheet feeds the input of that sheet". Built for accounting
reconciliation pipelines (MBCPL: Tally vs Farvision).
- All calculations, Apps Scripts and data stay inside the Google Sheets themselves.
- The site only shows which sheet connects to which, and opens the real sheets.
- NO server-side run engine, NO Sheets API, no script detection or running.
  Scripts run by themselves in Google through their own triggers.
- Status chips and the "Has Apps Script" tag are set by hand.
- The workflow map is saved as a file in the user's own Google Drive (not in Supabase).

## Rules
- Separate app. Do not touch, import or copy code from the Wishtaa Maps repo.
- Plan first: write a plan, WAIT for "approved", then build one step at a time.
- After each step: TypeScript check, screenshot, localhost link (http://localhost:3100), PDF report. Stop.
- Push only after the user approves a step: commit with a clear message, push to main as DawaiiX.
  Never force-push. Never commit .env files or secrets. If a push fails, stop and report.
- Supabase tables are prefixed `sheets_`. Anon key only. Supabase stores identity,
  display name, preferences and the linked Google address/status; never Google tokens or workflows.
- Google access tokens (drive.file scope only) live in memory only; never localStorage or Supabase.
- The Google OAuth client secret goes only in the Supabase dashboard, never in code, .env or the repo.
- Before P2-1: remind the user to choose a custom SMTP provider for Supabase emails.

## Roadmap
P1-2 sample flow, P1-3a node side panel, P1-3b link panel + IMPORTRANGE, P1-5 workflow file
(local save/load), P2-1 accounts, P2-2 Google Drive connection, P2-3 Picker + Add/Open sheet,
P2-4 workflow file in Drive (autosave, "changed elsewhere" warning, never overwrite silently).
Sheet view stays a placeholder for now; later a list of sheets (name, status, Apps Script tag, Open).
