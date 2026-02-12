# Implementation Plan: Modern Organic Editorial Design System Refactor

## Overview

Refactor the entire Mise En Place design system from "Playful Geometric" (vivid violet/pink, hard pop shadows, large rounded corners, bouncy animations) to "Modern Organic Editorial" (muted forest green, serif typography, 1px borders, no shadows, sharp corners, smooth editorial transitions). This is a visual-only refactor — no business logic, schema, or API changes.

---

## Tasks

### Task 1: Foundation — Font Imports (`root.tsx`)
**Approach:** Direct implementation
**Files:** `app/root.tsx`
**Description:**
Replace the Google Fonts stylesheet URL and preconnect links:
- **Remove:** Outfit + Plus Jakarta Sans
- **Add:** Playfair Display (serif, 300;400;500;600;700), Space Grotesk (sans, 300;400;500;600;700), Space Mono (mono, 400;700)
- Update the `links` export to load the new font families
- Keep preconnect to fonts.googleapis.com and fonts.gstatic.com

**No dependencies.**

---

### Task 2: Foundation — Complete CSS Theme Rewrite (`app.css`)
**Approach:** Direct implementation
**Files:** `app/app.css`
**Description:**
Complete rewrite of the CSS theme file. This is the highest-impact task — many downstream components will auto-inherit changes from redefined CSS variables and utility classes.

**Font tokens (in `@theme`):**
- `--font-display`: `"Playfair Display", Georgia, serif`
- `--font-sans`: `"Space Grotesk", system-ui, sans-serif`
- `--font-mono`: `"Space Mono", monospace`

**Radius system:**
- `--radius-sm`: 1px
- `--radius-md`: 2px
- `--radius-lg`: 2px
- `--radius-xl`: 2px

**Light mode palette (`:root`):**
| Variable | Value | Purpose |
|----------|-------|---------|
| `--background` | `#f7f6f2` | Warm cream |
| `--foreground` | `#1c1c1c` | Near-black |
| `--primary` | `#3d7068` | Muted forest green |
| `--primary-foreground` | `#ffffff` | White on primary |
| `--secondary` | `#f2f1ed` | Warm light gray |
| `--secondary-foreground` | `#1c1c1c` | Dark on secondary |
| `--muted` | `#f2f1ed` | Muted backgrounds |
| `--muted-foreground` | `#B4B4B4` | Secondary text |
| `--accent` | `#3d7068` | Same as primary |
| `--accent-foreground` | `#ffffff` | White on accent |
| `--border` | `#e5e4de` | 1px warm gray |
| `--border-strong` | `#1c1c1c` | Strong borders |
| `--card` | `#ffffff` | Card surface |
| `--card-foreground` | `#1c1c1c` | Card text |
| `--popover` | `#ffffff` | Popover bg |
| `--popover-foreground` | `#1c1c1c` | Popover text |
| `--input` | `#ffffff` | Input bg |
| `--ring` | `#3d7068` | Focus ring |
| `--info` | `#3b82f6` | Info blue |

**Dark mode palette (`.dark`):**
| Variable | Value |
|----------|-------|
| `--background` | `#121210` |
| `--foreground` | `#e8e7e3` |
| `--primary` | `#5a9d93` |
| `--primary-foreground` | `#121210` |
| `--secondary` | `#1e1e1c` |
| `--secondary-foreground` | `#e8e7e3` |
| `--border` | `#2a2a28` |
| `--border-strong` | `#e8e7e3` |
| `--card` | `#1a1a18` |
| `--card-foreground` | `#e8e7e3` |
| `--popover` | `#1a1a18` |
| `--popover-foreground` | `#e8e7e3` |
| `--muted` | `#1e1e1c` |
| `--muted-foreground` | `#707068` |
| `--accent` | `#5a9d93` |
| `--accent-foreground` | `#121210` |
| `--input` | `#1a1a18` |
| `--ring` | `#5a9d93` |

**Shadows:** Redefine ALL `shadow-pop-*` and `shadow-warm*` to `box-shadow: none`

**Animations:** Remove `popIn`, `wiggle`, `bounceIn`, `float`. Add:
- `fadeSlideUp` — editorial reveal (700ms, cubic-bezier(0.16, 1, 0.3, 1))
- `pulseDot` — subtle badge indicator
- `scanLine` — technical loading bar
- Keep `marquee` and `spin-slow`

**Utility classes to add:**
- `.ease-editorial` — `transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1)`
- `.font-mono-label` — Space Mono uppercase tracking shorthand
- `.bg-editorial-grid` — 40px square grid background
- `.mask-radial-fade` — radial transparency mask
- `.border-section` — 1px top border separator
- `.animate-fade-slide-up` + delay variants (100, 200, 300, 500ms)

**Utility classes to remove/redefine:**
- All `.shadow-pop-*` → `box-shadow: none`
- `.rounded-blob`, `.rounded-arch`, `.rounded-leaf` → remove
- `.bg-dot-grid`, `.bg-stripes` → replace with `.bg-editorial-grid`
- All `.animate-pop-in*`, `.animate-bounce-in`, `.animate-wiggle`, `.animate-float` → remove

**Typography base rules:** Change heading styles to `font-weight: 300` (light), `letter-spacing: -0.02em`. Change `a, button` transitions to `duration-700` with `cubic-bezier(0.16, 1, 0.3, 1)`.

**Surface utilities:** `.surface-elevated` border to `1px solid`, remove pop shadow. `.badge-status` border to `1px`, `border-radius: 2px`. `.alert` border-radius to `2px`, border-width to `1px`.

**Depends on:** Task 1 (fonts must be available)

---

### Task 3: Core ShadCN Components — Batch 1 (Button, Card, Input, Badge)
**Approach:** Direct implementation
**Files:** `app/components/ui/button.tsx`, `app/components/ui/card.tsx`, `app/components/ui/input.tsx`, `app/components/ui/badge.tsx`
**Description:**

**button.tsx:**
- Remove `rounded-full`, `shadow-pop`, any translate/rotate hover effects
- All variants: `rounded-sm border`
- Add `font-mono uppercase tracking-[0.15em]` to default/outline/secondary variants
- Transition: `duration-700` with editorial easing

**card.tsx:**
- Remove `rounded-xl`, `shadow-pop-muted`, any `hover:-rotate-1 hover:scale-[1.02]`
- Use `rounded-sm border border-border`
- No shadow on any variant

**input.tsx:**
- Bottom-border-only style: `border-0 border-b border-border bg-transparent rounded-none`
- Focus: `border-b-foreground`
- Mono placeholder styling

**badge.tsx:**
- Remove `rounded-full`, `shadow-pop-sm`
- Use `rounded-sm border font-mono uppercase tracking-[0.1em] text-[10px]`

**Depends on:** Task 2 (CSS variables must be updated)

---

### Task 4: ShadCN Components — Batch 2 (Dialog, Tabs, Select, Textarea, Label)
**Approach:** Direct implementation
**Files:** `app/components/ui/dialog.tsx`, `app/components/ui/tabs.tsx`, `app/components/ui/select.tsx`, `app/components/ui/textarea.tsx`, `app/components/ui/label.tsx`
**Description:**

**dialog.tsx:** Remove `rounded-xl`, `shadow-pop-lg`. Use `rounded-sm border`.
**tabs.tsx:** `rounded-sm`, add `font-mono uppercase tracking-[0.15em]` to triggers.
**select.tsx:** `border` not `border-2`, `rounded-sm`.
**textarea.tsx:** Match input style — `border-0 border-b border-border bg-transparent rounded-none` or standard `border rounded-sm`.
**label.tsx:** Add `font-mono uppercase tracking-[0.15em] text-[10px]`.

**Can run in PARALLEL with Task 3** (independent files). **Depends on:** Task 2.

---

### Task 5: ShadCN Components — Batch 3 (Remaining ~14 files)
**Approach:** Direct implementation
**Files:** `app/components/ui/alert.tsx`, `app/components/ui/alert-dialog.tsx`, `app/components/ui/popover.tsx`, `app/components/ui/sheet.tsx`, `app/components/ui/drawer.tsx`, `app/components/ui/progress.tsx`, `app/components/ui/scroll-area.tsx`, `app/components/ui/checkbox.tsx`, `app/components/ui/separator.tsx`, `app/components/ui/dropdown-menu.tsx`, `app/components/ui/command.tsx`, `app/components/ui/context-menu.tsx`, `app/components/ui/accordion.tsx`, `app/components/ui/tooltip.tsx`
**Description:**
Apply consistent pattern across all:
- `border-2` → `border` (1px)
- `rounded-full`/`rounded-xl`/`rounded-lg` → `rounded-sm` (2px)
- Remove all `shadow-pop-*` classes
- Remove hover translate/rotate effects
- Transition timing → `duration-700` with editorial easing

Specific notes:
- **alert.tsx:** `rounded-sm`, `border` not `border-2`
- **alert-dialog.tsx:** `rounded-sm`
- **popover.tsx:** `rounded-sm`
- **sheet.tsx:** Ensure 1px borders
- **drawer.tsx:** `rounded-sm` instead of `rounded-t-lg`
- **progress.tsx:** `rounded-sm`, 2px height editorial style
- **scroll-area.tsx:** Scrollbar thumb `rounded-sm`
- **checkbox.tsx:** Ensure `rounded-sm`
- **separator.tsx:** Verify uses `bg-border`

**Keep as-is:** `switch.tsx` (rounded-full ok for toggles), `avatar.tsx` (rounded-full ok for avatars)

**Can run in PARALLEL with Tasks 3 & 4.** **Depends on:** Task 2.

---

### Task 6: New Editorial Components
**Approach:** Direct implementation
**Files:** `app/components/editorial/background-grid.tsx`, `app/components/editorial/scan-line-progress.tsx`, `app/components/editorial/editorial-cta-button.tsx`, `app/components/editorial/editorial-emphasis.tsx`, `app/components/editorial/index.ts`
**Description:**
Create `app/components/editorial/` directory with barrel export.

**background-grid.tsx:**
- Fixed full-viewport grid overlay (40px squares)
- 3 structural vertical dividers at 25%, 50%, 75%
- Radial fade mask (center 40% opacity → 0% at edges)
- `pointer-events-none`, `z-0`

**scan-line-progress.tsx:**
- 2px container, `#3b82f6` animated line
- Infinite slide animation with editorial easing

**editorial-cta-button.tsx:**
- Forest green bg (`bg-primary`), Space Mono label, 10px uppercase
- Hover: tracking increases from 0.2em to 0.4em
- White/20% overlay slides up from bottom on hover
- Props: children, className, href (optional), onClick

**editorial-emphasis.tsx:**
- Replacement for `HandDrawnUnderline`
- Wraps text in italic serif span with thin 1px underline accent
- Props: children, className, variant ("italic" | "underline")

**index.ts:** Barrel export all components.

**Can run in PARALLEL with Tasks 3-5.** **Depends on:** Task 2 (uses CSS variables).

---

### Task 7: Landing Components (7 files)
**Approach:** Direct implementation
**Files:** `app/components/landing/landing-nav.tsx`, `app/components/landing/hero-section.tsx`, `app/components/landing/feature-card.tsx`, `app/components/landing/pricing-card.tsx`, `app/components/landing/testimonial-card.tsx`, `app/components/landing/cta-section.tsx`, `app/components/landing/landing-footer.tsx`
**Description:**

**landing-nav.tsx:**
- Logo: Serif italic "mise en place" text (replace rounded icon block)
- Links: `font-mono uppercase tracking-[0.3em] text-[10px]`
- CTA: Editorial button style (`rounded-sm`, mono label)
- Bottom border: `border-b border-border`

**hero-section.tsx:**
- Replace `HandDrawnUnderline` usage with `EditorialEmphasis` (italic serif)
- Headline: `font-display text-[9vw] font-light uppercase leading-[0.9]`
- Badge: `rounded-sm` with pulse-dot indicator
- Animations: `animate-fade-slide-up` (700ms editorial easing)
- Remove `font-handwritten` annotation → mono text or remove

**feature-card.tsx:**
- `rounded-sm border border-border`, no shadow
- Icon container: `rounded-sm border border-border` (no colored fill)
- Title: serif `font-display font-light`

**pricing-card.tsx:**
- `rounded-sm border border-border`, no shadow
- Price number: `font-display font-light text-4xl`
- Badge: `rounded-sm`

**testimonial-card.tsx:**
- `rounded-sm border border-border`, no shadow
- Quote text: serif italic
- 1px top border separator for author section

**cta-section.tsx:**
- Remove `rounded-[48px]`, gradient glow
- `border-t border-b border-border` separators
- Serif heading, mono CTA button

**landing-footer.tsx:**
- `border-t border-border` (replace solid bg-secondary)
- Section headings: `font-mono uppercase tracking-[0.3em]`
- Logo: Serif italic text

**Depends on:** Tasks 2, 3 (Button), 6 (EditorialEmphasis)

---

### Task 8: Landing Page Routes (4 files)
**Approach:** Direct implementation
**Files:** `app/routes/home.tsx`, `app/routes/lp/video-recipes.tsx`, `app/routes/lp/meal-planning.tsx`, `app/routes/lp/family-recipes.tsx`
**Description:**

**home.tsx:**
- Add `BackgroundGrid` component at top level
- Update hero props (remove `{underline:}` syntax if needed, update headline)
- Replace all `rounded-[32px]`/`rounded-[24px]` → `rounded-sm`
- Remove all `shadow-warm` references
- Replace `bg-secondary` section backgrounds → `border-t border-border`
- Update section headings to serif light
- ICP cards: editorial border cards

**LP routes (video-recipes, meal-planning, family-recipes):**
- Same pattern: `rounded-2xl`/`rounded-[32px]` → `rounded-sm`
- Remove `shadow-warm*`
- Replace section backgrounds with border separators
- Update inline animations to editorial easing
- Step indicators: `rounded-sm` with mono numbering

**Depends on:** Tasks 6 (BackgroundGrid), 7 (Landing components)

---

### Task 9: In-App Feature Components — Systematic Grep-and-Fix
**Approach:** Direct implementation (systematic)
**Files:** ~40 files across `app/components/recipes/`, `app/components/profile/`, `app/components/meals/`, `app/components/planner/`, `app/components/multi-course-meal/`, `app/components/loading/`, `app/routes/authentication/`, and more
**Description:**

Strategy: Use grep to find ALL remaining instances of old design patterns across the entire `app/` directory and fix them systematically.

**Search patterns to fix:**
1. `shadow-pop` → remove
2. `shadow-warm` → remove
3. `rounded-[` (custom rounded values > 4px) → `rounded-sm`
4. `rounded-2xl`, `rounded-xl`, `rounded-lg` → `rounded-sm` (except switch.tsx, avatar.tsx)
5. `border-2` → `border` (where it's decorative, not functional)
6. `animate-pop-in`, `animate-bounce-in`, `animate-wiggle`, `animate-float` → `animate-fade-slide-up`
7. `font-handwritten` → remove or replace with `font-mono`
8. `bg-dot-grid`, `bg-stripes` → `bg-editorial-grid` or remove

**Key files to hit:**
- `app/components/recipes/recipe-card.tsx`: `rounded-sm`, remove `shadow-warm-lg` hover
- `app/components/recipes/recipe-extractor.tsx`, `recipe-preview.tsx`: update inline rounded/shadow
- `app/routes/authentication/login.tsx`, `sign-up.tsx`: `rounded-sm` card, remove `shadow-warm`, remove gradient accent bar
- `app/components/planner/meal-slot.tsx`: update rounded/shadow
- `app/components/profile/public-recipe-card.tsx`, `public-profile-header.tsx`: update rounded/shadow
- `app/components/loading/chef-animation.tsx`: update animation to editorial style

**Depends on:** Task 2 (CSS foundation must be in place)

---

### Task 10: Cleanup — Remove Deprecated Components & Verify
**Approach:** Direct implementation
**Files:** `app/components/ui/hand-drawn-underline.tsx`, `app/components/ui/philosophy-card.tsx`, various
**Description:**
1. Check if `HandDrawnUnderline` is still imported anywhere after Task 7/8 changes. If not, delete the file.
2. Check if `PhilosophyCard` is still used. If not, delete.
3. Final grep for any remaining `shadow-pop`, `shadow-warm`, `rounded-blob`, `rounded-arch`, `rounded-leaf`, `bg-dot-grid`, `bg-stripes` across the codebase.
4. Verify no broken imports after deletions.

**Depends on:** Tasks 7, 8, 9

---

### Task 11: Build Verification
**Approach:** Bash command
**Description:** Run `bun run build` to verify no TypeScript/build errors after all changes.
**Depends on:** All previous tasks (1-10)

---

### Task 12: Principal Review
**Approach:** Run /principal-review
**Description:** Verify implementation matches the plan and assess implementation quality — consistent design token usage, no leftover old-aesthetic references, proper component API design for editorial components.
**Depends on:** Task 11

---

### Task 13: PR Validation
**Approach:** Run /pr-checker
**Description:** Run /pr-checker before creating PR.
**Depends on:** Task 12

---

## Parallelization Strategy

```
Task 1 (root.tsx fonts)
  ↓
Task 2 (app.css full rewrite)
  ↓
  ├── Task 3 (ShadCN Batch 1: button, card, input, badge) ──┐
  ├── Task 4 (ShadCN Batch 2: dialog, tabs, select, etc.)  ──┤
  ├── Task 5 (ShadCN Batch 3: remaining ~14 components) ────┤
  ├── Task 6 (New editorial components) ─────────────────────┤
  └── Task 9 (In-app grep-and-fix — can start early) ───────┤
                                                              ↓
                                                    Task 7 (Landing components)
                                                              ↓
                                                    Task 8 (Landing page routes)
                                                              ↓
                                                    Task 10 (Cleanup)
                                                              ↓
                                                    Task 11 (Build verification)
                                                              ↓
                                                    Task 12 (Principal review)
                                                              ↓
                                                    Task 13 (PR validation)
```

**Maximum parallelism:** Tasks 3, 4, 5, 6, and 9 can all run concurrently after Task 2 completes.

---

## Validation Requirements

- [ ] All CSS variables correctly updated (light + dark mode)
- [ ] No remaining `shadow-pop-*` or `shadow-warm*` usage in components
- [ ] No remaining `rounded-xl`/`rounded-lg`/`rounded-[>4px]` in components (except switch/avatar)
- [ ] All headings render in Playfair Display serif
- [ ] All body text renders in Space Grotesk sans
- [ ] All labels/buttons render in Space Mono mono
- [ ] `bun run build` succeeds with zero errors
- [ ] Dark mode palette correctly applied
- [ ] Editorial animations (fadeSlideUp) working on landing pages
- [ ] BackgroundGrid renders without blocking interactions
- [ ] No broken imports after deprecated component removal
