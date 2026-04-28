# By Lot.

A web-based participatory artwork on democratic reflection. Nine questions, anonymous, no accounts, no metrics, no replies. An academic submission for the seminar *Where to, Democracy?* at the University of St. Gallen, spring semester 2026.

## What this is

A scrolling, single-page piece. Visitors move through nine chapters — Believe, Govern, Silence, Lesser, Drawn, Imagine, Objection, Future, Speech — and write one anonymous response to each. Each chapter ends with a wall of other people's responses. The closing chapter (Speech) gathers every speech ever written into a single quiet scroll.

There are no accounts, no likes, no replies, no shares, no analytics. The only thing the site stores about a visitor is the text they choose to leave.

## The text is canon

**All visible content — the chapter prompts, preambles, post-submission lines, quoted passages, and Foundations citations — is verbatim from the design and must not be edited without the project owner's explicit approval.** This includes punctuation, capitalisation, line breaks, and the order of things. If you find a typo, surface it before changing it.

## Stack

- **Frontend:** plain HTML + CSS + ES modules, bundled with [Vite](https://vitejs.dev). One inline stylesheet, three small JS files (`chapters.js`, `field.js`, `app.js`), and a Three.js field-of-points scene behind everything.
- **Backend:** [Supabase](https://supabase.com) — one Postgres table, one anon key, no auth, no edge functions.
- **Hosting:** [Vercel](https://vercel.com) free tier, static build output (`dist/`) served from CDN.
- **Fonts:** EB Garamond + Inter, self-hosted as woff2 in `public/fonts/`. Google Fonts is *not* used — that would leak visitor IPs to Google.

There is no analytics SDK, no error reporter, no A/B tool, no third-party script other than the Supabase JS client and the Three.js library (both bundled, not loaded from a CDN).

## Local development

```bash
# 1. Install
npm install

# 2. Supabase env vars
cp .env.example .env.local
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see below)

# 3. Run
npm run dev      # http://localhost:5173

# 4. Build for production
npm run build
npm run preview  # serves dist/ at http://localhost:4173
```

## Environment variables

| Variable | Where it goes |
|---|---|
| `VITE_SUPABASE_URL` | `.env.local` for dev, Vercel project settings for prod. |
| `VITE_SUPABASE_ANON_KEY` | Same. |

The anon key is intentionally public — it gets shipped in the browser bundle. Security comes from Supabase Row-Level Security policies (see `supabase-policies.sql`), not from secrecy. **Never commit `.env.local`.** It is in `.gitignore`.

## Database

One table, `public.submissions`:

| column | type | notes |
|---|---|---|
| `id` | `uuid` | primary key, default `gen_random_uuid()` |
| `chapter` | `text` | one of `believe, govern, silence, lesser, drawn, imagine, objection, future, speech` |
| `content` | `text` | non-empty after trim |
| `created_at` | `timestamptz` | default `now()` |
| `is_seed` | `boolean` | `true` for the prototype atmosphere entries; `false` for real submissions |

### Row-Level Security

`supabase-policies.sql` contains the minimal policies:

- anon can `SELECT` every row
- anon can `INSERT` rows that match a valid chapter slug, have non-empty content, and have `is_seed = false`
- anon cannot `UPDATE` or `DELETE` anything

Run it once in **Supabase → SQL Editor** if RLS is not already configured.

### Seeding

`seed.sql` inserts a small set of seed entries flagged `is_seed = true`. Run once in **Supabase → SQL Editor**. The seeds are placeholder atmosphere — replace or remove them before public launch.

## Moderation

There is no in-site admin interface. The owner moderates by logging into the Supabase dashboard:

1. Go to **Supabase → Table Editor → `submissions`**.
2. Sort by `created_at` desc.
3. Delete any row with the trash icon. The site re-renders walls on the next visit.

The dashboard runs as service role and bypasses RLS, so deletion works even though the anon key cannot delete.

Direct URL pattern: `https://supabase.com/dashboard/project/<project-ref>/editor`.

## Deploying to Vercel

1. **Push the repo to GitHub** (or import the project directory directly into Vercel).
2. **Vercel → New Project → import repo.** Vercel auto-detects Vite via `vercel.json` and uses `npm run build` → `dist/`.
3. **Project settings → Environment Variables → add both:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   Apply to Production, Preview, and Development.
4. Trigger a deploy. The free tier is sufficient — the site is fully static and Supabase handles all dynamic load.

**Do not enable Vercel Analytics, Vercel Speed Insights, or any other tracking integration.** The piece deliberately has zero observability of its visitors.

## Constraints (for future contributors)

These are non-negotiable. They are part of the work, not implementation details.

- No analytics (Google, Plausible, PostHog, Vercel, anything else).
- No accounts, no login, no OAuth, no email capture, no newsletter.
- No engagement metrics on the wall: no likes, no upvotes, no replies, no shares, no view counts, no character counters.
- No third-party scripts beyond the Supabase JS client and Three.js, both bundled at build time. No CDN `<script>` tags.
- `prefers-reduced-motion: reduce` must disable the field-of-points scene; the static CSS-gradient fallback remains.
- Mobile-first responsive. Verify on iPhone Safari before shipping.
- No font flash. Fonts are self-hosted woff2 with `<link rel="preload">` on the critical weights.

## Notes from the build

- The original design prototype rendered both real submissions and a hardcoded `seeds.js` array. In production both come from Supabase — seeds are just rows with `is_seed = true`. This means the wall is empty until `seed.sql` is run, by design.
- The Believe chapter's "echoes" (three other anonymous Believe-submissions that fade in after submitting) now query Supabase for the three most recent rows other than the one the visitor just wrote. If nothing else has been submitted yet, the echoes section is omitted rather than fabricated.
- The closing constellation pulls up to 500 most recent Speech rows. The cap is generous; in normal use volume will be far below that.
- The footer "Source code on GitHub" link in Foundations points to `#`. Update it in `index.html` once the repo has a public URL.
- The design prototype used `localStorage`. That has been replaced entirely; no client-side persistence remains beyond a small `sessionStorage` flag used to highlight a visitor's just-submitted entries during the same tab session.

## Project structure

```
.
├── index.html              # canonical HTML + inline CSS, verbatim from design
├── public/fonts/           # self-hosted woff2 files
├── src/
│   ├── main.js             # entry — initField() + boot()
│   ├── chapters.js         # the nine chapters, verbatim
│   ├── supabase.js         # client + queries (insert, page, echoes, closing)
│   ├── app.js              # render, form wiring, walls, post-reveals, closing
│   └── field.js            # Three.js field of points (skipped under reduced-motion)
├── seed.sql                # one-time seed inserts for the wall
├── supabase-policies.sql   # one-time RLS setup
├── vercel.json             # Vite framework hint + asset cache header
├── .env.example            # variable names only
├── .env.local              # (gitignored) actual values for local dev
└── package.json
```

## Acknowledgements

This piece exists because of David Van Reybrouck, Bernard Manin, James Fishkin, Shoshana Zuboff, and the long line of democratic theorists who refused to accept that election was the only meaningful answer to the question of legitimacy. The Foundations section of the site lists the exact texts.
