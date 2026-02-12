# Solution Explorer

Generates 3 distinct, genuinely different solution approaches to solve your design problem. This is divergent thinking at work—exploring the solution space broadly before narrowing down, inspired by Apple's 10-3-1 concept exploration process.

Design problem: $ARGUMENTS

## Workflow

**Prerequisites:** Discovery Report AND UX Brief must exist.
- If missing: Run /discovery-agent first, then /ux-strategist.

**1. Validate Inputs**
- Locate active project folder
- Confirm DISCOVERY-REPORT.md and UX-BRIEF.md exist in project
- If either missing, tell user which command to run first

**2. Load Context**
- Read: references/UI-PATTERNS.md, references/DESIGN-PRINCIPLES.md, references/JTBD-GUIDE.md, references/ICP-GUIDE.md
- Read: templates/03-solution-exploration/SOLUTION-DIRECTIONS.md (blank template)
- Read: Project's DISCOVERY-REPORT.md and UX-BRIEF.md

**3. Research & Generate**
- Research how similar problems have been solved by successful products (real examples, not generic ones)
- Generate 3 fundamentally different solution approaches—not UI variations, but different interaction models, information architectures, or mental models
- Each direction must solve the core JTBD differently
- Each must work within ICP constraints

**4. Structure Each Direction**
- Concept name
- Core interaction model (how users engage)
- How it works (step-by-step flow)
- Key screens/states
- Strengths (real, specific trade-offs)
- Weaknesses (real, specific trade-offs)
- ICP fit (does it serve target user?)
- Complexity assessment (build/maintain effort)
- Inspiration (real product examples, not generic)

**5. Comparison & Recommendation**
- Create comparison matrix (3 directions x key criteria)
- Provide agent recommendation (which direction + why)
- **Designer's Decision section left blank** for designer to fill

**6. Output**
- Write to: projects/[project-name]/03-solution-exploration/SOLUTION-DIRECTIONS.md
- Do NOT proceed to next skill

## Quality Gates

Before outputting:
- Are the 3 directions genuinely different (not variations)?
- Do trade-offs feel real and specific?
- Can you articulate why one is better than another?
- Does each tie back to JTBD and ICP constraints?

## Resources

### references/
- **UI-PATTERNS.md** — Common interaction patterns
- **DESIGN-PRINCIPLES.md** — Brand/product design principles
- **JTBD-GUIDE.md** — Jobs-to-be-done framework
- **ICP-GUIDE.md** — Ideal customer profile constraints

### templates/
- **03-solution-exploration/SOLUTION-DIRECTIONS.md** — Blank template to fill
