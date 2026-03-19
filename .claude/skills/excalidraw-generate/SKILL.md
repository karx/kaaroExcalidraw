---
name: excalidraw-generate
description: Generate .excalidraw scene files from natural language descriptions of diagrams, flowcharts, layouts, or visual concepts
allowed-tools: Read, Write, Bash, Glob, Grep
argument-hint: "<description of what to draw>"
---

# Generate Excalidraw Scene

You are generating an `.excalidraw` file from a natural language description.

## Project context

This project uses `@kaaro/core` (at `packages/core/src/`) which provides:
- `createElement(skeleton)` — creates a valid Excalidraw element from minimal input
- `createSceneFile(elements)` — wraps elements into a valid `.excalidraw` file
- `writeExcalidrawFile(path, data)` — writes and validates the file

## Your task

Generate a valid `.excalidraw` scene file based on: **$ARGUMENTS**

## Steps

1. **Analyze the request** — identify what shapes, text, arrows, and layout are needed
2. **Write a generator script** — create a temporary TypeScript file that uses `@kaaro/core` builders to programmatically construct the scene
3. **Run the script** — execute with `npx tsx` to produce the `.excalidraw` file
4. **Validate** — run `npx tsx packages/cli/src/index.ts validate <output>` to confirm correctness

## Element types and when to use them

| Type | Use for |
|------|---------|
| `rectangle` | Boxes, containers, process steps, cards |
| `ellipse` | Circles, ovals, start/end nodes |
| `diamond` | Decision points, conditions |
| `text` | Labels, titles, annotations |
| `arrow` | Connections, flow direction (use `points` + `endArrowhead: "arrow"`) |
| `line` | Non-directional connections, dividers |
| `frame` | Grouping/framing sections |

## Layout guidelines

- Use a grid-based layout. Standard spacing: 200px horizontal, 150px vertical between elements
- Center-align elements in rows/columns
- For flowcharts: top-to-bottom or left-to-right flow
- Text labels: place centered inside shapes or directly below them
- Arrows: connect from shape edges using points array

## createElement skeleton reference

```typescript
import { createElement, createSceneFile, writeExcalidrawFile } from "../packages/core/src/index.js";

// Rectangle
createElement({
  type: "rectangle",
  x: 100, y: 100,
  width: 160, height: 80,
  backgroundColor: "#a5d8ff",  // light blue
  roughness: 0,                // 0=clean, 1=sketchy, 2=very sketchy
})

// Text (must set fontSize, fontFamily, width/height to fit)
createElement({
  type: "text",
  x: 120, y: 125,
  width: 120, height: 30,
  text: "Process",
  fontSize: 20,
  fontFamily: 1,  // 1=Virgil(hand), 2=Helvetica, 3=Cascadia(code)
})

// Arrow with points
createElement({
  type: "arrow",
  x: 180, y: 180,
  width: 0, height: 150,
  points: [[0, 0], [0, 150]],
  endArrowhead: "arrow",
  startArrowhead: null,
})

// Diamond (decision)
createElement({
  type: "diamond",
  x: 100, y: 350,
  width: 160, height: 100,
  backgroundColor: "#ffec99",  // light yellow
})
```

## Color palette

| Color | Hex | Use for |
|-------|-----|---------|
| Light blue | `#a5d8ff` | Process boxes, general |
| Light green | `#b2f2bb` | Success, start, positive |
| Light yellow | `#ffec99` | Decisions, warnings |
| Light red | `#ffc9c9` | Errors, end, negative |
| Light purple | `#d0bfff` | Special, external |
| White | `#ffffff` | Background, neutral |
| Transparent | `transparent` | No fill |

## Generator script template

Write a script like this to `tmp-generate.ts`, then run it:

```typescript
import { createElement, createSceneFile, writeExcalidrawFile } from "./packages/core/src/index.js";
import type { ExcalidrawElement } from "./packages/core/src/types.js";

const elements: ExcalidrawElement[] = [];

// ... build elements here ...

const scene = createSceneFile(elements);
await writeExcalidrawFile("output.excalidraw", scene);
console.log("Generated output.excalidraw");
```

Run with: `npx tsx tmp-generate.ts`

Then clean up: `rm tmp-generate.ts`

## Output

- Save the `.excalidraw` file in the current directory (or user-specified path)
- Validate with the CLI
- Report what was generated (element count, layout description)
