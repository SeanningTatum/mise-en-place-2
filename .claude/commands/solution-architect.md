# Solution Architect

Turns the chosen solution direction into a coherent structural blueprint unifying data model, information architecture, and core user flows. The three layers are interdependent and must trace cleanly together.

Architecture request: $ARGUMENTS

## Prerequisites

Before running this skill, verify these inputs exist:
- `projects/[project-name]/01-discovery/DISCOVERY-REPORT.md`
- `projects/[project-name]/02-ux-strategy/UX-BRIEF.md`
- `projects/[project-name]/03-solution-exploration/SOLUTION-DIRECTIONS.md` (with Designer's Decision filled)

**STOP:** If SOLUTION-DIRECTIONS.md has no Designer's Decision section, ask the user to choose a direction first.

## Workflow

1. **Locate active project** — Find the project folder with most recent activity
2. **Load source documents** — Read Discovery Report, UX Brief, SOLUTION-DIRECTIONS.md to understand context and chosen direction
3. **Load references** — Read `references/UI-PATTERNS.md` and `references/DESIGN-PRINCIPLES.md`
4. **Load template** — Read `templates/04-solution-architecture/SOLUTION-ARCHITECTURE.md`
5. **Design three interdependent layers:**
   - **Data Model** — Define entities, relationships, attributes; validate completeness
   - **Information Architecture** — Map navigation, screen inventory, hierarchy, patterns
   - **Core User Flows** — Document happy paths, decision points, edge cases, screen states
6. **Self-check** — Trace every entity to a screen; walk every flow for dead ends; verify navigation consistency
7. **Write output** — Generate `projects/[project-name]/04-solution-architecture/SOLUTION-ARCHITECTURE.md`

## Output Structure

**SOLUTION-ARCHITECTURE.md** contains four parts plus validation:
- **Part 1: Data Model** — Entity definitions, relationships, attributes, ERD in mermaid syntax
- **Part 2: Information Architecture** — Navigation model, screen inventory, hierarchy depth, cross-cutting patterns
- **Part 3: Core Flows** — Happy paths with steps, decision points, edge cases, states per screen
- **Part 4: Cross-cutting Concerns** — Content patterns, reusable patterns, privacy/security considerations
- **Self-check section** — Traceability matrix, flow validation, metrics

## Quality Gates

- [ ] Walk core flow from entry to completion with no dead ends?
- [ ] Every screen has required data from the data model?
- [ ] Navigation patterns consistent across flows?
- [ ] Edge cases recoverable without exiting the flow?

## Critical Rules

- The 3 layers MUST be coherent: entities → screens → flows must trace cleanly
- Include a mermaid ERD diagram for the data model
- Every flow requires: happy path, decision points, edge cases, and states per screen
- No client checkpoint — this is internal design thinking
- **STOP after producing the architecture. Do NOT proceed to the next skill.**
