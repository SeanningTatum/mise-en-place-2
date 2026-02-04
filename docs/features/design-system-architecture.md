# Design System Architecture: The Culinary Chronicle

## Overview

The design system blends **newsprint editorial authority** with **cookbook warmth**, creating "The Culinary Chronicle" aesthetic—think *Bon Appetit* meets *The New York Times Food Section*.

## Design Philosophy

### Core DNA

1. **Sharp Geometry**: Near-zero border radius (2px max). Every element is a clean rectangle.
2. **High Contrast**: Warm ink colors on paper backgrounds. Visible borders define structure.
3. **Typographic Drama**: Massive serif headlines with tight line heights paired with readable body text.
4. **Visible Structure**: Grid lines celebrated, not hidden. Borders between sections are explicit.
5. **Editorial Authority**: Design feels serious, timeless, and trustworthy like a publication of record.
6. **Paper Texture**: Subtle grain overlays simulate the tactile quality of newsprint.

### Aesthetic Blend

| Element | Pure Newsprint | Our Hybrid |
|---------|----------------|------------|
| Corners | Zero radius | 2px max (sharp) |
| Shadows | Hard black offset | Hard shadows with warm tones |
| Body Font | Lora serif | Lora for content, Inter for UI |
| Primary Color | Editorial red | Terracotta (warm, approachable) |
| Borders | Heavy black | Visible warm-ink borders |
| Backgrounds | Flat + dots | Dot patterns + grain texture |

## Design Tokens

### Colors (OKLCH Format)

```css
/* Newsprint-Cookbook Hybrid Palette */
--ink: oklch(0.18 0.02 50);           /* Warm ink for text/borders */
--paper: oklch(0.975 0.008 85);       /* Warm newsprint background */
--rule: oklch(0.82 0.02 70);          /* Visible divider color */
--accent-red: oklch(0.55 0.20 25);    /* Editorial red for badges */

/* Primary: Terracotta */
--primary: oklch(0.52 0.15 35);

/* Dark Mode: Evening Edition */
--ink: oklch(0.92 0.01 80);           /* Flips to light */
--paper: oklch(0.16 0.015 50);        /* Deep charcoal */
```

### Typography

| Font | Variable | Usage |
|------|----------|-------|
| Playfair Display | `--font-display` | Headlines, hero text, titles |
| Lora | `--font-body` | Body text, paragraphs, recipes |
| Inter | `--font-ui` / `--font-sans` | Buttons, labels, navigation, UI |
| JetBrains Mono | `--font-mono` | Timestamps, metadata, data |

### Spacing & Radius

```css
--radius: 0.125rem;  /* 2px - nearly sharp */
--radius-sm: 0px;    /* Completely sharp */
```

## Component Patterns

### Buttons

- Sharp corners, no border radius
- Uppercase text with `tracking-wide`
- Hover: Color inversion (bg ↔ border swap)
- Hard shadow on primary variant

```tsx
// Default button: Solid ink, inverts on hover
className="bg-ink text-paper hover:bg-paper hover:text-ink hover:border-ink"

// Outline button: Border only, fills on hover
className="border border-ink hover:bg-ink hover:text-paper"
```

### Cards

- Sharp corners with visible border
- Hard shadow on hover with slight translate
- Dashed borders for internal dividers

```tsx
className="border border-border hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5"
```

### Navigation

- Edition metadata bar ("Vol. 1 | Feb 2026")
- Uppercase links with wide letter-spacing
- Active state: Filled background (ink/paper swap)
- Sharp logo container with border

### Forms

- Sharp input borders
- Bottom-border-only variant for minimal inputs
- Monospace font for timestamps/numbers
- Focus: Background highlight, no soft rings

## Utility Classes

| Class | Description |
|-------|-------------|
| `.font-display` | Playfair Display serif |
| `.font-body` | Lora serif for content |
| `.font-ui` | Inter sans for UI elements |
| `.font-mono` | JetBrains Mono for data |
| `.shadow-hard` | 3px hard offset shadow |
| `.shadow-hard-lg` | 4px hard offset shadow |
| `.shadow-hard-hover` | Shadow + translate on hover |
| `.newsprint-dots` | Dot grid background pattern |
| `.newsprint-texture` | Line grid pseudo-element |
| `.drop-cap` | Large first letter styling |
| `.label-editorial` | Uppercase tracking label |
| `.edition-meta` | Monospace metadata styling |
| `.ornament-divider` | Decorative ✧ ✧ ✧ divider |
| `.rule` | 2px top border divider |
| `.rule-thick` | 4px top border divider |
| `.img-editorial` | Grayscale → sepia on hover |

## File Structure

```
app/
├── app.css              # Design tokens, utilities, theme
├── components/
│   ├── ui/              # Base shadcn components (restyled)
│   │   ├── button.tsx   # Sharp, inverts on hover
│   │   ├── card.tsx     # Hard shadow hover
│   │   ├── input.tsx    # Sharp, underline variant
│   │   ├── badge.tsx    # Editorial variant
│   │   └── dialog.tsx   # Sharp with hard shadow
│   ├── landing/         # Landing page components
│   │   ├── landing-nav.tsx      # Edition bar, sharp logo
│   │   ├── hero-section.tsx     # Massive typography, dots
│   │   ├── feature-card.tsx     # Grid borders, icon boxes
│   │   ├── pricing-card.tsx     # Dashed dividers, badges
│   │   ├── testimonial-card.tsx # Large quote marks
│   │   ├── cta-section.tsx      # Inverted section
│   │   └── landing-footer.tsx   # Column borders, ornaments
│   └── planner/         # Meal planner components
│       ├── weekly-planner-grid.tsx  # Newspaper columns
│       └── day-column.tsx           # Editorial day headers
```

## Key Design Decisions

### Why Terracotta Over Red?

Pure editorial red (`#CC0000`) felt too aggressive for a cooking app. Terracotta maintains the authoritative feel while being warmer and more inviting—appropriate for food content.

### Why Keep Grain Texture?

The existing grain overlay complements the newsprint aesthetic perfectly, adding tactile depth without requiring changes.

### Why Not Zero Radius?

A 2px radius provides the sharp newsprint look while avoiding the slightly harsh feeling of perfectly square corners on interactive elements.

### Why Four Font Families?

Each serves a distinct purpose:
- **Playfair Display**: Drama, authority (headlines)
- **Lora**: Readability, editorial (body text)
- **Inter**: Clarity, utility (buttons, navigation)
- **JetBrains Mono**: Data, precision (timestamps)

## Dark Mode: Evening Edition

Dark mode represents the "evening edition" of the publication:
- Deep warm charcoal backgrounds
- Off-white paper text color
- Same hard shadows (inverted colors)
- Preserved contrast ratios

## Accessibility

- AAA contrast ratios for text
- Visible focus rings (2px, thick)
- 44px minimum touch targets
- Semantic HTML structure maintained
- Keyboard navigation supported

## Migration Notes

When updating components:
1. Remove `rounded-*` classes or use `rounded-sm` (0px)
2. Replace `shadow-sm/md/lg` with `shadow-hard` variants
3. Add `font-ui` to buttons and navigation
4. Add `font-body` to body text content
5. Use `border-ink` instead of `border-border` for emphasis
6. Add uppercase + tracking to labels
