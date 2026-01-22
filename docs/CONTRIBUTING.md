# Contributing to Generative Art Assistant

Thank you for your interest in contributing! This guide covers how to contribute to the project.

## Ways to Contribute

### 1. Add New Sketches

Create original generative art sketches in `sketches/`:

1. Use `/art:new-sketch` command for proper scaffolding
2. Follow standards in `.claude/expertise/sketch-standards.md`
3. Ensure deterministic randomness (see `hash-randomness.md`)
4. Document features and rarity system
5. Test with multiple hashes

### 2. Improve the Dataset

Enhance the knowledge base:

- Add new data fetchers in `scripts/`
- Improve processing in `process-dataset.js`
- Add technique detection patterns
- Expand the knowledge taxonomy

### 3. Build Platform Components

Extend the NFT platform builder:

- Smart contracts in `platform/contracts/`
- Frontend components in `platform/frontend/`
- Backend services in `platform/services/`

### 4. Enhance Claude Integration

Improve AI assistance:

- Add/improve slash commands in `.claude/commands/`
- Create specialized agents in `.claude/agents/`
- Expand expertise documentation in `.claude/expertise/`

### 5. Fix Bugs and Improve Code

- Report bugs via issues
- Submit fixes via pull requests
- Improve documentation
- Add tests

## Development Setup

See `docs/DEVELOPMENT.md` for detailed setup instructions.

Quick start:
```bash
git clone <repo>
cd generative-art-assistant
npm install
```

## Code Standards

### JavaScript/Node.js

- ES6+ syntax
- No semicolons (project convention)
- 2-space indentation
- Descriptive variable names
- Comments for complex logic

### Sketch Code

- Hash-based sfc32 PRNG for randomness
- Feature extraction before rendering
- SemVer versioning
- CHANGELOG.md for all changes

### Documentation

- Markdown for all docs
- Code examples where helpful
- Keep language clear and concise

## Commit Guidelines

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(sketch): add flow-fields sketch with noise-based particles
fix(renderer): handle WebGL context loss gracefully
docs(commands): add examples to art:new-sketch
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Make** your changes
4. **Test** thoroughly
5. **Commit** with clear messages
6. **Push** to your fork
7. **Open** a pull request

### PR Checklist

- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] No console.log statements left behind
- [ ] Works across browsers (if frontend)
- [ ] Sketch is deterministic (if adding sketch)

## Adding a New Sketch

1. **Create structure** using `/art:new-sketch`:
   ```
   sketches/my-sketch/
   ├── index.html
   ├── sketch.js
   ├── CLAUDE.md
   ├── README.md
   ├── CHANGELOG.md
   ├── versions/
   └── docs/
   ```

2. **Implement** with proper randomness:
   ```javascript
   // Use sfc32 PRNG, not Math.random()
   let R = initRandom(hash);
   let value = R();
   ```

3. **Document features** in `docs/FEATURES.md`:
   ```markdown
   | Feature | Common | Uncommon | Rare | Legendary |
   |---------|--------|----------|------|-----------|
   | Palette | Earth  | Neon     | Mono | Rainbow   |
   ```

4. **Test** with multiple hashes:
   - Verify determinism
   - Check variety
   - Look for edge cases

## Adding a Data Fetcher

New data sources should:

1. **Normalize** to common schema:
   ```javascript
   {
     id: "unique-id",
     name: "Project Name",
     artist_name: "Artist",
     description: "...",
     script: "// code...",
     script_type_and_version: "p5js@1.0.0",
     platform: "source-name"
   }
   ```

2. **Handle** rate limits and pagination
3. **Save** to `data/{source}-dataset.json`
4. **Document** in `docs/PLATFORM-FETCHERS.md`

## Adding an Agent

Agents in `.claude/agents/` should:

1. **Follow** the YAML frontmatter format:
   ```yaml
   ---
   name: agent-name
   description: What this agent does
   tools: Read, Write, Edit, Bash, Glob, Grep
   color: blue
   ---
   ```

2. **Include** sections:
   - `<role>` - Agent's purpose
   - `<knowledge_reference>` - Expertise files to reference
   - `<execution_flow>` - Step-by-step process
   - `<output_format>` - Expected output structure
   - `<success_criteria>` - Completion checklist

## Questions?

- Check existing documentation in `docs/`
- Review similar implementations
- Open an issue for discussion

## License

By contributing, you agree that your contributions will be licensed under the project's license.
