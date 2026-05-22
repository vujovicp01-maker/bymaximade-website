# bymaximade

The marketing website for **bymaximade** (BYMD LLC) — a creative studio producing realistic AI content (AI UGC, avatars, product videos, short form).

Single-page, dark, editorial-minimal. No build step. Plain HTML + Tailwind (CDN) + a small vanilla JS file.

---

## Local preview

Just open `index.html` in any browser. No server, no install.

If you want hot-reload while editing, you can optionally serve it with any static server, e.g.:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then open <http://localhost:8000>.

---

## Project structure

```
.
├── index.html          # The entire site (one page)
├── styles.css          # Custom CSS on top of Tailwind
├── script.js           # Nav, reveal animations, contact form
├── assets/
│   └── logo.png        # The BYMD wordmark (used in nav, footer, and favicon)
└── README.md
```

To replace the logo, drop a new file at `assets/logo.png` — both the nav and footer references will pick it up automatically. To tweak its display size, adjust the `h-9` (nav) and `h-12` (footer) Tailwind classes on the `<img>` tags in `index.html`.

---

## Contact form

The form on the homepage submits via `mailto:bymaximade@gmail.com`. When a visitor clicks **Send inquiry**, their default email client opens with the brief pre-filled. They press send and the message lands in the bymaximade inbox.

> Want submissions to arrive without opening the visitor's email client? Sign up for [Formspree](https://formspree.io) (free tier), then in `script.js` swap the `mailto:` block for a `fetch()` POST to the Formspree endpoint. ~5 lines of code.

---

## Deploy to GitHub Pages

1. Create a new public repository on GitHub.
2. Push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

3. On GitHub: **Settings → Pages → Build and deployment**
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `(root)` → **Save**
4. Wait ~30 seconds, then visit `https://<your-username>.github.io/<repo-name>`.

---

## Connect a custom domain

1. In your domain registrar's DNS settings, add records pointing to GitHub Pages:

   **For an apex domain (e.g. `bymaximade.com`)** — add four `A` records:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   **For a `www` subdomain** — add one `CNAME` record:
   ```
   www  →  <your-username>.github.io
   ```

2. In your repo, create a file named `CNAME` (no extension) at the root with one line — your domain:
   ```
   bymaximade.com
   ```
   Commit and push.

3. On GitHub: **Settings → Pages → Custom domain** → enter the domain → **Save**.
4. Once DNS resolves, check **Enforce HTTPS** for a free SSL certificate.

DNS can take anywhere from a few minutes to 24 hours to propagate.

---

## License

© 2026 BYMD LLC. All Rights Reserved.
