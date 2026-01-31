# Landing Page & Profile Sharing Release

**Date:** 2026-01-31

## Summary
Major feature release adding a public-facing landing page with multiple persona-targeted variants, public profile sharing with recipe visibility controls, recipe import functionality, and PostHog analytics integration.

## New Features

### Landing Page System
- **Hero Section** with animated CTA and value proposition
- **Feature Cards** highlighting core capabilities
- **Pricing Cards** for plan comparison
- **Testimonial Cards** with user quotes
- **CTA Section** and **Footer** components
- **Landing Nav** with responsive navigation
- **Persona-targeted landing pages:**
  - `/lp/video-recipes` - YouTube recipe enthusiasts
  - `/lp/meal-planning` - Meal planners
  - `/lp/family-recipes` - Recipe archivists/family cooks

### Public Profile Sharing
- **Profile Settings Page** (`/recipes/profile`) - Configure public profile with username, display name, bio
- **Username Validation** - 3-30 chars, lowercase, numbers, hyphens only
- **Recipe Visibility Controls** - Toggle individual recipes as public/private
- **Public Profile Page** (`/u/[username]`) - View any user's public recipes
- **Share Modal** - Copy link, social sharing buttons, QR code
- **Recipe Import** - Save public recipes to your own collection with attribution

### PostHog Analytics Integration
- Feature flags support for gradual rollouts
- Server-side and client-side event tracking
- React provider for client components

## Key Files

| File | Description |
|------|-------------|
| `app/components/landing/*.tsx` | Landing page component library |
| `app/routes/lp/*.tsx` | Persona-targeted landing page routes |
| `app/routes/recipes/profile.tsx` | Profile settings page |
| `app/routes/u.[username].tsx` | Public profile page |
| `app/routes/u.[username].recipe.[slug].tsx` | Public recipe detail page |
| `app/components/profile/*.tsx` | Profile sharing UI components |
| `app/repositories/profile.ts` | Profile data access layer |
| `app/trpc/routes/profile.ts` | Profile API routes |
| `app/posthog/*.ts` | PostHog integration files |
| `drizzle/0003_add_profile_sharing.sql` | Database migration for profiles |
| `e2e/profile-sharing.spec.ts` | E2E tests for profile sharing |

## Bug Fixes
None - initial release.

## Breaking Changes
None.

## Dependencies Added
- `posthog-js` - Client-side analytics
- `posthog-node` - Server-side analytics
