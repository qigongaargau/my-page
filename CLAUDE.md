# CLAUDE.md

Website for Qigong courses in Canton Aargau (owner: Olena Räss).
Live at https://qigong-aargau.org — see `README.md` for the full stack, deploy flow, and legal checklist.

## What this is

- **Plain static HTML/CSS** (+ minimal vanilla JS only if truly needed). No framework, no build step, no dependencies, no package.json. Keep it that way.
- Deployed by **Cloudflare Pages** directly from this repo: push to `main` → production on qigong-aargau.org; push to any other branch → preview URL. Build command is empty; the repo root is uploaded verbatim.
- Repo is private, owned by the dedicated GitHub account `qigongaargau`.

## Conventions

- **Language**: all page content in German, `<html lang="de-CH">`. Other languages later under `/en/` etc. — don't restructure for i18n now.
- **Pages** (flat, at repo root): `index.html`, `kurse.html`, `ueber-mich.html`, `kontakt.html`, `impressum.html`, `datenschutz.html`.
- Header/footer markup is **duplicated across the 6 pages** by design. When editing nav or footer, update all pages consistently. Revisit only if page count grows.
- CSS in `css/style.css` (single file). Images in `img/` as optimized WebP, sized for web. JS in `js/` only when a page actually needs it.
- **Self-host everything** — no Google Fonts CDN, no third-party embeds (maps, analytics scripts). This is a privacy/DSG requirement, not just a preference.
- No cookies, no analytics → no consent banner. If analytics is ever added, use Cloudflare Web Analytics (cookieless).
- `_redirects` handles www → apex; `_headers` sets security headers. Both are Cloudflare Pages config files at the root — don't rename or move them.
- Keep `sitemap.xml` in sync when pages are added/removed.

## Legal (do not break)

- `impressum.html` and `datenschutz.html` are Swiss legal requirements (revDSG) and must stay linked from every page's footer.

## Preview password protection

`functions/_middleware.js` wraps the whole site in HTTP Basic Auth **only while**
the `SITE_PASSWORD` environment variable is set in Cloudflare Pages
(Settings → Environment variables). Any username works; only the password is
checked. For go-live: delete the variable and redeploy (or delete the file).
Don't put the password itself anywhere in the repo.

## Future backend

Dynamic features (contact form, registration) go in `/functions` as Cloudflare Pages Functions (file-based routing, e.g. `functions/api/contact.js` → `/api/contact`). Secrets belong in Cloudflare Pages environment variables, **never in this repo**. Add Turnstile to any public form.

## Local dev

```bash
python -m http.server 8000   # from repo root
```

No tests, no linter, no CI — verify changes by loading the pages locally.
