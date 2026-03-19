import { readdir } from "node:fs/promises";
import { resolve, basename, extname } from "node:path";
import {
  readExcalidrawFile,
  createLibraryItem,
  createLibFile,
  writeLibFile,
} from "@kaaro/core";

export interface BundleOptions {
  inputDir: string;
  outputPath: string;
  source?: string;
}

export async function bundle(opts: BundleOptions): Promise<{
  itemCount: number;
  outputPath: string;
}> {
  const entries = await readdir(opts.inputDir, { withFileTypes: true });
  const excalidrawFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".excalidraw"))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (excalidrawFiles.length === 0) {
    throw new Error(`No .excalidraw files found in ${opts.inputDir}`);
  }

  const items = await Promise.all(
    excalidrawFiles.map(async (entry) => {
      const filePath = resolve(opts.inputDir, entry.name);
      const scene = await readExcalidrawFile(filePath);
      const name = basename(entry.name, extname(entry.name));
      return createLibraryItem({
        name,
        elements: scene.elements,
      });
    }),
  );

  const lib = createLibFile(items, opts.source);
  await writeLibFile(opts.outputPath, lib);

  return { itemCount: items.length, outputPath: opts.outputPath };
}
