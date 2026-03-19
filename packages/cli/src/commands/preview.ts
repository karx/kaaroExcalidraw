import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { readLibFile, generateSvgPreview } from "@kaaro/core";
import type { ExcalidrawElement } from "@kaaro/core";

export interface PreviewOptions {
  inputPath: string;
  outputDir: string;
}

export async function generatePreview(opts: PreviewOptions): Promise<{
  outputPath: string;
  itemCount: number;
}> {
  const lib = await readLibFile(opts.inputPath);
  await mkdir(opts.outputDir, { recursive: true });

  // Generate a composite preview showing all library items in a horizontal row
  const allElements: ExcalidrawElement[] = [];
  let offsetX = 0;

  for (const item of lib.libraryItems) {
    // Compute item bounding box to position items side by side
    let maxW = 0, maxH = 0;
    for (const el of item.elements) {
      maxW = Math.max(maxW, el.x + el.width);
      maxH = Math.max(maxH, el.y + el.height);
    }

    // Offset elements horizontally
    for (const el of item.elements) {
      allElements.push({ ...el, x: el.x + offsetX });
    }

    offsetX += maxW + 40; // 40px gap between items
  }

  const svg = generateSvgPreview(allElements);
  const outputPath = join(opts.outputDir, "preview.svg");
  await writeFile(outputPath, svg, "utf-8");

  return { outputPath, itemCount: lib.libraryItems.length };
}
