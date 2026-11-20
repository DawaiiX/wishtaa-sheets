# Wishtaa Sheets - project rules

- Separate app. Do not touch or reuse the Wishtaa Maps repo.
- Plan first: write a plan, WAIT for "approved", then build one step at a time.
- After each step: screenshot, localhost link (http://localhost:3100), PDF report. Stop.
- Push only after the user approves a step: commit with a clear message, push to main.
  Never force-push. Never commit .env files or secrets. If a push fails, stop and report.
- Supabase tables are prefixed `sheets_`. Use the anon key only.
- Phase 2 (Google sign-in, Picker, run engine, Drive notifications) is NOT built yet.
