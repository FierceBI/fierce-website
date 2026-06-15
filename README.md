# Fierce — New Website (static source for WordPress build)

Static HTML/CSS/JS for the new fierceinc.com, organized **by page** so each page
maps cleanly to a WordPress page/template. The homepage is the most fully built;
the other pages are supporting templates.

## Structure

```
fierce-design-system/      ← brand system: tokens, components, and theme.css (the single source of truth for the look)
│   ├── theme.css          ← all CSS custom properties (colors, type, spacing, gradients)
│   ├── tokens/            ← the same tokens split into files
│   ├── components/        ← reference component markup
│   └── DESIGN_SYSTEM.md   ← written spec
└── website/
    ├── shared/            ← used by every page (NOT page content)
    │   ├── site.css       ← layout + component styles (built on the design-system tokens)
    │   ├── nav.html       ← the top navigation (one source for all pages)
    │   ├── footer.html    ← the footer + closing CTA
    │   ├── include.js     ← injects nav/footer into each page + active-link highlight
    │   ├── carousel.js    ← the homepage programs carousel
    │   └── images/        ← book photo + client logos
    ├── homepage/   index.html
    ├── programs/   index.html
    ├── who-we-serve/ index.html
    ├── why-fierce/ index.html
    ├── about/      index.html
    └── resources/  index.html   ← placeholder, to be filled
```

## Preview it locally

The pages link to shared assets and the design system by relative path, so they
must be **served from the repo root** (not opened as files):

```bash
# from the repo root:
python3 -m http.server 8000
# then open:  http://localhost:8000/website/homepage/
```

(Opening an `index.html` directly via `file://` will show the page copy but not
the nav/footer — those load via fetch, which needs a served context.)

## How this maps to WordPress

- **Design system → theme styles.** `fierce-design-system/theme.css` + `website/shared/site.css`
  hold all the styling. Port these into the theme (or enqueue them). Everything keys off
  the CSS custom properties in `theme.css`, so the brand stays consistent.
- **Each `website/<page>/index.html` = one WordPress page/template.** The content lives
  between the `<!-- ✏️ EDIT YOUR COPY BELOW -->` and `<!-- /EDIT -->` markers — that section
  markup is what to bring into the WP template.
- **`shared/nav.html` and `shared/footer.html` are preview scaffolding.** In WordPress
  they should be replaced by the theme's header/footer. They're here so the static
  preview is navigable.
- **`shared/carousel.js`** powers the homepage "15 modules" carousel — reusable if you
  keep that section.
- **Homepage extras** (inline in `homepage/index.html`): the announcement banner (with
  a dismiss + an alternate message documented in a comment), and the diagnostic
  lightbox (iframes `fierceinc.com/the-workshop-brief/`).

## Notes

- **Proof numbers are illustrative.** The figures in the homepage Proof section
  (40% / 22%→11% / 600+) are placeholders pending verified case-study data.
- **Em-dashes:** removed from the editorial copy per brand preference; the 15 carousel
  module descriptions are verbatim from the Fierce one-pager and still contain them
  (pending sign-off to rewrite).
- No build step, no dependencies — pure static files.
