# Playful Geometric Design System

**Date**: 2026-02-09  
**Status**: Active  
**Replaces**: Modern Organic Editorial Design System

---

## Design Philosophy

**Playful Geometric** is the antidote to sterile, corporate minimalism. It creates an emotional connection through **optimism, clarity, and tactile fun**.

The core concept is **"Stable Grid, Wild Decoration"**. The content itself (text, forms) lives in clean, readable areas, but the world around it is alive with movement and shape. It references the **Memphis Group** (80s) but cleans it up for modern digital screens — removing the chaos while keeping the energy.

### The Vibe

**Friendly. Tactile. Pop. Energetic.**

It feels like a playground or a well-organized sticker book. It invites clicking. It smiles at you.

### Visual Signatures

- **Primitive Shapes**: Circles, triangles, squares, pill shapes, and squiggles used as background elements, masks, or icons
- **Hard Shadows**: Elements have a hard, offset drop shadow (no blur) giving a sticker or cut-out paper feel
- **Pattern Fills**: Polka dots, grid lines, and diagonal stripes used to fill shapes or backgrounds
- **Varied Radii**: Mixing fully rounded corners with sharp ones to create "leaf" shapes or asymmetric blobs

---

## Design Token System

### Colors (Light Mode)

A punchy, high-saturation palette anchored by strong neutrals.

| Token | Value | Purpose |
|-------|-------|---------|
| `background` | `#FFFDF5` | Warm cream/off-white (paper feel) |
| `foreground` | `#1E293B` | Slate 800 (softer than black) |
| `muted` | `#F1F5F9` | Slate 100 |
| `muted-foreground` | `#64748B` | Slate 500 |
| `primary` / `accent` | `#8B5CF6` | Vivid Violet (brand) |
| `primary-foreground` | `#FFFFFF` | White |
| `secondary` | `#F472B6` | Hot Pink (playful pop) |
| `tertiary` | `#FBBF24` | Amber/Yellow (optimism) |
| `quaternary` | `#34D399` | Emerald/Mint (freshness) |
| `border` | `#E2E8F0` | Slate 200 |
| `border-strong` | `#1E293B` | Slate 800 (chunky dark borders) |
| `input` | `#FFFFFF` | White |
| `card` | `#FFFFFF` | White |
| `ring` | `#8B5CF6` | Violet focus |

**Usage Rule**: Use `primary`/`accent` for primary actions. Use `secondary`, `tertiary`, and `quaternary` rotationally for decorative shapes, icons, or emphasized words to create a "confetti" effect.

### Typography

| Role | Font | Weights | Tailwind |
|------|------|---------|----------|
| **Headings** | Outfit | Bold (700), ExtraBold (800) | `.font-display` |
| **Body** | Plus Jakarta Sans | Regular (400), Medium (500), SemiBold (600) | Default sans |

**Scale Ratio**: 1.25 (Major Third) — melodic and harmonious.

Headings use `letter-spacing: -0.01em` and `line-height: 1.1`.

### Radius & Border

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `8px` | Small elements, chips |
| `radius-md` | `16px` | Inputs, containers |
| `radius-lg` | `24px` | Cards, modals |
| `radius-xl` | `9999px` | Pills, buttons, badges |
| `border-width` | `2px` | Default — chunky |

**Special Blob Radii** (utility classes):

- `.rounded-blob` — Speech bubble: `24px 24px 24px 0px`
- `.rounded-blob-alt` — Alt speech bubble: `0px 24px 24px 24px`
- `.rounded-arch` — Arch shape: `9999px 9999px 0px 0px`
- `.rounded-leaf` — Leaf shape: `0px 24px 0px 24px`

### Shadows & Effects

**The "Pop" Shadow (Hard Shadow)** — no blur, solid offset:

| Class | Shadow | Usage |
|-------|--------|-------|
| `.shadow-pop` | `4px 4px 0px #1E293B` | Default elements |
| `.shadow-pop-sm` | `2px 2px 0px #1E293B` | Small elements, badges |
| `.shadow-pop-lg` | `8px 8px 0px #1E293B` | Large elements, dialogs |
| `.shadow-pop-hover` | `6px 6px 0px #1E293B` | Hover lift effect |
| `.shadow-pop-active` | `2px 2px 0px #1E293B` | Active/press effect |
| `.shadow-pop-accent` | `4px 4px 0px #8B5CF6` | Focus state (violet) |
| `.shadow-pop-muted` | `8px 8px 0px #E2E8F0` | Default cards |
| `.shadow-pop-pink` | `8px 8px 0px #F472B6` | Featured cards |
| `.shadow-pop-violet` | `8px 8px 0px #8B5CF6` | Primary cards |
| `.shadow-pop-yellow` | `8px 8px 0px #FBBF24` | Highlighted cards |
| `.shadow-pop-mint` | `8px 8px 0px #34D399` | Success cards |

### Background Patterns

| Class | Description |
|-------|-------------|
| `.bg-dot-grid` | 24px spaced dot grid |
| `.bg-dot-grid-dense` | 16px spaced dot grid |
| `.bg-stripes` | 45deg diagonal stripes |
| `.bg-grid-lines` | 32px orthogonal grid |

---

## Component Stylings

### Buttons ("Candy Buttons")

**Primary Button**:
- Bg: `primary` (violet)
- Text: white, font-weight: 700
- Radius: `rounded-full` (pill)
- Border: 2px solid dark (`border-border-strong`)
- Shadow: `shadow-pop` (4px 4px hard)
- Hover: Lifts up-left 2px, shadow extends to 6px
- Active: Presses down-right 2px, shadow shrinks to 2px

**Secondary/Outline Button**:
- Bg: transparent
- Text: foreground
- Border: 2px solid dark
- Radius: `rounded-full`
- Hover: Fills with `tertiary` (yellow)

**All button variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

### Cards ("Sticker Cards")

- Bg: white
- Border: 2px solid dark (`border-border-strong`)
- Radius: `rounded-xl`
- Shadow: `shadow-pop-muted` (8px 8px slate)
- Hover: Rotate -1deg, scale 1.02 (wiggle effect)
- Title: Bold Outfit font (`font-display`)

For featured cards use colored shadows: `.shadow-pop-pink`, `.shadow-pop-violet`, `.shadow-pop-yellow`

### Inputs

- Bg: white
- Border: 2px solid `border`
- Radius: `rounded-lg`
- Shadow: `4px 4px 0px transparent` (hidden initially)
- Focus: border turns `primary`, shadow becomes `shadow-pop-accent`
- Labels: Bold weight

### Badges

- Pill shape with `rounded-full`
- 2px border (`border-border-strong`)
- `shadow-pop-sm` on default, secondary, accent, tertiary, quaternary
- Bold uppercase text with wide tracking
- Variants: default (violet), secondary (pink), tertiary (yellow), quaternary (mint), plus semantic

### Alerts

- `rounded-lg` with `border-2`
- `shadow-pop-sm` for depth
- Semantic variants with colored borders (not just tinted)

---

## Layout Strategy

### General

- **Container**: `max-w-6xl` (generous width)
- **Spacing**: `py-24` (96px) — spacious, filled with patterns
- **Grid**: 12-column logic, grouped into big blocks (6/6 or 4/4/4)

### Unique Section Layouts

1. **Hero**: Text left, image right. Large yellow circle behind text. Dotted pattern behind image. Image has blob mask.
2. **Features**: Grid of 3 cards with alternating colored headers (violet, pink, yellow). Optional dashed SVG connector lines.
3. **Pricing**: Middle card scaled up (1.1) with rotated yellow star badge "MOST POPULAR".

---

## Effects & Animation

**Feel**: Bouncy, Elastic, Fun.

| Animation | Class | Description |
|-----------|-------|-------------|
| Pop In | `.animate-pop-in` | Scale 0.8→1.05→1 with bounce |
| Bounce In | `.animate-bounce-in` | TranslateY + scale bounce |
| Wiggle | `.animate-wiggle` | Rotation: 0→3→-3→0 degrees |
| Float | `.animate-float` | 4s infinite vertical bob |
| Marquee | `.animate-marquee` | Infinite horizontal scroll |
| Slow Spin | `.animate-spin-slow` | 12s linear rotation |

**Delay variants**: `animate-pop-in-delay-100`, `animate-pop-in-delay-200`, `animate-pop-in-delay-300`, `animate-pop-in-delay-500`

**Transition curve**: `cubic-bezier(0.34, 1.56, 0.64, 1)` — bouncy overshoot, applied globally to `a` and `button` elements.

---

## Iconography (Lucide React)

- **Stroke Width**: `2.5px` (bold/chunky)
- **Style**: Round line caps, round line joins
- **Color**: Often white inside a colored circle, or the dark foreground color
- **Usage**: Enclosed in shapes. Never floating alone. A "Check" icon isn't just a check; it's a check inside a green circle.

```tsx
<div className="flex items-center justify-center w-10 h-10 rounded-full bg-quaternary">
  <CheckIcon className="size-5 text-white" strokeWidth={2.5} />
</div>
```

---

## Responsive Strategy

- **Mobile**:
  - Stack everything
  - Reduce "pop" shadows to 2px (use `shadow-pop-sm`)
  - Keep buttons big and tappable (min 48px height)
  - Hide complex background floating shapes that might overlap text

---

## Accessibility & Best Practices

- **Contrast**: Text is slate-800 on off-white/white — AAA compliant
- **Color**: Never rely *only* on color. Use shapes and text labels
- **Motion**: Respect `prefers-reduced-motion`. All animations are disabled via the CSS `@media (prefers-reduced-motion: reduce)` rule
- **Focus**: High-contrast focus state with thick colored border + hard shadow

---

## File Reference

| File | Purpose |
|------|---------|
| `app/app.css` | All CSS variables, animations, utility classes |
| `app/root.tsx` | Font loading (Outfit + Plus Jakarta Sans) |
| `app/components/ui/button.tsx` | Button component with candy variants |
| `app/components/ui/card.tsx` | Sticker card component |
| `app/components/ui/input.tsx` | Input with hard shadow focus |
| `app/components/ui/textarea.tsx` | Textarea matching input style |
| `app/components/ui/badge.tsx` | Badge with confetti color variants |
| `app/components/ui/alert.tsx` | Alert with semantic hard borders |
| `app/components/ui/select.tsx` | Select with matching geometric style |
| `app/components/ui/label.tsx` | Bold label styling |
| `app/components/ui/dialog.tsx` | Dialog with pop shadow |
| `.cursor/rules/tailwind.mdc` | Tailwind/styling cursor rule |

---

## Migration Notes (from Modern Organic Editorial)

| Old (Organic) | New (Playful Geometric) |
|----------------|------------------------|
| DM Serif Display | Outfit |
| Inter | Plus Jakarta Sans |
| Reenie Beanie (handwritten) | Removed |
| Soft shadows (`shadow-warm`) | Hard shadows (`shadow-pop`) |
| Large organic radii (`rounded-[64px]`) | Geometric radii (`rounded-xl`, `rounded-full`) |
| Sage green accent (`#CBD0B5`) | Vivid violet (`#8B5CF6`) |
| Muted earth tones | Punchy high-saturation palette |
| Paper texture overlay | Dot grid / stripe patterns |
| Fade-slide-up animations | Pop-in / bounce-in animations |
| Grayscale hover effect | Wiggle / lift hover effects |
| 1px borders | 2px chunky borders |
