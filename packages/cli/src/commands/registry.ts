import { readdir, readFile, mkdir, copyFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import type { Registry, RegistryEntry, LibraryMeta, ExcalidrawElement } from "@kaaro/core";
import { readLibFile, generateSvgPreview } from "@kaaro/core";

export interface RegistryOptions {
  librariesRoot: string;
  outputDir: string;
}

export async function generateRegistry(opts: RegistryOptions): Promise<Registry> {
  const entries = await readdir(opts.librariesRoot, { withFileTypes: true });
  const libDirs = entries.filter((e) => e.isDirectory() && e.name !== ".git");

  const registryEntries: RegistryEntry[] = [];

  for (const dir of libDirs) {
    const libDir = resolve(opts.librariesRoot, dir.name);

    // Read meta.json
    let meta: LibraryMeta;
    try {
      const metaRaw = await readFile(join(libDir, "meta.json"), "utf-8");
      meta = JSON.parse(metaRaw) as LibraryMeta;
    } catch {
      // Skip directories without meta.json
      continue;
    }

    // Find .excalidrawlib file
    const libFiles = (await readdir(libDir)).filter((f) =>
      f.endsWith(".excalidrawlib"),
    );
    if (libFiles.length === 0) continue;

    const libFilePath = join(libDir, libFiles[0]);
    const libData = await readLibFile(libFilePath);

    const cdnPath = `libraries/${dir.name}/${libFiles[0]}`;

    const entry: RegistryEntry = {
      id: dir.name,
      name: meta.name,
      description: meta.description,
      authors: meta.authors,
      source: cdnPath,
      created: new Date().toISOString().split("T")[0],
      updated: new Date().toISOString().split("T")[0],
      version: libData.version,
      itemNames: libData.libraryItems.map((item) => item.name),
    };

    // Copy .excalidrawlib to output
    const outLibDir = join(opts.outputDir, "libraries", dir.name);
    await mkdir(outLibDir, { recursive: true });
    await copyFile(libFilePath, join(outLibDir, libFiles[0]));

    // Generate preview SVG
    const allElements: ExcalidrawElement[] = [];
    let offsetX = 0;
    for (const item of libData.libraryItems) {
      let maxW = 0;
      for (const el of item.elements) {
        maxW = Math.max(maxW, el.x + el.width);
      }
      for (const el of item.elements) {
        allElements.push({ ...el, x: el.x + offsetX });
      }
      offsetX += maxW + 40;
    }
    const previewSvg = generateSvgPreview(allElements);
    await writeFile(join(outLibDir, "preview.svg"), previewSvg, "utf-8");
    entry.preview = `libraries/${dir.name}/preview.svg`;

    registryEntries.push(entry);
  }

  const registry: Registry = {
    libraries: registryEntries,
    generatedAt: new Date().toISOString(),
  };

  await mkdir(opts.outputDir, { recursive: true });
  await writeFile(
    join(opts.outputDir, "registry.json"),
    JSON.stringify(registry, null, 2) + "\n",
    "utf-8",
  );

  return registry;
}
