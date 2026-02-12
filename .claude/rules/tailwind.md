---
paths:
  - "app/app.css"
  - "**/*.tsx"
---

# Tailwind CSS and Color Variables Rules

## Core Principles
1. **ALWAYS prefer CSS variables over hardcoded colors** for consistency, maintainability, and dark mode support.
2. **ALWAYS use `cn()` for conditional or dynamic class names.** Import from `@/lib/utils`.

```tsx
import { cn } from "@/lib/utils";

// CORRECT
<div className={cn("p-4", isActive && "bg-primary", className)}>

// WRONG - Template literals
<div className={`p-4 ${isActive ? "bg-primary" : ""}`}>

// WRONG - Manual string concatenation
<div className={"p-4 " + (isActive ? "bg-primary" : "")}>
```

## Available CSS Variables (Semantic Colors - Use These First)
Defined in `app/app.css`, auto-switch for dark mode:

| Variable | Usage | Tailwind Class |
|----------|-------|----------------|
| `--background` | Page backgrounds | `bg-background` |
| `--foreground` | Primary text | `text-foreground` |
| `--card` | Card backgrounds | `bg-card` |
| `--primary` | Primary buttons, links | `bg-primary`, `text-primary` |
| `--secondary` | Secondary actions | `bg-secondary` |
| `--muted` | Muted backgrounds | `bg-muted` |
| `--muted-foreground` | Muted text | `text-muted-foreground` |
| `--accent` | Accent highlights | `bg-accent` |
| `--destructive` | Error/danger states | `bg-destructive` |
| `--border` | Borders | `border-border` |
| `--input` | Input backgrounds | `bg-input` |
| `--ring` | Focus rings | `ring-ring` |

### Text Hierarchy: `--text-heading`, `--text-body`, `--text-body-subtle`
### Brand Colors: `bg-brand-50` through `bg-brand-950`
### Sidebar: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.
### Charts: `--chart-1` through `--chart-5`

## Decision Flow
1. Check if a semantic variable exists (`bg-background`, `text-foreground`)
2. If not, check if a brand color works (`bg-brand-100`)
3. If a new color is truly needed, ADD IT TO `app/app.css` first in both `:root` and `.dark`, then register in `@theme inline` block

## Forbidden Patterns
- **NEVER** use template literals for class names
- **NEVER** use hardcoded hex/rgb/oklch in className attributes
- **NEVER** use Tailwind's default palette for semantic UI (`bg-blue-600` -> use `bg-primary`)
- **Exception:** Tailwind grays are OK for subtle layout borders/dividers

## Quick Reference: Common Replacements
| Instead of... | Use... |
|---------------|--------|
| `bg-white` | `bg-background` or `bg-card` |
| `text-gray-900` | `text-foreground` or `text-text-heading` |
| `text-gray-600` | `text-muted-foreground` |
| `bg-blue-600` | `bg-primary` |
| `border-gray-200` | `border-border` |
| `bg-gray-100` | `bg-muted` |
| `bg-red-500` | `bg-destructive` |

## Adding New CSS Variables
1. Name semantically (by purpose, not color): `--success`, not `--green`
2. Use OKLCH color format: `--success: oklch(0.72 0.19 142.5);`
3. Define both light and dark variants
4. Register in `@theme inline` to make available as Tailwind class

## File Reference
- CSS Variables: `app/app.css`
- Light mode: `:root { ... }`
- Dark mode: `.dark { ... }`
- Tailwind theme mapping: `@theme inline { ... }`
