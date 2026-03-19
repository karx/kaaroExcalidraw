#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { resolve } from "node:path";

const validateCmd = defineCommand({
  meta: { name: "validate", description: "Validate .excalidraw or .excalidrawlib files" },
  args: {
    path: { type: "positional", description: "Path to file to validate", required: true },
  },
  async run({ args }) {
    const { validate } = await import("./commands/validate.js");
    const filePath = resolve(args.path);
    const result = await validate(filePath);
    if (result.success) {
      console.log(`✓ Valid: ${filePath}`);
    } else {
      console.error(`✗ Invalid: ${filePath}`);
      for (const err of result.errors ?? []) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }
  },
});

const bundleCmd = defineCommand({
  meta: { name: "bundle", description: "Bundle .excalidraw files into a .excalidrawlib" },
  args: {
    dir: { type: "positional", description: "Directory containing .excalidraw files", required: true },
    output: { type: "string", alias: "o", description: "Output .excalidrawlib path", required: true },
  },
  async run({ args }) {
    const { bundle } = await import("./commands/bundle.js");
    const result = await bundle({
      inputDir: resolve(args.dir),
      outputPath: resolve(args.output),
    });
    console.log(`✓ Bundled ${result.itemCount} items → ${result.outputPath}`);
  },
});

const registryCmd = defineCommand({
  meta: { name: "registry", description: "Generate registry.json from libraries directory" },
  args: {
    dir: { type: "positional", description: "Libraries root directory", required: true },
    output: { type: "string", alias: "o", description: "Output directory", required: true },
  },
  async run({ args }) {
    const { generateRegistry } = await import("./commands/registry.js");
    const registry = await generateRegistry({
      librariesRoot: resolve(args.dir),
      outputDir: resolve(args.output),
    });
    console.log(`✓ Generated registry with ${registry.libraries.length} libraries`);
  },
});

const previewCmd = defineCommand({
  meta: { name: "preview", description: "Generate SVG preview for a .excalidrawlib file" },
  args: {
    path: { type: "positional", description: "Path to .excalidrawlib file", required: true },
    output: { type: "string", alias: "o", description: "Output directory", required: true },
  },
  async run({ args }) {
    const { generatePreview } = await import("./commands/preview.js");
    const result = await generatePreview({
      inputPath: resolve(args.path),
      outputDir: resolve(args.output),
    });
    console.log(`✓ Generated preview for ${result.itemCount} items → ${result.outputPath}`);
  },
});

const convertCmd = defineCommand({
  meta: { name: "convert", description: "Convert Excalidraw clipboard JSON to a valid .excalidraw file" },
  args: {
    path: { type: "positional", description: "Path to clipboard JSON file", required: true },
    output: { type: "string", alias: "o", description: "Output .excalidraw path", required: true },
    noNormalize: { type: "boolean", description: "Skip coordinate normalization", default: false },
  },
  async run({ args }) {
    const { convert } = await import("./commands/convert.js");
    const result = await convert({
      inputPath: resolve(args.path),
      outputPath: resolve(args.output),
      noNormalize: args.noNormalize,
    });
    console.log(`✓ Converted ${result.elementCount} elements → ${result.outputPath}`);
    if (result.strippedFields.length > 0) {
      console.log(`  Stripped clipboard fields: ${result.strippedFields.join(", ")}`);
    }
    if (result.offset.x !== 0 || result.offset.y !== 0) {
      console.log(`  Normalized coordinates (offset: ${result.offset.x.toFixed(0)}, ${result.offset.y.toFixed(0)})`);
    }
  },
});

const main = defineCommand({
  meta: { name: "kaaro", version: "0.1.0", description: "Kaaro Excalidraw toolkit" },
  subCommands: {
    validate: validateCmd,
    bundle: bundleCmd,
    registry: registryCmd,
    preview: previewCmd,
    convert: convertCmd,
  },
});

runMain(main);
