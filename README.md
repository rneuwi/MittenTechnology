# Mitten Technology website

Single-page site: plain HTML/CSS/JS, no build step. Deployed to GitHub Pages by `.github/workflows/deploy.yml`.

## Structure

```
index.html
privacy.html          # Privacy Policy
terms.html            # Terms of Use
accessibility.html    # Accessibility Statement
css/styles.css
js/main.js       # nav menu, header shadow, footer year
assets/          # logo-full.png is the original; others are crops/favicons generated from it
assets/fonts/    # self-hosted Exo 2 and Inter (SIL Open Font License), latin subset
```

## Compliance notes
- **Accessibility:** built to WCAG 2.2 AA (contrast checked,
  keyboard and screen reader friendly, reduced motion, forced-colors support). The statement
  is in `accessibility.html`; update its "Last reviewed" date when you re-check the site.
- **Privacy:** no analytics or site cookies. Fonts are self-hosted so no Google Fonts requests.
  There is no contact form; visitors email directly. If you ever add analytics, a form, a
  new third-party service, or a newsletter, update `privacy.html` (and you may need a consent banner).
- **Legal review:** the Privacy Policy and Terms of Use are solid starting points written for this
  site, but they aren't legal advice. Have a Michigan attorney review them, especially the
  liability cap and venue clauses in `terms.html`.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy
Pushing to `main` deploys automatically. GitHub Pages must have **Settings > Pages > Source** set to **GitHub Actions**.

## Custom domain: mittentechnologyllc.com
Because the site deploys through GitHub Actions, a `CNAME` file isn't used; the domain is set in the repo settings instead.

- [x] Settings > Pages > Custom domain: `mittentechnologyllc.com`, then check **Enforce HTTPS** once the certificate is issued
- [x] DNS at the registrar: `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` pointing to `rneuwi.github.io` (all DNS only, not proxied by Cloudflare, so GitHub can renew the HTTPS certificate)
- [ ] (Recommended) Verify the domain under your GitHub account's Settings > Pages to prevent takeover
- [x] Set up the `rneuwirth@mittentechnologyllc.com` mailbox in Google Workspace
