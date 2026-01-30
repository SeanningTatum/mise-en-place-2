---
title: Editorial Design System Release
date: 2026-01-29
---

# Editorial Cookbook Design System Release

**Date:** 2026-01-29

## Summary
Introduces a distinctive editorial cookbook design system with warm typography, earthy color palette, and refined UI components. The design evokes the feel of a beautifully curated cookbook with attention to typography, texture, and visual hierarchy.

## New Features
- **Typography System**: Dual-font pairing with Playfair Display (serif) for headings and Source Sans 3 (sans-serif) for body text
- **Warm Color Palette**: Terracotta primary, sage green accent, warm cream backgrounds
- **Visual Texture**: Subtle grain overlay for artisanal paper feel
- **Branded Auth Pages**: Login and signup pages with "mise en place" branding and decorative elements
- **Enhanced Recipe Cards**: Gradient overlays, improved macro display, staggered animations
- **Editorial Recipe Detail**: Section headers with icons, refined layout with decorative borders
- **Shadow System**: New `shadow-warm` and `shadow-warm-lg` utility classes

## Key Files

| File | Description |
|------|-------------|
| `app/app.css` | Design system definition with CSS variables, typography, colors |
| `app/components/recipes/recipe-card.tsx` | Updated recipe card with gradient overlays |
| `app/components/recipes/recipe-extractor.tsx` | Enhanced extraction form with loading animation |
| `app/routes/authentication/login.tsx` | Branded login page |
| `app/routes/authentication/sign-up.tsx` | Branded signup page |
| `app/routes/authentication/components/login-form.tsx` | Refined login form |
| `app/routes/authentication/components/signup-form.tsx` | Refined signup form |
| `app/routes/recipes/_layout.tsx` | Updated header with branding and footer |
| `app/routes/recipes/_index.tsx` | Refined recipe list with animations |
| `app/routes/recipes/[id].tsx` | Editorial recipe detail page |
| `app/routes/recipes/new.tsx` | Enhanced new recipe page with "how it works" section |

## Design Tokens

### Typography
```css
--font-display: "Playfair Display", ui-serif, Georgia, serif;
--font-sans: "Source Sans 3", ui-sans-serif, system-ui, sans-serif;
```

### Colors (Light Mode)
```css
--background: oklch(0.98 0.008 85);     /* Warm cream */
--primary: oklch(0.55 0.14 35);          /* Terracotta */
--accent: oklch(0.88 0.05 145);          /* Sage green */
--terracotta: oklch(0.55 0.14 35);
--sage: oklch(0.70 0.08 145);
```

### Colors (Dark Mode)
```css
--background: oklch(0.18 0.015 50);      /* Deep espresso */
--primary: oklch(0.72 0.12 40);          /* Lighter terracotta */
--accent: oklch(0.32 0.04 145);          /* Muted sage */
```

### Utility Classes
- `font-display` - Apply serif display font
- `shadow-warm` - Warm-toned shadow for cards
- `shadow-warm-lg` - Larger warm shadow for hover states
- `heading-underline` - Decorative underline for headings

## Bug Fixes
None - design enhancement release.

## Breaking Changes
None. Visual changes only, no API or data changes.

## Dependencies Added
None. Uses Google Fonts via CSS import.

## Screenshots
- Login page: `docs/testing/recipes/screenshots/login.png`
- Signup page: `docs/testing/recipes/screenshots/signup.png`
- Recipe list: `docs/testing/recipes/screenshots/recipe-list-with-card.png`
- Recipe detail: `docs/testing/recipes/screenshots/recipe-detail.png`
