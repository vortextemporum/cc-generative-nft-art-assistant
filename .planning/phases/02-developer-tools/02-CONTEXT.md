# Phase 2: Developer Tools - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

MCP server for Claude Desktop integration + Puppeteer-based visual renderer. These tools enable Claude to help with generative art creation by accessing the 28k+ project knowledge base and analyzing visual output.

</domain>

<decisions>
## Implementation Decisions

### Creative Partnership Model
- AI proposes, human curates — tools should enable creative suggestions, not just answer questions
- Focus on teaching technique (the "why") rather than providing copy-paste code
- Support the full creative range: audiovisual, on-chain, games, text, meta/conceptual art — not just static visuals

### MCP Server (Claude Desktop)
- **Primary use:** Ideation, exploration, "show me how this works"
- **Default response:** Technique explanation with conceptual breakdown
- **On request:** Full code available ("show me the code" gets actual script)
- **Teaching approach:** Technique identification + parameter guidance + conceptual "why"
- **Plagiarism-conscious:** Emphasize learning over copying; explain rather than dump code

### Visual Renderer (Claude Code)
- **Primary use:** Implementation feedback, "does this look right"
- **Analysis types (Claude's discretion on when):**
  - Objective metrics: color distribution, composition, density
  - Subjective impression: aesthetic response, "feels chaotic", "has tension"
  - Comparison to references: relating to known works from the dataset
- Support iteration: user tweaks → renders → looks → tweaks again

### Search Result Enrichment
- Search returns metadata by default (not full code)
- Separate tool to retrieve full code when requested
- This supports "learn technique first, see code if needed" workflow

### Claude's Discretion
- When to show which type of analysis (objective/subjective/comparative)
- How much code detail to include in technique explanations
- Balance between teaching and providing direct answers

</decisions>

<specifics>
## Specific Ideas

**User's creative style:**
- Experiments with edge cases, errors, exaggerated parameters
- Finds beautiful images and wants to "kinda" replicate them (vibe, not copy)
- Ideas spark from: visual inspiration, technical curiosity, conceptual themes — varies by piece
- Multi-framework: p5.js, Three.js, shaders, vanilla JS, Tone.js — whatever fits
- Targets NFT platforms but experimentation comes first

**User's frustrations (tools should address):**
- Finding technique info is hard
- Iteration speed is slow
- Gap between idea and code is painful
- AI doesn't imagine or create like an artist

**The vision:**
- AI that understands the "why" behind aesthetic choices
- AI that proposes unexpected ideas (human curates/verifies)
- AI that has aesthetic judgment beyond technical correctness
- Human remains the curator of "outside the box" decisions

**Workflow split:**
- Claude Desktop: ideation, exploration, research
- Claude Code: implementation, iteration, feedback on output

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-developer-tools*
*Context gathered: 2026-01-18*
