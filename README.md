# Qigong Aargau – Website

Static website (plain HTML/CSS/minimal JS) for a Qigong practice in Canton Aargau.
Hosted on **Cloudflare Pages** (free tier), deployed automatically from this **private GitHub repo**.
No framework, no build step. A dynamic backend can be added later via **Pages Functions** without changing hosting or workflow.

> **Account separation:** This project uses its own identities only —
> `qigong.aargau@gmail.com` → GitHub account → Cloudflare account.
> No SSO overlap or shared credentials with any personal/work accounts.
> 2FA enabled on all three; credentials stored in the owner's password manager.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Site | Plain HTML/CSS (+ minimal vanilla JS if needed) | No toolchain, no dependencies, nothing to update |
| Hosting | Cloudflare Pages, free tier | Unlimited bandwidth, 500 builds/month |
| Repo | GitHub, private | Owned by the dedicated GitHub account |
| Domain | `.ch` via Infomaniak/Hostpoint | Cloudflare Registrar does **not** support `.ch` |
| DNS | Cloudflare (nameservers pointed from registrar) | |
| SSL | Automatic via Cloudflare Universal SSL | Auto-renewed |
| Backend (later) | Cloudflare Pages Functions (`/functions`) | See [Future: dynamic backend](#future-dynamic-backend) |

Primary language: **German** (`de-CH`). English planned later under `/en/`.

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
git clone git@github.com:<qigong-account>/<repo>.git
cd <repo>
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

### One-time setup

1. Cloudflare dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*.
2. Authorize the Cloudflare GitHub App **from the dedicated GitHub account**,
   grant access to this repo only.
3. Leave build command empty, output dir `/` → *Save and Deploy*
   → first deploy on `<project>.pages.dev`.
4. **Custom domain**: Pages project → *Custom domains* → add
   `qigong-aargau.ch` and `www.qigong-aargau.ch`.
   With the zone already on Cloudflare nameservers, CNAMEs are created automatically;
   SSL certificate issues within minutes.
5. `www` → apex redirect via `_redirects`:

   ```
   https://www.qigong-aargau.ch/* https://qigong-aargau.ch/:splat 301
   ```

### Domain & DNS (context)

- `.ch` registered at Infomaniak or Hostpoint (Cloudflare Registrar doesn't support `.ch`).
- At the registrar, set nameservers to the two Cloudflare NS values shown when
  adding the zone (free plan). DNS is then managed entirely in Cloudflare;
  the registrar is only for renewal (~CHF 10–15/yr — the only running cost).

---

## Content editing workflow

**Chris maintains the site.** Owner sends changes (schedule, prices, photos)
by e-mail/WhatsApp → commit → auto-deploy. Typical change is editing one HTML
file and pushing; live within a minute.

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

- [ ] All pages in German, proofread by owner
- [ ] Impressum + Datenschutzerklärung published and linked in footer
- [ ] Custom domain active, SSL valid, `www` redirect works
- [ ] Images optimized (WebP, correct dimensions)
- [ ] Lighthouse: performance/SEO/a11y ≥ 90
- [ ] `robots.txt` + `sitemap.xml` present
- [ ] Google Business Profile created and linked to the site
- [ ] Owner has password-manager entries for Gmail, GitHub, Cloudflare (2FA on all)
