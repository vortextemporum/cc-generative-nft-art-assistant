# Phase 1: Semantic Search - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable semantic search across the combined 28k+ project knowledge base. This is an inspiration and technique discovery tool for creating unique, high-quality generative art. Users search to find approaches, aesthetics, and code patterns — not just metadata.

</domain>

<decisions>
## Implementation Decisions

### Search Interface
- CLI + programmatic API (Claude's discretion on structure)
- Multiple output formats: JSON for machines, table for humans, markdown for docs
- Query styles supported:
  - Natural language ("moody gradients with organic movement")
  - Technique-based ("flow fields", "recursive subdivision")
  - Style similarity ("like Fidenza but with circles")
  - Code pattern search ("uses noise()", "particle systems")
- Should understand creative intent, not just keyword matching

### Result Presentation
- Each result includes: visual preview (link/thumbnail), technique tags, code snippet (key technique), artist + stats
- Paginated results: start with 10, option to load more
- Always include links to original project on Art Blocks/fxhash
- Similarity scores: Claude's discretion on display format

### Embedding Strategy
- Embed all content types: name + description, tags + aesthetics, code structure, full script (chunked)
- Smart chunking for large scripts: split by functions/classes, preserve semantic units
- Quality-first model selection (embeddings generated once, worth the time)
- Hybrid update strategy: incremental by default, full regeneration command available

### Search Scope
- Default: all 28k projects
- Filter options: platform, framework, artist, tags/aesthetics/concepts
- Code pattern search integrated (not separate command)
- Own sketches: --include-local flag to add personal sketches to search

### Claude's Discretion
- Interactive vs single-query mode
- Exact CLI flag naming and structure
- Similarity score display format
- Model selection for embeddings
- Chunking implementation details

</decisions>

<specifics>
## Specific Ideas

- **Purpose**: "I will mainly use it to create very professional, unique, artistic projects, which do not look like vibe coded, but researched and crafted with care. I want to find my own unique aesthetics."
- **Vision**: "Display human creativity at its finest, assisting with AI"
- Dataset is living — may add new sketches, projects, and want fetchers to include newly uploaded Art Blocks/fxhash projects
- Search should cover "anything related to multimedia" including things not yet in the dataset

</specifics>

<deferred>
## Deferred Ideas

- Data fetcher updates (refreshing Art Blocks/fxhash with new projects) — could be Phase 2 enhancement or separate maintenance task
- Adding personal sketches to dataset (embedding own work) — infrastructure for this, but --include-local keeps it optional

</deferred>

---

*Phase: 01-semantic-search*
*Context gathered: 2026-01-18*
