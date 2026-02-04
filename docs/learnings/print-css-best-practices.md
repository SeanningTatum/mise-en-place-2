---
title: Print CSS Best Practices
date: 2026-02-03
category: CSS
---

# Print CSS Best Practices

## Overview

This document covers CSS techniques for generating well-formatted print documents, particularly for HTML-to-print workflows like our meal guides and recipe cards.

## Key Concepts

### Page Break Properties

CSS provides several properties to control how content breaks across pages:

| Property | Purpose |
|----------|---------|
| `page-break-before` | Control breaks before an element |
| `page-break-after` | Control breaks after an element |
| `page-break-inside` | Control breaks within an element |
| `break-before` | Modern equivalent (use with page-break for compatibility) |
| `break-after` | Modern equivalent |
| `break-inside` | Modern equivalent |

**Values:**
- `auto` - Default, browser decides
- `avoid` - Try to avoid a page break
- `always` - Always insert a page break (before/after only)

### Common Pitfalls

#### 1. Overusing `page-break-inside: avoid` on Containers

**Problem:** Applying `page-break-inside: avoid` to large container elements causes the entire container to jump to a new page if it doesn't fit in the remaining space.

```css
/* ❌ BAD - entire section jumps to page 2 if content is long */
.section {
  page-break-inside: avoid;
}
```

**Result:** If the header takes 20% of page 1 and the section content is 90% of a page, the section moves entirely to page 2, leaving a huge gap on page 1.

**Solution:** Apply `page-break-inside: avoid` to smaller, atomic elements instead:

```css
/* ✅ GOOD - only individual items avoid breaking */
.section {
  /* no page-break-inside here */
}

.timeline-item {
  page-break-inside: avoid;
}
```

#### 2. Not Keeping Headers with Content

**Problem:** A section header appears at the bottom of a page while its content starts on the next page.

**Solution:** Use `page-break-after: avoid` on headers:

```css
header {
  page-break-after: avoid;
}

.section-title {
  page-break-after: avoid;
}
```

#### 3. Excessive Margins in Print

**Problem:** Margins that look good on screen (2.5rem, 3rem) create excessive whitespace in print.

**Solution:** Reduce margins specifically for print:

```css
header {
  margin-bottom: 2.5rem; /* screen */
}

@media print {
  header {
    margin-bottom: 1rem; /* print - more compact */
  }
}
```

## Recommended Pattern

### Base Styles (Screen + Print)

```css
header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e5e5;
}

.section {
  margin-bottom: 1.5rem;
}

.item {
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
}
```

### Print-Specific Overrides

```css
@media print {
  body {
    padding: 0.5in;
  }
  
  /* Keep header with content */
  header {
    margin-bottom: 1rem;
    page-break-after: avoid;
  }
  
  /* Section follows header, doesn't jump to new page */
  .section {
    page-break-before: avoid;
  }
  
  /* Individual items don't split across pages */
  .item {
    page-break-inside: avoid;
  }
  
  /* Cards stay together */
  .card {
    page-break-inside: avoid;
  }
}
```

## Real Example: Meal Guide Timeline

### Before (Problematic)

```css
.section {
  margin-bottom: 2.5rem;
  page-break-inside: avoid; /* ❌ Causes entire timeline to jump */
}
```

**Result:** Header on page 1, giant empty space, all content on pages 2-4.

### After (Fixed)

```css
.section {
  margin-bottom: 1.5rem;
  /* No page-break-inside here */
}

@media print {
  header {
    margin-bottom: 1rem;
    page-break-after: avoid;
  }
  
  .section {
    page-break-before: avoid;
  }
  
  .timeline-item {
    page-break-inside: avoid;
  }
}
```

**Result:** Content flows naturally from header, individual timeline items don't split across pages.

## Font Loading in Print Windows

When opening a print window with `window.open()`, fonts may not be loaded when `print()` is called.

```javascript
// Wait for fonts before printing
const printWindow = window.open("", "_blank");
printWindow.document.write(html);
printWindow.document.close();

// Allow fonts to load
setTimeout(() => {
  printWindow.print();
}, 500);
```

**Better approach:** Use the `document.fonts.ready` promise:

```javascript
printWindow.document.fonts.ready.then(() => {
  printWindow.print();
});
```

## Testing Print Styles

1. **Browser DevTools:** Chrome DevTools > More tools > Rendering > Emulate CSS media type: print
2. **Print Preview:** Cmd/Ctrl + P to see actual print output
3. **PDF Export:** Print to PDF to verify page breaks

## Files in This Project

Print-related files:
- `app/lib/print/meal-guide.ts` - Multi-course meal printing (timeline, shopping list, recipe cards)
- `app/lib/print/day-recipes.ts` - Daily meal plan printing

## Summary

| Do | Don't |
|----|-------|
| Apply `page-break-inside: avoid` to small atomic elements | Apply it to large containers |
| Use `page-break-after: avoid` on headers | Let headers orphan at page bottom |
| Reduce margins in `@media print` | Use screen margins for print |
| Test with actual print preview | Only test screen view |
| Keep related content together | Over-protect every element |

## References

- [MDN: page-break-inside](https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside)
- [MDN: CSS Paged Media](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_paged_media)
- [Smashing Magazine: Designing for Print with CSS](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
