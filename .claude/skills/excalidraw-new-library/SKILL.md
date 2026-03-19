---
name: excalidraw-new-library
description: Scaffold a new Excalidraw library workspace with meta.json and starter items
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<library-name> <description>"
---

# Scaffold New Excalidraw Library

Create a new library workspace under `libraries/`.

## Your task

Scaffold a new library: **$ARGUMENTS**

## Steps

1. Parse the arguments:
   - `$0` = library name (kebab-case directory name)
   - Remaining args = description of what the library should contain

2. Create the directory structure:
   ```
   libraries/<library-name>/
   ├── meta.json
   ```

3. Write `meta.json`:
   ```json
   {
     "name": "<Human Readable Name>",
     "description": "<description from args>",
     "authors": [{ "name": "Kaaro" }]
   }
   ```

4. Create 2-3 starter `.excalidraw` files based on the description using a generator script with `@kaaro/core` builders. Each file should contain a single meaningful shape/component relevant to the library theme.

5. Bundle: `npx tsx packages/cli/src/index.ts bundle libraries/<name> -o libraries/<name>/<name>.excalidrawlib`

6. Validate: `npx tsx packages/cli/src/index.ts validate libraries/<name>/<name>.excalidrawlib`

7. Report what was created.

## Generator script pattern

```typescript
import { createElement, createSceneFile, writeExcalidrawFile } from "./packages/core/src/index.js";

// Create elements for a single library item
const elements = [
  createElement({ type: "rectangle", x: 0, y: 0, width: 160, height: 80, backgroundColor: "#a5d8ff", roughness: 0 }),
  createElement({ type: "text", x: 20, y: 25, width: 120, height: 30, text: "Label", fontSize: 20, fontFamily: 1 }),
];

const scene = createSceneFile(elements);
await writeExcalidrawFile("libraries/<name>/item-name.excalidraw", scene);
```

Run with `npx tsx tmp-scaffold.ts`, then clean up the script.
