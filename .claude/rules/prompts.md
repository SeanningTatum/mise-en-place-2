---
paths:
  - "app/lib/prompts/**"
---

# AI Prompts

## Overview
AI prompts are organized as exported constant strings with clear instructions for output format and structure.

## File Organization
- One prompt per file in `app/prompts/`, named by purpose
- Export as `SCREAMING_SNAKE_CASE` constant
- Include clear output format instructions

## Prompt Template
```typescript
export const MY_TASK_PROMPT = `You are an expert [role]. Your task is to [task description].

Based on the input provided, extract/generate the following:

1. "field1": Description of what this field should contain.
2. "field2": Description of what this field should contain.
3. "field3": An array of [items description].

CRITICAL: Return ONLY valid JSON. No markdown formatting, no explanations.

Example Output:
{
  "field1": "Example value...",
  "field2": "Example value...",
  "field3": [
    "Item 1...",
    "Item 2..."
  ]
}
`;
```

## Key Patterns

### Clear Role Definition
Start with who the AI should be:
```typescript
export const ANALYSIS_PROMPT = `You are an expert data analyst...`;
```

### Structured Output Requirements
Specify exact JSON structure expected.

### Examples
Include example outputs for clarity.

### Constraints
Be explicit about format constraints:
```typescript
export const SUMMARY_PROMPT = `...
CRITICAL:
- Return ONLY valid JSON
- No markdown formatting
- No additional explanations
- Keep summary under 100 words
`;
```

## Usage Pattern
```typescript
import { MY_TASK_PROMPT } from "@/prompts/my-task";

const response = await ai.generateContent({
  contents: [
    { role: "user", parts: [{ text: MY_TASK_PROMPT }] },
    { role: "user", parts: [{ text: inputData }] },
  ],
});
const result = JSON.parse(response.text());
```

## Best Practices
1. Be specific - Vague prompts produce inconsistent results
2. Show examples - Concrete examples improve output quality
3. Specify format - Explicitly state JSON, markdown, or plain text
4. Set constraints - Define length limits, required fields, etc.
5. Test variations - Iterate on prompts with real data
