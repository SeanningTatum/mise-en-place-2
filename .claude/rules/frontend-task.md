# Frontend Task Guidelines

## Component Creation and Styling
- **NEVER use ambiguous hex color values in components unless absolutely necessary**
  - Prefer updating `globals.css` / `app/app.css` to add custom colors that align with ShadCN conventions
  - Use CSS custom properties (CSS variables) for consistent theming
  - If a custom color cannot be added, default to Tailwind's built-in color names
  - Avoid inline hex values like `#FF5733` or `rgb(255, 87, 51)`
  - When adding colors, follow ShadCN's CSS variable naming conventions (`--primary`, `--secondary`, `--muted`)
- **ALWAYS use the `cn()` utility for conditional class names**
  - Import `cn` from `@/lib/utils`
  - Use it to merge Tailwind classes conditionally: `className={cn("base-class", condition && "active-class")}`
  - This handles Tailwind class conflicts correctly using `tailwind-merge`

## Form Creation
- **ALWAYS use ShadCN and React Hook Form when creating forms**
  - Use ShadCN's Form component (`app/components/ui/form.tsx`)
  - Use React Hook Form (`useForm` hook) for form state management and validation
  - Use Zod for schema validation in combination with React Hook Form
  - Follow the pattern established in existing forms (login, signup forms)
  - Never create forms without these libraries

## Frontend Cache Management (React Query / tRPC)
- ALWAYS ensure that mutations invalidate relevant queries or update the cache directly
- Use `utils.invalidate()` to refetch data after mutations:
```typescript
const utils = api.useUtils();
const mutation = api.router.mutation.useMutation({
  onSuccess: () => {
    utils.router.listQuery.invalidate();
  }
});
```
- For high-frequency interactions, consider optimistic updates or direct cache updates
- If the mutation returns the created/updated item, you can manually update the query cache:
```typescript
const mutation = api.router.create.useMutation({
  onSuccess: (newItem) => {
    utils.router.list.setData({ someId }, (old) => {
      return old ? [...old, newItem] : [newItem];
    });
  }
});
```
- Checklist for new features:
  - Identify all queries that display the data being modified
  - Add invalidation or cache updates for ALL of them in `onSuccess`
  - Verify UI updates without page refresh

## Writing Playwright Tests for Frontend Features
- **ALWAYS write Playwright tests to verify functionality when implementing frontend features**
  - Create test files in `e2e/` directory following `*.spec.ts` pattern
  - Use `@playwright/test` for test framework
  - **ALWAYS prefer locating elements by id or data-testid attributes**
    - Use `getByTestId()` for `data-testid` attributes
    - Use `locator('#element-id')` for `id` attributes
    - Avoid `getByLabel()` and `getByText()` as they can be duplicated
  - Run tests with `bun run test:e2e` or `bunx playwright test`

## General Guidelines
- Always prefer `bun` over other package managers or runtime environments
- For any bash/terminal commands involving Node.js packages or scripts, use `bun`
