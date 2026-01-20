# /edit_sketch - Edit an existing generative art sketch

Edit sketches with automatic versioning, knowledge capture, and safe code practices.

## Arguments

```
/edit_sketch [sketchname]
```

- If `sketchname` provided: Focus on that sketch
- If omitted: List available sketches and ask which to focus on
- Once chosen, the sketch persists until explicitly changed

## Session State

Track current sketch focus in `.claude/sketch-session.json`:
```json
{
  "currentSketch": "molecular-brush",
  "lastEdited": "2025-01-20T12:00:00Z",
  "sessionHistory": ["molecular-brush", "wavelet-mosh"]
}
```

## Process

### 1. Sketch Selection

If no argument provided or sketch not found:

```
Available sketches:
1. data-stomp
2. genital-forms
3. glix-wavetable
4. magnetic-chains
5. molecular-brush
6. molecular-watercolor
7. pocket-city
8. stick-arena
9. wavelet-mosh

Which sketch would you like to edit?
```

### 2. Load Sketch Context

Once a sketch is selected:

1. Read the sketch's `CLAUDE.md` for context
2. Read `CHANGELOG.md` for version history
3. Check current version in `sketch.js` header
4. Read `docs/FEATURES.md` and `docs/TECHNICAL.md` if they exist
5. List files in `versions/` folder

Display summary:
```
Editing: molecular-brush
Current version: v2.6.2
Last change: Thin palette-derived frames
Files: sketch.js, index.html, 14 archived versions
```

### 3. Edit Workflow

For every edit request, follow this workflow:

#### Pre-Edit Checklist
- [ ] Read current `sketch.js` to understand code
- [ ] Identify what needs to change
- [ ] Plan the minimal change needed
- [ ] Determine version bump (major/minor/patch)

#### During Edit
- [ ] Make focused, minimal changes
- [ ] Test mentally for obvious errors
- [ ] Preserve existing functionality

#### Post-Edit Checklist
- [ ] Bump version in sketch.js header comment
- [ ] Archive previous version to `versions/vX.Y.Z-descriptor.js`
- [ ] Update `CHANGELOG.md` with changes
- [ ] Update `index.html` version dropdown if it exists
- [ ] Update `docs/LEARNINGS.md` with any discoveries
- [ ] Run quick validation if possible

### 4. Version Management (MANDATORY)

**Before ANY code change:**
```bash
# Archive current version
cp sketch.js versions/v{CURRENT}-{descriptor}.js
```

**Version number rules:**
- **Major** (3.0.0): Changes hash→output mapping (visual changes for same hash)
- **Minor** (2.7.0): New features, backward compatible
- **Patch** (2.6.3): Bug fixes, optimizations, no visual changes

**Update sketch.js header:**
```javascript
// Sketch Name vX.Y.Z - Brief description of this version
```

**Update CHANGELOG.md:**
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added/Changed/Fixed
- Description of changes
```

**Update index.html version dropdown** (if exists):
```html
<option value="sketch.js">vX.Y.Z - Description (current)</option>
<option value="versions/vX.Y.Z-prev.js">vX.Y.Z - Previous</option>
```

### 5. Knowledge Capture

Maintain `docs/LEARNINGS.md` in each sketch folder:

```markdown
# Learnings & Knowledge Base

## Techniques Discovered
- [Date] Technique description and code pattern

## Mistakes & Fixes
- [Date] What went wrong and how it was fixed

## Performance Optimizations
- [Date] Optimization description and impact

## p5.brush / Framework Notes
- [Date] Library-specific learnings

## MCP Research
- [Date] Information gathered from Context7 or other sources
```

**After each edit session**, append relevant learnings.

### 6. MCP Integration

Use Context7 MCP for:
- Looking up library documentation (p5.js, three.js, p5.brush, etc.)
- Researching techniques mentioned in the dataset
- Finding code patterns from Art Blocks/fxhash projects

**When to use MCP:**
- User asks "how do I..." for a library feature
- Implementing a technique you're unsure about
- Debugging library-specific issues
- Looking for optimization patterns

**MCP workflow:**
1. `mcp__context7__resolve-library-id` - Find the library ID
2. `mcp__context7__query-docs` - Query specific documentation

### 7. Safety Protocols

**Never break the code:**

1. **Read before edit**: Always read the full file or relevant section before modifying
2. **Minimal changes**: Make the smallest change that achieves the goal
3. **Preserve structure**: Don't reorganize code unless asked
4. **Test references**: If renaming, check all references
5. **Syntax check**: Mentally verify brackets, semicolons, quotes match
6. **Backup first**: Always archive before changing

**If unsure:**
- Ask clarifying questions
- Propose the change before implementing
- Suggest testing approach

**Recovery:**
- Previous versions always in `versions/` folder
- Can restore any version: `cp versions/vX.Y.Z.js sketch.js`

### 8. Update Tracking

Track edits in `.claude/edit-history.json`:
```json
{
  "molecular-brush": {
    "edits": [
      {
        "date": "2025-01-20",
        "from": "v2.6.1",
        "to": "v2.6.2",
        "description": "Thin frames, palette colors, artwork inline",
        "filesChanged": ["sketch.js", "index.html"]
      }
    ]
  }
}
```

## Agent Behavior

When launched, the edit_sketch agent should:

1. **Be conversational**: Ask what the user wants to change
2. **Confirm understanding**: Restate the request before implementing
3. **Show progress**: Use TodoWrite to track multi-step changes
4. **Report results**: Summarize what was changed and new version number
5. **Capture knowledge**: Update LEARNINGS.md with discoveries

## Quick Reference

| Task | Action |
|------|--------|
| Change sketch focus | `/edit_sketch newname` |
| Check current focus | `/edit_sketch` (will show current) |
| Make a change | Describe what you want to change |
| See version history | "show changelog" or "list versions" |
| Restore old version | "restore v2.5.0" |
| Research technique | "how do I do X in p5.brush" (triggers MCP) |

## Example Session

```
User: /edit_sketch molecular-brush
Agent: Editing molecular-brush (v2.6.2). What would you like to change?

User: Make the frame shadow more visible
Agent: I'll increase the frame shadow opacity. This is a visual tweak, so it'll be v2.6.3.

[Archives v2.6.2, makes change, updates changelog]

Agent: Done! v2.6.3 - Increased frame shadow visibility from 60 to 100 alpha.
Files: sketch.js, versions/v2.6.2-framed.js, CHANGELOG.md
```

## Files to Create/Update

When first editing a sketch that lacks these files:

1. **docs/LEARNINGS.md** - Create if missing
2. **CHANGELOG.md** - Create if missing (reconstruct from versions/ if possible)
3. **.claude/sketch-session.json** - Create/update for session tracking
4. **.claude/edit-history.json** - Create/update for edit tracking
