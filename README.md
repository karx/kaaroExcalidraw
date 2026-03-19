# Kaaro Excalidraw
A toolkit for power users of [Excalidraw](https://excalidraw.com) — author, validate, bundle, and share reusable component libraries with a CLI pipeline, a browsable static site, and Claude Code skills for AI-assisted diagram generation.

## What's included

### Library Pipeline (CLI)

A command-line toolkit to manage `.excalidrawlib` files — the format Excalidraw uses for reusable component libraries.

| Command | Purpose |
|---------|---------|
| `kaaro validate <file>` | Validate `.excalidraw` or `.excalidrawlib` files against the spec |
| `kaaro bundle <dir> -o <out>` | Bundle a directory of `.excalidraw` files into a single `.excalidrawlib` |
| `kaaro registry <libs> -o <dir>` | Generate a `registry.json` index + CDN-ready output from all libraries |

### Core Library (`@kaaro/core`)

TypeScript types, [Zod](https://zod.dev) validators, and builder functions for programmatically creating Excalidraw content. Zero React/DOM dependencies — runs anywhere Node runs.

- **Types** — `ExcalidrawFile`, `ExcalidrawLibFile`, `LibraryItem`, `ExcalidrawElement`, `Registry`
- **Validators** — Schema-based validation with detailed error messages
- **Builders** — `createElement()`, `createLibraryItem()`, `createLibFile()`, `createSceneFile()`
- **Serialization** — Read/write `.excalidraw` and `.excalidrawlib` files with built-in validation

### Static Site

A Vite + React library browser that hosts your libraries as a searchable, downloadable catalog. Deploy to GitHub Pages, Netlify, or any static host.

### Claude Code Skills

AI-powered skills for generating and managing Excalidraw content directly from your terminal:

| Skill | What it does |
|-------|-------------|
| `/excalidraw-generate` | Generate `.excalidraw` scenes from natural language descriptions |
| `/excalidraw-library` | Add items to, modify, or create `.excalidrawlib` files |
| `/excalidraw-new-library` | Scaffold a new library workspace with starter items |

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [pnpm](https://pnpm.io) v10+

### Install

```bash
git clone <your-repo-url>
cd kaaroExcalidraw
pnpm install
```

### Verify

```bash
pnpm test       # 50 tests across core + CLI
pnpm build      # compile TypeScript
```

---

## Usage

### Validate a file

Check that an `.excalidraw` or `.excalidrawlib` file conforms to the Excalidraw JSON spec:

```bash
npx tsx packages/cli/src/index.ts validate path/to/file.excalidraw
# ✓ Valid: path/to/file.excalidraw

npx tsx packages/cli/src/index.ts validate path/to/file.excalidrawlib
# ✓ Valid: path/to/file.excalidrawlib
```

Validation catches missing fields, wrong types, invalid element types, and structural issues. Exit code `1` on failure — useful in CI and pre-commit hooks.

### Author a library

Libraries are authored as directories of individual `.excalidraw` files. Each file becomes one library item.

**1. Create the library directory:**

```
libraries/
└── my-icons/
    ├── meta.json
    ├── server.excalidraw
    ├── database.excalidraw
    └── cloud.excalidraw
```

**2. Add `meta.json`:**

```json
{
  "name": "My Icons",
  "description": "Custom icons for architecture diagrams",
  "authors": [{ "name": "Your Name", "url": "https://github.com/you" }]
}
```

**3. Create `.excalidraw` files:**

Each file contains a single Excalidraw scene. The easiest way is to:
- Draw the component in [excalidraw.com](https://excalidraw.com)
- Export as `.excalidraw` (File → Save to disk)
- Place it in your library directory

Or generate programmatically (see [Programmatic creation](#programmatic-creation) below).

**4. Bundle:**

```bash
npx tsx packages/cli/src/index.ts bundle libraries/my-icons -o libraries/my-icons/my-icons.excalidrawlib
# ✓ Bundled 3 items → libraries/my-icons/my-icons.excalidrawlib
```

**5. Validate:**

```bash
npx tsx packages/cli/src/index.ts validate libraries/my-icons/my-icons.excalidrawlib
# ✓ Valid
```

The resulting `.excalidrawlib` file can be loaded directly into Excalidraw via the library panel.

### Generate a registry

When you have multiple libraries, generate a registry for the static site:

```bash
npx tsx packages/cli/src/index.ts registry libraries -o packages/site/public/cdn
# ✓ Generated registry with 3 libraries
```

This produces:
- `registry.json` — index of all libraries with metadata
- `libraries/<name>/<name>.excalidrawlib` — copies of each bundled library

### Build and preview the site

```bash
pnpm build:site    # bundle libraries → build static site
pnpm dev:site      # bundle libraries → start dev server
```

The site serves at `http://localhost:5173` with:
- Searchable library catalog
- Item tags showing what each library contains
- Direct `.excalidrawlib` download links

### Deploy

**GitHub Pages** — the included CI workflow (`.github/workflows/ci.yml`) automatically deploys on push to `main`. Enable GitHub Pages → Source: GitHub Actions in your repo settings.

**Netlify** — point to `packages/site/dist` as the publish directory, with build command `pnpm install && pnpm build:site`.

---

## Programmatic creation

Use `@kaaro/core` builders to create Excalidraw content in code:

```typescript
import {
  createElement,
  createLibraryItem,
  createLibFile,
  createSceneFile,
  writeExcalidrawFile,
  writeLibFile,
} from "@kaaro/core";

// Create elements
const box = createElement({
  type: "rectangle",
  x: 0, y: 0, width: 160, height: 80,
  backgroundColor: "#a5d8ff",
  roughness: 0,
});

const label = createElement({
  type: "text",
  x: 20, y: 25, width: 120, height: 30,
  text: "Server",
  fontSize: 20,
  fontFamily: 1,  // 1=Virgil, 2=Helvetica, 3=Cascadia
});

// Write a scene
const scene = createSceneFile([box, label]);
await writeExcalidrawFile("diagram.excalidraw", scene);

// Or bundle into a library
const item = createLibraryItem({ name: "Server", elements: [box, label] });
const lib = createLibFile([item]);
await writeLibFile("my-lib.excalidrawlib", lib);
```

### Element types

| Type | Use for | Key properties |
|------|---------|----------------|
| `rectangle` | Boxes, containers, cards | `width`, `height`, `backgroundColor` |
| `ellipse` | Circles, ovals, start/end nodes | `width`, `height` |
| `diamond` | Decision points, conditions | `width`, `height` |
| `text` | Labels, titles, annotations | `text`, `fontSize`, `fontFamily` |
| `arrow` | Connections with direction | `points`, `endArrowhead` |
| `line` | Non-directional connections | `points` |
| `frame` | Grouping/framing sections | `name` |
| `image` | Embedded images | `fileId` |
| `freedraw` | Freehand drawings | `points` |

### Color palette

```
#a5d8ff  Light blue    — general, process
#b2f2bb  Light green   — success, start
#ffec99  Light yellow  — decisions, warnings
#ffc9c9  Light red     — errors, end
#d0bfff  Light purple  — special, external
#ffffff  White         — neutral
transparent            — no fill
```

---

## Claude Code skills

If you use [Claude Code](https://claude.com/claude-code), the project includes skills for AI-assisted Excalidraw work.

### `/excalidraw-generate`

Generate a scene from a description:

```
/excalidraw-generate a login flow: user enters credentials,
  system validates, success goes to dashboard, failure shows error
```

Claude will create a valid `.excalidraw` file with properly laid out shapes, arrows, and labels.

### `/excalidraw-library`

Work with libraries:

```
/excalidraw-library add a "load balancer" icon to the basic-shapes library
/excalidraw-library create a new UML library with class, interface, and package shapes
```

### `/excalidraw-new-library`

Quick-scaffold a new library:

```
/excalidraw-new-library network-icons Icons for network architecture diagrams
```

Creates the directory, `meta.json`, starter `.excalidraw` files, bundles, and validates.

---

## Best practices

### Library authoring

- **One item per file** — each `.excalidraw` file should contain a single reusable component. This keeps items independently editable in the Excalidraw editor.
- **Name files descriptively** — the filename (minus `.excalidraw`) becomes the library item name. Use kebab-case: `load-balancer.excalidraw`, `database-primary.excalidraw`.
- **Anchor at origin** — position elements starting at `(0, 0)` so they place predictably when dragged from the library panel.
- **Use clean rendering** — set `roughness: 0` for icon-style libraries. Use `roughness: 1` for hand-drawn style.
- **Keep items focused** — a library item should be a single logical component, not an entire diagram.

### Validation

- **Validate early** — run `kaaro validate` after every edit. It catches issues before they hit users.
- **CI validation** — the included GitHub Actions workflow validates all libraries on every push.
- **Pre-bundle check** — validate source `.excalidraw` files before bundling to catch element-level issues.

### Project organization

```
libraries/
├── architecture/        # System architecture components
│   ├── meta.json
│   ├── server.excalidraw
│   ├── database.excalidraw
│   └── queue.excalidraw
├── flowchart/           # Flowchart shapes
│   ├── meta.json
│   ├── process.excalidraw
│   ├── decision.excalidraw
│   └── terminator.excalidraw
└── ui-wireframe/        # UI wireframe components
    ├── meta.json
    ├── button.excalidraw
    ├── input-field.excalidraw
    └── card.excalidraw
```

### Programmatic generation

- **Use builders, not raw JSON** — `createElement()` fills in sensible defaults and generates required fields (id, seed, version). Raw JSON is error-prone.
- **Validate output** — always run `kaaro validate` on generated files.
- **Grid-based layout** — when generating layouts, use consistent spacing (200px horizontal, 150px vertical between elements).
- **Center text in shapes** — position text elements relative to their parent shape's coordinates.

### Sharing libraries

- The `.excalidrawlib` format is directly importable into Excalidraw (library panel → import)
- Host on any static CDN — the bundled files are self-contained JSON
- The registry site provides a browsable catalog with download links
- Link directly to `.excalidrawlib` files for one-click import

---

## Project structure

```
kaaroExcalidraw/
├── packages/
│   ├── core/              # Types, validators, builders, serialization
│   │   └── src/
│   │       ├── types.ts
│   │       ├── validators.ts
│   │       ├── builders.ts
│   │       ├── serialization.ts
│   │       └── __tests__/
│   ├── cli/               # CLI commands
│   │   └── src/
│   │       ├── index.ts          # Entry point (citty)
│   │       ├── commands/
│   │       │   ├── validate.ts
│   │       │   ├── bundle.ts
│   │       │   └── registry.ts
│   │       └── __tests__/
│   └── site/              # Static site (Vite + React)
│       └── src/
│           ├── App.tsx
│           ├── styles.css
│           └── components/
├── libraries/             # Library source files
│   └── basic-shapes/
│       ├── meta.json
│       ├── rounded-box.excalidraw
│       ├── circle.excalidraw
│       └── diamond.excalidraw
├── .claude/skills/        # Claude Code skills
├── .github/workflows/     # CI/CD
├── tests/fixtures/        # Shared test fixtures
└── CLAUDE.md              # Project guide
```

## Tech stack

- **TypeScript** throughout
- **pnpm workspaces** for monorepo management
- **Vitest** for spec-driven testing (50 tests)
- **Zod** for runtime validation and type inference
- **Vite + React** for the static site
- **citty** for the CLI framework
- **GitHub Actions** for CI/CD

---

## License

MIT
