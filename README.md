# Qigong Aargau – Website

Static website for a Qigong practice in Canton Aargau.
Hosted on **Cloudflare Pages** (free tier), deployed automatically from this **private GitHub repo**.

> **Account separation:** This project uses its own identities only —
> `qigong.aargau@gmail.com` → GitHub account → Cloudflare account.
> No SSO overlap or shared credentials with any personal/work accounts.
> 2FA enabled on all three; credentials stored in the owner's password manager.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site generator | Astro **or** plain HTML/CSS (see [Decisions](#decisions)) | Both deploy identically on Pages |
| Hosting | Cloudflare Pages, free tier | Unlimited bandwidth, 500 builds/month |
| Repo | GitHub, private | Owned by the dedicated GitHub account |
| Domain | `.ch` via Infomaniak/Hostpoint | Cloudflare Registrar does **not** support `.ch` |
| DNS | Cloudflare (nameservers pointed from registrar) | Enables proxying + easy custom-domain setup |
| SSL | Automatic via Cloudflare | Universal SSL, auto-renewed |
| Contact | mailto **or** Pages Function (see [Decisions](#decisions)) | |

Primary language: **German** (`de-CH`). English planned later under `/en/`.

---

## Repository layout

```
/
├── public/              # static assets copied as-is (favicon, robots.txt, images)
├── src/                 # Astro: pages, layouts, components
│   ├── pages/
│   │   ├── index.astro          # Startseite
│   │   ├── kurse.astro          # Kursplan, Orte, Preise
│   │   ├── ueber-mich.astro     # Bio + Fotos
│   │   ├── kontakt.astro
│   │   ├── impressum.astro      # Swiss requirement
│   │   └── datenschutz.astro    # DSG-compliant Datenschutzerklärung
│   └── layouts/
├── functions/           # (optional) Cloudflare Pages Functions, e.g. /api/contact
├── astro.config.mjs
├── package.json
└── README.md
```

If plain HTML is chosen instead: `.html` files live at the repo root (or `/site`),
no `src/`, no build step.

---

## Local development

Prerequisites: Node.js ≥ 20, npm.

```bash
git clone git@github.com:<qigong-account>/<repo>.git
cd <repo>
npm install
npm run dev        # http://localhost:4321 (Astro)
npm run build      # production build → dist/
npm run preview    # serve the built dist/ locally
```

Plain-HTML variant: open files directly or `python -m http.server` — no toolchain.

---

## Publishing flow (how a change goes live)

```
edit → commit → push origin main → Cloudflare Pages webhook fires
     → Pages clones repo → runs build → deploys to <project>.pages.dev
     → custom domain (CNAME) serves the new version, cache purged automatically
```

Step by step:

1. **Edit** content/code locally on a feature branch or directly on `main`.
2. **Commit & push** to GitHub.
3. **Cloudflare Pages** is connected to the repo via the Cloudflare GitHub App
   (installed once during project setup, scoped to this repo only).
   Every push triggers a build:
   - Push to **`main`** → **Production deployment** → live on the custom domain.
   - Push to **any other branch / PR** → **Preview deployment** → unique URL
     like `https://<hash>.<project>.pages.dev`, linked in the PR checks.
     Use this to show the owner changes before going live.
4. **Build settings** (configured in Pages → Settings → Builds):
   - Astro: framework preset *Astro*, build command `npm run build`, output dir `dist`
   - Plain HTML: build command *(empty)*, output dir `/` (direct upload of files)
5. **Deploy** takes ~1–2 min. Status visible in Cloudflare dashboard → *Workers & Pages* → project → *Deployments*, and as a commit status check in GitHub.
6. **Rollback**: dashboard → Deployments → pick any previous production deployment → *Rollback to this deployment*. Instant, no rebuild.

No CI secrets or API tokens are needed — the GitHub App integration handles auth.

### One-time setup (already done / to do once)

1. Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*.
2. Authorize the Cloudflare GitHub App **from the dedicated GitHub account**, grant access to this repo only.
3. Set build settings as above → *Save and Deploy* → first deploy on `<project>.pages.dev`.
4. **Custom domain**: Pages project → *Custom domains* → add `qigong-aargau.ch` and `www.qigong-aargau.ch`.
   - If the zone's nameservers already point to Cloudflare, the CNAME records are created automatically.
   - SSL certificate is issued automatically (a few minutes).
5. Recommended redirects: `www` → apex (Bulk Redirects or a `_redirects` file).

### Domain & DNS (context)

- `.ch` registered at Infomaniak or Hostpoint (Cloudflare Registrar doesn't support `.ch`).
- At the registrar, set nameservers to the two Cloudflare NS values shown when adding the zone in Cloudflare (free plan).
- All DNS is then managed in Cloudflare; registrar is only for renewal (~CHF 10–15/yr, the only running cost).

---

## Content editing workflow (non-technical owner)

Current model: **Chris maintains the site.** Owner sends changes
(schedule, prices, photos) by e-mail/WhatsApp → Chris commits → auto-deploy.

If self-service editing is needed later: add **Decap CMS** (`/admin`, Git-backed,
no server) — content edits then create commits through a web UI.

---

## Decisions

| Topic | Options | Status |
|---|---|---|
| Generator | Astro vs. plain HTML/CSS | **pending** — Astro recommended if EN version + shared layout are coming; plain HTML if the site stays ≤ 5 pages |
| Contact form | `mailto:` link vs. Pages Function (+ Turnstile anti-spam) | **pending** — mailto is zero-maintenance; Function avoids exposing the address and works on mobile-less desktops |
| CMS | none (Chris maintains) vs. Decap CMS | default: none |

---

## Legal (Swiss)

- **Impressum**: required — name, address, contact of the site operator.
- **Datenschutzerklärung**: required under revDSG (in force since 1 Sep 2023);
  must cover hosting (Cloudflare, US provider → mention SCCs), contact form
  data handling, and any embedded services (Google Maps, fonts → self-host fonts).
- No cookies/analytics planned → no consent banner needed. If analytics are added,
  prefer Cloudflare Web Analytics (cookieless).

---

## Checklist before go-live

- [ ] All pages in German, proofread by owner
- [ ] Impressum + Datenschutzerklärung published and linked in footer
- [ ] Custom domain active, SSL green, `www` redirect works
- [ ] Lighthouse: performance/SEO/a11y ≥ 90
- [ ] `robots.txt` + `sitemap.xml` present
- [ ] Google Business Profile created and linked to the site
- [ ] Owner has password-manager entries for Gmail, GitHub, Cloudflare (2FA on all)
