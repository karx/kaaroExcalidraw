---
name: excalidraw-library
description: Create or modify Excalidraw library files (.excalidrawlib) — add items, edit existing libraries, bundle from source files
allowed-tools: Read, Write, Bash, Glob, Grep
argument-hint: "<action> e.g. 'add a router icon to aws-icons' or 'create a new UML library'"
---

# Manage Excalidraw Libraries

You are working with the Kaaro Excalidraw library pipeline.

## Project context

- Libraries live in `libraries/<library-name>/` with a `meta.json` and individual `.excalidraw` files
- Each `.excalidraw` file becomes one library item (filename = item name)
- The CLI bundles them: `npx tsx packages/cli/src/index.ts bundle <dir> -o <output.excalidrawlib>`
- Validation: `npx tsx packages/cli/src/index.ts validate <file>`

## Your task

$ARGUMENTS

## How libraries are structured

```
libraries/
└── <library-name>/
    ├── meta.json              # { name, authors, description }
    ├── item-one.excalidraw    # one library item
    ├── item-two.excalidraw    # another item
    └── <library-name>.excalidrawlib  # generated (gitignored)
```

### meta.json format
```json
{
  "name": "Human-Readable Library Name",
  "description": "What this library contains",
  "authors": [{ "name": "Author Name", "url": "https://optional-url" }]
}
```

## Workflow for common tasks

### Adding an item to an existing library
1. Read the existing library directory to understand the current items
2. Create a new `.excalidraw` file with the element(s) for the new item
3. Use `@kaaro/core` builders via a generator script (see `/excalidraw-generate` for pattern)
4. Re-bundle: `npx tsx packages/cli/src/index.ts bundle libraries/<name> -o libraries/<name>/<name>.excalidrawlib`
5. Validate the output

### Creating a new library
1. Create directory `libraries/<library-name>/`
2. Create `meta.json` with name, description, authors
3. Create `.excalidraw` files for each item
4. Bundle into `.excalidrawlib`
5. Validate

### Modifying an existing item
1. Read the `.excalidraw` file
2. Modify elements as needed (edit JSON or regenerate with builders)
3. Write back and validate
4. Re-bundle

## Element creation reference

Use `@kaaro/core` builders for programmatic creation:

```typescript
import { createElement, createSceneFile, writeExcalidrawFile } from "./packages/core/src/index.js";

const el = createElement({
  type: "rectangle",
  x: 0, y: 0, width: 160, height: 80,
  backgroundColor: "#a5d8ff",
  roughness: 0,
});

const scene = createSceneFile([el]);
await writeExcalidrawFile("libraries/my-lib/my-item.excalidraw", scene);
```

## After changes

Always:
1. Bundle: `npx tsx packages/cli/src/index.ts bundle libraries/<name> -o libraries/<name>/<name>.excalidrawlib`
2. Validate: `npx tsx packages/cli/src/index.ts validate libraries/<name>/<name>.excalidrawlib`
3. Report what changed (items added/modified/removed)
