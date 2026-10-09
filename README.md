# Bryce De Developer — Portfolio

A plain HTML/CSS/JS site with no build step. Open `index.html` in any browser.

```
bryce-portfolio/
├── index.html        ← all page content and copy
├── css/style.css     ← all styles (colour tokens at the top)
├── js/main.js        ← behaviour + CONFIG (email, Calendly)
├── images/           ← put your screenshots and portrait here
└── videos/           ← put your .mp4 files here
```

## Quick edits

| What | Where |
|---|---|
| Email + Calendly link | `js/main.js`, the `CONFIG` block at the top (currently ogidiayomide44@gmail.com and calendly.com/ogidiayomide). The HTML links also carry these values as a fallback, so update both |
| Contact form (Formspree) | Live, posting to `https://formspree.io/f/xgaoarjk`. To change it, edit the form's `action=""` in `index.html` (search for "FORMSPREE") |
| Colours | `css/style.css`, section 1 (`:root` tokens) |
| Hero / about / project images | `index.html`: replace the `https://picsum.photos/...` URLs with `images/your-file.jpg` |
| Testimonials | `index.html`: the TESTIMONIALS section. Delete each `.placeholder-tag` once the quote is real |
| Hero photo | Replace `images/hero-night.jpg`. If the bright spot moves, update `--glow-x` / `--glow-y` in `css/style.css` (section 5) |
| Zoom length | `js/main.js`, section 7: `end: "+=160%"` (higher = slower transition) |
| "View case" links | `index.html`: replace `href="#"` on each `.case-link` with your case study URL |

## Work card videos

Each card in `index.html` (SELECTED WORK) has instructions in a comment above it. In short:

- **Hover preview:** `<video class="work-media__video" src="videos/xxx-preview.mp4" …>`. Keep it short, muted and under 5 MB. Delete the tag to show the image only.
- **Play button / lightbox:** on `<button class="play-btn">`, set either
  - `data-video="videos/xxx-full.mp4"` (self-hosted), or
  - `data-embed="https://youtube.com/watch?v=…"` / Vimeo / Loom link.
  If both are empty, the Play button hides itself.

`videos/sample-preview.mp4` is a CC0 placeholder clip from MDN. Delete it once you've added your own.

**Note on YouTube:** YouTube embeds can refuse to play when the page is opened straight from a file (`file:///…`). They work once the site is online (Netlify, Vercel, GitHub Pages). Vimeo and Loom usually work in both cases.
