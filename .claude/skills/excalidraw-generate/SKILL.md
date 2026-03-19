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

### Text sizing (CRITICAL — prevents overlapping)

Excalidraw text renders larger than you expect. Use these formulas:

| Font | fontSize | Line height | Char width (approx) |
|------|----------|-------------|---------------------|
| Virgil (1) | any | `fontSize * 1.6` | `fontSize * 0.6` |
| Helvetica (2) | any | `fontSize * 1.6` | `fontSize * 0.55` |
| Cascadia/code (3) | any | `fontSize * 1.6` | `fontSize * 0.62` |

**Text element height** = `numberOfLines * fontSize * 1.6`
**Text element width** = `maxLineLength * charWidth`

### Spacing rules to prevent overlaps

- **Padding inside boxes**: minimum `15px` on all sides between box edge and text
- **Box height**: `textHeight + 30px` minimum (15px top + 15px bottom padding)
- **Gap between stacked boxes/sections**: minimum `20px` of empty space between the bottom of one box and the top of the next
- **When placing annotations beside elements**: ensure the annotation's y-range does not overlap with any other element's y-range. Stack annotations vertically with `20px` gaps.
- **Always compute positions from previous element**: use `prevY + prevHeight + gap` instead of hardcoded absolute positions. This prevents drift when content is taller than expected.

### Recommended layout pattern

Use a cursor-based layout to avoid overlap. Track the current Y position and advance it:

```typescript
let cursorY = 100; // starting Y

// Place a box, then advance cursor
const box1Height = textHeight + 30;
addBox(x, cursorY, width, box1Height, color, label);
cursorY += box1Height + 20; // 20px gap

// Next box starts at the new cursorY
const box2Height = textHeight + 30;
addBox(x, cursorY, width, box2Height, color, label);
cursorY += box2Height + 20;
```

This ensures every element is placed relative to the previous one, never overlapping.

## createElement skeleton reference

```typescript
import { createElement, createSceneFile, writeExcalidrawFile } from "../packages/core/src/index.js";

// Rectangle — height should fit text: textHeight + 30 (15px padding each side)
createElement({
  type: "rectangle",
  x: 100, y: 100,
  width: 160, height: 62,       // fits 1 line at fontSize 20: 20*1.6 + 30 = 62
  backgroundColor: "#a5d8ff",
  roughness: 0,
})

// Text — width/height MUST match content using the sizing formulas
// height = lines * fontSize * 1.6, width = maxLineChars * fontSize * 0.6
createElement({
  type: "text",
  x: 115, y: 115,               // inset by 15px padding from rectangle
  width: 130, height: 32,       // "Process" = 7 chars → 7*20*0.6=84w, 1*20*1.6=32h
  text: "Process",
  fontSize: 20,
  fontFamily: 1,                // 1=Virgil(hand), 2=Helvetica, 3=Cascadia(code)
})

// Arrow with points
createElement({
  type: "arrow",
  x: 180, y: 162,               // starts at bottom of rectangle (100+62)
  width: 0, height: 150,
  points: [[0, 0], [0, 150]],
  endArrowhead: "arrow",
  startArrowhead: null,
})

// Diamond — allow extra size since content is inset diagonally
createElement({
  type: "diamond",
  x: 100, y: 332,               // 162 + 150 arrow + 20 gap = 332
  width: 160, height: 100,
  backgroundColor: "#ffec99",
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
const LINE_HEIGHT = 1.6; // multiplier for fontSize
const PAD = 15;           // padding inside boxes
const GAP = 20;           // space between stacked elements

// ── Text size helpers ──
function textHeight(text: string, fontSize: number): number {
  return text.split("\n").length * fontSize * LINE_HEIGHT;
}
function textWidth(text: string, fontSize: number, fontFamily: 1 | 2 | 3 = 1): number {
  const charW = fontFamily === 3 ? 0.62 : fontFamily === 2 ? 0.55 : 0.6;
  const maxLen = Math.max(...text.split("\n").map(l => l.length));
  return maxLen * fontSize * charW;
}
// Box height that fits text with padding
function boxHeight(text: string, fontSize: number): number {
  return textHeight(text, fontSize) + PAD * 2;
}

// ── Layout helper: labeled box ──
// Returns the bottom Y so you can chain: nextY = addLabeledBox(...) + GAP
function addLabeledBox(
  x: number, y: number, w: number,
  bg: string, label: string, fontSize = 18
): number {
  const th = textHeight(label, fontSize);
  const h = th + PAD * 2;
  elements.push(createElement({
    type: "rectangle", x, y, width: w, height: h,
    backgroundColor: bg, roughness: 0, fillStyle: "solid",
    strokeColor: "#1e1e1e", strokeWidth: 2, roundness: { type: 3 },
  }));
  elements.push(createElement({
    type: "text",
    x: x + PAD, y: y + PAD,
    width: w - PAD * 2, height: th,
    text: label, fontSize, fontFamily: 1,
    textAlign: "center", strokeColor: "#1e1e1e",
  }));
  return y + h; // bottom edge of this box
}

// ... build elements using helpers, always tracking Y position ...

const scene = createSceneFile(elements);
await writeExcalidrawFile("output.excalidraw", scene);
console.log("Generated output.excalidraw");
```

**Key pattern**: every placement function returns the bottom Y of what it placed. The next element starts at `returnedY + GAP`. Never hardcode absolute Y positions for sequential elements.

Run with: `npx tsx tmp-generate.ts`

Then clean up: `rm tmp-generate.ts`

## Output

- Save the `.excalidraw` file in the current directory (or user-specified path)
- Validate with the CLI
- Report what was generated (element count, layout description)
