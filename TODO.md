# StudentHub — TODO / Progress Tracker

> Last updated: 2026-10-21
> Repo: `Amanvermaa1/studenthub-backend` (monorepo root `F:\studenthub`)
> Frontend live: https://studenthub-gray.vercel.app/ · Backend: **deploying on Render**

---

## Legend

- [x] Done
- [~] In progress
- [ ] Pending
- 🔴 Blocked

---

## M1 – M7 (backend + frontend core) — ✅ COMPLETE

| Milestone | Status | Notes |
|---|---|---|
| M1 Auth (register/login/JWT) | [x] | bcrypt + `jsonwebtoken` |
| M2 Posts + Markdown | [x] | Full-text search via Postgres FTS |
| M3 Comments / replies | [x] | One level nesting, comment likes |
| M4 Likes / bookmarks | [x] | Seeded from `like_count` |
| M5 Follows + notifications | [x] | 30s poll in navbar |
| M6 Attachments (Cloudinary) | [x] | Uploaded *after* post creation |
| M7 Search / tags / trending | [x] | `/api/posts/search`, `/api/tags/trending` |

### Audit fixes already shipped
- [x] FTS route no longer shadowed by `GET /api/posts/:id`
- [x] `GET /api/comments/engagement` added
- [x] `optionalAuth` on `GET /api/posts`
- [x] Hashtags persisted on createPost
- [x] `tags` / `attachments` JSON parsed in every post query
- [x] Public trending endpoints (tags + users)
- [x] `Saved.jsx` `${API}` template-literal bug
- [x] `PostRoute` re-resolves on `postId` change
- [x] PostView related-posts section + `openRelated` / `goToTag`
- [x] highlight.js code-split (main 404 kB, lazy hljs 923 kB)
- [x] Hashtag linkify inside `renderMarkdown`
- [x] Migrations idempotent (`db/migrate.js` re-run safe)

---

## Sprint — Performance, Landing page, Navbar, Deployment

### 1. Performance / lag ✅
- [x] **CloudSky render resolution** — new `resolutionScale` / `maxDpr` / `fps` props;
      landing now renders at **0.5× scale, DPR 1, 30 fps** (was DPR 2, 60 fps, full res)
      → ~8× less fragment work for the `blobs()` + `fbm()` shader
- [x] **Colour parsing cached** — `parseColor()` was running 4× *every frame*
- [x] **`getBoundingClientRect()` cached** — was called on every `pointermove`
      (layout thrash); now refreshed on `resize` / `scroll`
- [x] **Canvas no longer oversized** — removed hardcoded `minWidth: 1200 / minHeight: 800`
- [x] **Render loop pauses** when the tab is hidden (`document.hidden`)
- [x] **backdrop-filter trimmed** — removed from 12 glass panels; kept only on the
      navbar, hero panel and the sign-in pill
- [x] **Particles** — 12 → 8, `box-shadow` removed, `will-change` added
- [x] **Landing root no longer animates** — the `fade-up` transform captured the
      `position: fixed` sky layers
- [x] `contain: layout paint` on the sky wrapper isolates repaints

### 2. Landing page content ✅
- [x] Hero title underline (green swoosh) re-aligned —
      `preserveAspectRatio="none"` + `vector-effect="non-scaling-stroke"`
- [x] **Stats band** (4 stats)
- [x] **"How it works"** 3-step section
- [x] **Subjects** grid (8 topics, links into search)
- [x] **Testimonials** (3 community quotes)
- [x] **FAQ** accordion (5 questions)
- [x] **Newsletter / final CTA** band with email capture
- [x] **Footer rewritten** → 4 columns (About + Product · Resources · Company),
      trust badges, legal bar, "built for students" note
- [x] Static pages created: `/about` `/privacy` `/terms` `/guidelines` `/help` `/contact`
      (`src/pages/StaticPage.jsx` + `src/content/staticPages.js`)

### 3. Navbar ✅
- [x] **Transparent overlay mode** on the landing page (`.navbar-overlay`)
- [x] **Glassmorphism** on the "Sign in" pill (`.nav-link-glass`)
- [x] Mobile: glass drawer panel, scroll lock, auto-close on route change,
      `max-height` + scroll for long menus
- [x] Overlay palette: white brand text, glass brand mark, white accent CTA

### 4. Deployment ✅ (config) / 🔴 (backend not live yet)
- [x] Frontend: `VITE_API_URL` support in `src/api/client.js`
- [x] Frontend: `studenthub-frontend/vercel.json` (SPA rewrites + asset caching)
- [x] Frontend: `.env.example`
- [x] Backend: `studenthub-backend/render.yaml` blueprint (Web Service + Postgres)
- [x] Backend: `.env.example`
- [x] Backend: CORS allow-list from `CLIENT_ORIGIN`
- [x] Backend: `GET /health` endpoint (Render health check)
- [x] Backend: graceful `SIGTERM`/`SIGINT` shutdown + pool close
- [x] Backend: `trust proxy` (so rate limiting sees real client IPs)
- [x] Backend: `DB_SSL` support for public managed Postgres
- [x] Backend: `migrate.js` reuses the shared pool
- [x] `DEPLOY.md` with exact click-by-click steps
- [ ] Create the Render Postgres + Web Service, fill in the secrets
- [ ] Run `npm run db:migrate` against the Render DB
- [ ] Set `VITE_API_URL` on Vercel and redeploy
- [ ] Smoke test the deployed frontend → deployed API

---

## Known non-blocking warnings (pre-existing lint baseline)
- `react-hooks/exhaustive-deps` — `App.jsx`, `Navbar.jsx`, `PostView.jsx`
- `react/only-export-components` — `Toast.jsx`, `Avatar.jsx`
- `no-unused-vars` — `scripts/extract-components.mjs`
- `oxc/only-used-in-recursion` — `PostView.jsx` (recursive comment component)

## Ideas / nice-to-have
- [ ] Seed script for demo/dev data
- [ ] Real-time comment markdown re-check after `commentHtmlMap` removal
- [ ] Server-side pagination for feed
- [ ] Dark mode
- [ ] Screenshot / OG image for the landing page
- [ ] Split the 430 kB main bundle (route-level lazy loading for `Feed`)
