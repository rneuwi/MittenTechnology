# Mitten Technology website

Single-page site: plain HTML/CSS/JS, no build step. Deployed to GitHub Pages by `.github/workflows/deploy.yml`.

## Structure

```
index.html
css/styles.css
js/config.js     # placeholders only, filled in at deploy time from GitHub secrets
js/main.js       # nav, scroll reveal, contact form (EmailJS + reCAPTCHA)
assets/          # logo-full.png is the original; others are crops/favicons generated from it
```

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000. Locally the placeholders in `js/config.js` aren't filled in, so the form is disabled and shows the email fallback. That's expected.

To test the real form locally, temporarily put your values in `js/config.js` and **don't commit them**.

## Contact form setup (one time)

### 1. reCAPTCHA v2
1. Go to https://www.google.com/recaptcha/admin and create a site with type **reCAPTCHA v2, "I'm not a robot" checkbox**.
2. Domains: `<your-username>.github.io` and `localhost`.
3. Keep the **site key** (public) and **secret key** (goes to EmailJS only).

### 2. EmailJS
1. Sign up at https://www.emailjs.com and add an **Email Service** (Gmail, Outlook, etc.). Note the Service ID.
2. Create an **Email Template**. The form sends these variables:
   - `{{from_name}}`, `{{reply_to}}`, `{{company}}`, `{{message}}`
   - Suggested: Subject `New inquiry from {{from_name}}`, Reply-To `{{reply_to}}`.
3. In the template's **Settings** tab, turn on **Enable reCAPTCHA V2 verification** and paste the reCAPTCHA **secret key**. EmailJS then rejects any send without a valid captcha, so bots can't skip it.
4. Note the Template ID, and your **Public Key** under Account > General.
5. Account > Security: add `<your-username>.github.io` to the allowed origins, and consider turning on the rate limit.

### 3. GitHub
1. Create the repo and push to `main`.
2. Settings > Secrets and variables > Actions, add:
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `RECAPTCHA_SITE_KEY`
3. Settings > Pages > Source: **GitHub Actions**.
4. Push (or run the workflow manually). The site deploys to `https://<your-username>.github.io/<repo>/`.

Note: the EmailJS public key and reCAPTCHA site key end up visible in the deployed JS. They're designed to be public. Protection comes from the allowed-origins setting and server-side captcha checks, and keeping them out of the repo means they aren't stored in git history.

## Bot protection layers
- reCAPTCHA v2, verified server-side by EmailJS
- Hidden honeypot field (`website`): if it's filled in, the submission is dropped
- Minimum 3 seconds on the page before a submit is accepted
- EmailJS allowed origins and rate limit (dashboard settings)

## TODO once the domain is purchased
- [ ] Replace `hello@mittentechnology.com` in `index.html` and `js/config.js` with the real address
- [ ] Add a `CNAME` file with the domain and set the custom domain in Pages settings
- [ ] Make `og:image` an absolute URL (`https://yourdomain/assets/og-image.jpg`) so link previews work
- [ ] Add the domain to the reCAPTCHA and EmailJS allowed origins
