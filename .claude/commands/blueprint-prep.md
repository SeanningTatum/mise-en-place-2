# Blueprint Prep

Merge Discovery Report, UX Brief, Solution Directions, and Solution Architecture into one unified context document optimized for AI UI generation tools (v0, Claude Code, Superdesign, Vibecode, Figma Make).

**Input:** All 4 previous docs + AI-TOOL-HANDOFF template
**Output:** `projects/[project-name]/04-solution-architecture/AI-TOOL-HANDOFF.md`

Blueprint request: $ARGUMENTS

---

## Workflow

### 1. Identify Active Project
- Check `projects/` for folders NOT named `_example-project`
- If multiple: ask user which one to process
- If none: ask user to create/complete a project folder first
- Confirm project name before proceeding

### 2. Verify All Prerequisites Exist
Ensure these 4 files are completed:
- `projects/[project-name]/01-discovery/DISCOVERY-REPORT.md`
- `projects/[project-name]/02-ux-strategy/UX-BRIEF.md`
- `projects/[project-name]/03-solution-exploration/SOLUTION-DIRECTIONS.md`
- `projects/[project-name]/04-solution-architecture/SOLUTION-ARCHITECTURE.md`

If any are missing: stop and ask user to complete them first.

### 3. Load Input Documents & Template
Read:
- All 4 project docs (listed above)
- Template: `templates/04-solution-architecture/AI-TOOL-HANDOFF.md`
- Reference: `references/DESIGN-PRINCIPLES.md` + `references/UI-PATTERNS.md`

### 4. Synthesize Into 6-Part Handoff

**Part 1: What We're Building**
- Extract: app overview, core problem, primary JTBD (from UX Brief)
- Add: target user constraints, design principles (from Discovery + UX Brief)
- Create: visual direction (from Solution Directions: tone, keywords, colors, typography, spacing, reference products)

**Part 2: Information Architecture**
- Extract: navigation model + screen inventory from Solution Architecture
- Include: screen purposes and priority flags

**Part 3: Data Model**
- Extract: entity summary + key relationships from Solution Architecture

**Part 4: Core Flows**
- Extract: happy path flows from Solution Directions
- Include: which screens are involved in each flow

**Part 5: Screen Specifications**
- For EACH screen in inventory: purpose, content hierarchy (primary/secondary/tertiary), key actions, all states (default/loading/empty/error), component suggestions
- Source: Solution Architecture screen specs + Solution Directions design patterns
- Requirement: every screen must have complete state specifications

**Part 6: Component & Content Patterns**
- Extract: cards, buttons, inputs, tone of voice patterns from Solution Directions
- Add: accessibility requirements (WCAG AA, 44x44pt targets, semantic HTML, focus states)
- Include: screen generation checklist from template

### 5. Write Handoff Document
Save to: `projects/[project-name]/04-solution-architecture/AI-TOOL-HANDOFF.md`

---

## Quality Signals

- **Self-Contained:** Reader needs zero other documents to generate screens
- **Completeness:** Every screen has purpose, hierarchy, actions, and ALL states specified
- **Visual Guidance:** Direction section covers tone, keywords, colors, typography, spacing, reference products
- **Consistency:** Language/terminology matches previous docs; no contradictions
- **AI-Ready:** Would produce correct output if pasted into v0 or Claude Code with zero additional context

---

## Critical Rules

- **STOP after the handoff.** Do not launch build or design-audit skills.
- **Self-contained:** This document must stand alone. A reader should need zero other files.
- **Every screen fully specified:** No screen can have missing states or vague actions.
- **Visual direction specificity:** Avoid generic guidance. Reference actual products and specify exact spacing/sizing.
- **Consistency check:** Flag contradictions between source docs and resolve before publishing.
