# Wishtaa Sheets

A workflow map over real Google Sheets. Each sheet is a node on a canvas; an arrow means
"output of this sheet feeds the input of that sheet". Built for accounting reconciliation
pipelines.

The site only shows how sheets connect and opens the real sheets. Calculations and Apps
Scripts stay inside Google Sheets and run there on their own triggers. There is no
server-side run engine and no Sheets API.

Stack: Next.js (App Router) + TypeScript + Tailwind, React Flow, Supabase (accounts only).

```
npm install
npm run dev   # http://localhost:3100
```

Copy `.env.example` to `.env.local` and fill in the values. Never commit `.env.local`.
