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

## Deploy

The site is hosted on Cloudflare Workers (static assets, config in `wrangler.jsonc`) and connected to this GitHub repo. Every push to `main` deploys to https://bymaximade.com within about a minute. DNS is on Cloudflare; nothing else to configure.

## Apply form

The 5-step form posts to Web3Forms and lands in the studio Gmail inbox. The access key sits in `index.html` and is public by design. If Web3Forms is unreachable the form falls back to opening the visitor's email app.

## Hero videos

Six 5-second loops live in `assets/videos/` as 720x1280 H.264 with a JPG poster each. Phones show only the first tile of each column (ugc, product, ad). To swap a clip, replace the mp4 and jpg with the same name and push.
