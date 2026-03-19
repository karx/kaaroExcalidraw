# Kaaro Excalidraw

Tooling around Excalidraw — library pipeline, CLI, Claude skills, and static site.

## Project structure

pnpm workspace monorepo:
- `packages/core` — Types, Zod validators, builders, serialization for .excalidraw/.excalidrawlib formats
- `packages/cli` — CLI commands: `validate`, `bundle`, `registry`
- `packages/site` — Vite+React static site (library browser + CDN)
- `libraries/` — Source .excalidraw files organized by library (each subdir has `meta.json`)
- `.claude/skills/` — Claude Code skills for generating and managing Excalidraw content

## Commands

```bash
pnpm test              # Run all tests (vitest, 50 tests)
pnpm build             # Build core + CLI
pnpm build:site        # Bundle libraries + build static site
pnpm build:all         # Build everything
pnpm dev:site          # Bundle libraries + dev server

# CLI (via tsx during dev)
npx tsx packages/cli/src/index.ts validate <file>
npx tsx packages/cli/src/index.ts bundle <dir> -o <output.excalidrawlib>
npx tsx packages/cli/src/index.ts registry <librariesRoot> -o <outputDir>
```

## Claude Skills

- `/excalidraw-generate <description>` — Generate .excalidraw scenes from natural language
- `/excalidraw-library <action>` — Create/modify library files
- `/excalidraw-new-library <name> <description>` — Scaffold a new library workspace

## Conventions

- **Spec-driven development**: Write tests first, then implement
- **One .excalidraw file per library item** in authoring workspace
- Each library directory has a `meta.json` with name, authors, description
- `.excalidrawlib` files in `libraries/` are gitignored (generated artifacts)
- Core package has zero React/DOM dependencies (Node-only)
- CLI resolves `@kaaro/core` via workspace link; vitest uses alias to source
