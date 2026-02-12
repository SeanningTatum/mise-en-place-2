# Discovery Agent

Transform raw client materials into a comprehensive, design-ready discovery report that uncovers market context, user jobs, customer constraints, and strategic opportunities.

**Input:** Client materials (transcripts, business plans, competitive info) + project context
**Output:** `projects/[project-name]/01-discovery/DISCOVERY-REPORT.md`

Discovery request: $ARGUMENTS

---

## Workflow

### 1. Identify Active Project
- Check `projects/` for folders that are NOT `_example-project`
- If multiple exist: ask user which one to analyze
- If none exist: ask user to create a project folder first
- Confirm project name with user

### 2. Gather Source Materials
- Read ALL files in `projects/[project-name]/00-inputs/` (client materials)
- Read reference guides:
  - `references/JTBD-GUIDE.md`
  - `references/ICP-GUIDE.md`
  - `references/DESIGN-PRINCIPLES.md`
  - `references/UI-PATTERNS.md` (optional, for context)
- Read template: `templates/01-discovery/DISCOVERY-REPORT.md`

### 3. Conduct Web Research
Research market, competitors, and user context relevant to the project using WebSearch and WebFetch tools. Focus on:
- Market size and trends
- Competitive landscape and positioning
- User behavior and pain points
- Industry standards and emerging practices

Use `WebSearch` for broad market discovery:
```
WebSearch: "[industry] market size trends 2026"
WebSearch: "[product type] competitors comparison"
```

Use `WebFetch` for extracting specific competitor information:
```
WebFetch:
  url: "https://competitor.com"
  prompt: "Extract key features, pricing, target audience, and value proposition"
```

### 4. Synthesize Findings
Fill the template with:
- **Executive Summary:** Clear problem statement and strategic direction
- **Market Context:** Size, trends, competitive positioning
- **User Research Synthesis:** Synthesized insights from materials + research
- **JTBD Framing:** Jobs formatted as "When [situation], I want to [action], So I can [outcome]"
- **Ideal Customer Profiles:** Constraints-first (cognitive, time, technical, emotional, physical) with design implications
- **Current State Analysis:** What exists today and its limitations
- **Opportunity Analysis:** Structured as Eliminate/Automate/Augment/Preserve
- **Anti-Goals:** What NOT to do
- **Open Questions:** Unknowns that would change direction if answered
- **Confidence Assessment:** Honest confidence levels (Low/Medium/High) for key findings
- **Sources:** References to materials and research

### 5. Write Report
Save completed report to: `projects/[project-name]/01-discovery/DISCOVERY-REPORT.md`

---

## Quality Signals

- **Clarity:** Can someone unfamiliar with the project understand the problem fully using only this document?
- **JTBD Specificity:** Are jobs specific enough to design against? (Not vague "improve efficiency" statements)
- **ICP Actionability:** Do constraints have direct design implications? (Not generic attributes)
- **Opportunity Concreteness:** Are opportunities specific, not generic boilerplate?
- **Honest Confidence:** Are confidence levels marked "Low" when based on assumptions or thin evidence?

---

## Critical Rules

- **STOP after the report.** Do not proceed to the next skill (/ux-strategist).
- **Flag open questions** that would change strategic direction if answered differently.
- **Use JTBD format:** "When [situation], I want to [action], So I can [outcome]"
- **Use ICP format:** Constraints-first with clear design implications for each constraint.
- **Mark confidence honestly:** Low/Medium/High based on evidence quality.
