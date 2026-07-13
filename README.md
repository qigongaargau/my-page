# Qigong Aargau – Website

**Review URL (password-protected): https://qigong-aargau.pages.dev — final domain https://qigong-aargau.org (not yet attached).**

Static website (plain HTML/CSS/minimal JS) for a Qigong practice in Canton Aargau.
Hosted on **Cloudflare Pages** (free tier), deployed automatically from this **private GitHub repo**.
No framework, no build step. A dynamic backend can be added later via **Pages Functions** without changing hosting or workflow.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site | Plain HTML/CSS (+ minimal vanilla JS if needed) | No toolchain, no dependencies, nothing to update |
| Hosting | Cloudflare Pages, free tier | Unlimited bandwidth, 500 builds/month |
| Repo | GitHub, private | Owned by https://github.com/qigongaargau |
| Domain | qigong-aargau.org |
| DNS | Cloudflare (nameservers pointed from registrar) | |
| SSL | Automatic via Cloudflare Universal SSL | Auto-renewed |
| Backend (later) | Cloudflare Pages Functions (`/functions`) | See [Future: dynamic backend](#future-dynamic-backend) |

Primary language: **German** (`de-CH`). English and other languages planned later under e.g. `/en/`.

---

## Repository layout

```
/
├── index.html               # Startseite
├── kurse.html               # Kursplan, Orte, Preise
├── ueber-mich.html          # Bio + Fotos
├── kontakt.html
├── impressum.html           # Swiss requirement
├── datenschutz.html         # DSG-compliant Datenschutzerklärung
├── css/
│   └── style.css
├── img/                     # optimized photos (WebP, sized for web)
├── js/                      # only if actually needed
├── robots.txt
├── sitemap.xml
├── _redirects               # Cloudflare Pages redirects (e.g. www → apex)
├── _headers                 # optional: security headers (CSP, etc.)
└── README.md
```

Everything at the repo root is deployed as-is. Shared header/footer are duplicated
across the 6 pages — acceptable at this size; revisit only if the page count grows.

---

## Local development

No toolchain required. Edit files, then either open them directly in a browser or
serve locally (needed for correct relative paths / redirects testing):

```bash
git clone git@github.com:qigongaargau/my-page.git
cd my-page
python -m http.server 8000     # http://localhost:8000
```

---

## Publishing flow (how a change goes live)

```
edit → commit → push origin main → Cloudflare Pages webhook fires
     → Pages clones repo → no build (direct upload) → deploys to <project>.pages.dev
     → custom domain serves the new version, cache invalidated automatically
```

Step by step:

1. **Edit** locally, on a branch or directly on `main`.
2. **Commit & push** to GitHub.
3. **Cloudflare Pages** is connected to the repo via the Cloudflare GitHub App
   (installed once, scoped to this repo only). Every push triggers a deployment:
   - Push to **`main`** → **Production** → live on the custom domain.
   - Push to **any other branch / PR** → **Preview** → unique URL
     `https://<hash>.<project>.pages.dev`, shown in the PR checks.
     Use previews to show the owner changes before going live.
4. **Build settings** (Pages → Settings → Builds):
   build command *(empty)*, output directory `/`. Pages uploads the files verbatim.
5. **Deploy time**: typically < 1 min. Status in Cloudflare dashboard
   → *Workers & Pages* → project → *Deployments*, and as a GitHub commit check.
6. **Rollback**: Deployments list → pick any earlier production deployment
   → *Rollback*. Instant, no rebuild — every deployment is kept immutable.

No CI configuration, tokens, or secrets in the repo — the GitHub App handles auth.

### One-time setup — status (July 2026)

1. ~~Create Pages project connected to Git~~ **Done** — project `qigong-aargau`
   was created via the Cloudflare API (the GitHub App was already installed on
   the `qigongaargau` account). Production deploys work; site live at
   `qigong-aargau.pages.dev`.
2. **Custom domain — still open**: Pages project → *Custom domains* → add
   `qigong-aargau.org` and `www.qigong-aargau.org`.
   With the zone already on Cloudflare nameservers, CNAMEs are created automatically;
   SSL certificate issues within minutes. Deliberately postponed until the
   review phase is over.
3. `www` → apex redirect via `_redirects` (already in the repo):

   ```
   https://www.qigong-aargau.org/* https://qigong-aargau.org/:splat 301
   ```

API note: the account uses an *account-owned* API token; it verifies against
`/accounts/{account_id}/tokens/verify`, **not** `/user/tokens/verify`.

---

## Preview password (pre-launch)

Until go-live the whole site is protected by HTTP Basic Auth via
`functions/_middleware.js`. **Currently active** — `SITE_PASSWORD` is set on
Production and Preview; any username plus the shared review password unlocks
the site.

- The variable lives in Cloudflare Pages → project → *Settings* →
  *Variables and Secrets* (changes apply to the **next** deployment).
- **Go-live**: delete the `SITE_PASSWORD` variable and redeploy. The middleware
  then passes every request through unchanged; it can stay in the repo.
- The password lives only in Cloudflare, never in the repo.

---

## Future: dynamic backend

When dynamic features are needed (contact form handling, course registration,
booking), the path is **Cloudflare Pages Functions** — serverless endpoints that
live in this same repo and deploy through the same push-to-`main` flow:

```
/functions
└── api/
    └── contact.js       # served at /api/contact
```

- File-based routing: `functions/api/contact.js` → `POST /api/contact`.
- Free tier: 100k requests/day — far beyond this site's needs.
- Secrets (e.g. an e-mail API key) go in Pages → Settings → *Environment variables*,
  never in the repo.
- For state (registrations, bookings): Cloudflare **D1** (SQLite) or **KV**,
  both bindable to Pages Functions on the free tier.
- Add **Turnstile** (Cloudflare's captcha, free) to any public form for spam protection.

Nothing about hosting, DNS, or the publishing flow changes — the static pages and
the functions deploy together, atomically, per commit.

Until then, contact is a `mailto:` link or plain listed phone/e-mail.

---

## Legal (Swiss)

- **Impressum**: required — name, address, contact of the site operator.
- **Datenschutzerklärung**: required under revDSG (in force since 1 Sep 2023);
  must cover hosting (Cloudflare, US provider → mention SCCs), contact data
  handling, and any embedded third-party services (self-host fonts; avoid
  Google Fonts CDN and embedded maps, or disclose them).
- No cookies/analytics planned → no consent banner needed. If analytics are
  wanted later, use Cloudflare Web Analytics (cookieless, free).

---

## Checklist before go-live

- [y] All pages in German, proofread by owner
- [y] Impressum + Datenschutzerklärung published and linked in footer
- [y] Custom domain active, SSL valid, `www` redirect works
- [y] Images optimized (WebP, correct dimensions)
- [y] `robots.txt` + `sitemap.xml` present
- [ ] Google Business Profile created and linked to the site
- [ ] Owner has password-manager entries for Gmail, GitHub, Cloudflare (2FA on all)
