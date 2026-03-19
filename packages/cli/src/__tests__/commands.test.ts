import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { validate } from "../commands/validate.js";
import { bundle } from "../commands/bundle.js";
import { generateRegistry } from "../commands/registry.js";

const fixturesDir = resolve(__dirname, "../../../../tests/fixtures");

describe("validate command", () => {
  it("validates a valid .excalidraw file", async () => {
    const result = await validate(join(fixturesDir, "valid-scene.excalidraw"));
    expect(result.success).toBe(true);
  });

  it("validates a valid .excalidrawlib file", async () => {
    const result = await validate(join(fixturesDir, "valid-library.excalidrawlib"));
    expect(result.success).toBe(true);
  });

  it("rejects an invalid file", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    writeFileSync(join(tmp, "bad.excalidraw"), JSON.stringify({ type: "excalidraw", version: "bad" }));
    const result = await validate(join(tmp, "bad.excalidraw"));
    expect(result.success).toBe(false);
    rmSync(tmp, { recursive: true });
  });

  it("rejects unknown file type", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    writeFileSync(join(tmp, "unknown.json"), JSON.stringify({ type: "something" }));
    const result = await validate(join(tmp, "unknown.json"));
    expect(result.success).toBe(false);
    expect(result.errors![0]).toContain("Unknown file type");
    rmSync(tmp, { recursive: true });
  });
});

describe("bundle command", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "kaaro-bundle-"));
    // Create sample .excalidraw files
    const makeScene = (id: string, type: string) =>
      JSON.stringify({
        type: "excalidraw",
        version: 2,
        source: "test",
        elements: [
          {
            id,
            type,
            x: 0, y: 0, width: 50, height: 50, angle: 0,
            strokeColor: "#1e1e1e", backgroundColor: "transparent",
            fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
            roughness: 1, opacity: 100, seed: 1, version: 1, versionNonce: 1,
            isDeleted: false, groupIds: [], boundElements: null,
            updated: 1700000000000, link: null, locked: false,
            roundness: { type: 3 },
          },
        ],
      });

    const inputDir = join(tmp, "input");
    mkdirSync(inputDir);
    writeFileSync(join(inputDir, "box.excalidraw"), makeScene("e1", "rectangle"));
    writeFileSync(join(inputDir, "circle.excalidraw"), makeScene("e2", "ellipse"));
  });

  afterEach(() => rmSync(tmp, { recursive: true }));

  it("bundles .excalidraw files into .excalidrawlib", async () => {
    const outPath = join(tmp, "out.excalidrawlib");
    const result = await bundle({
      inputDir: join(tmp, "input"),
      outputPath: outPath,
    });
    expect(result.itemCount).toBe(2);

    const lib = JSON.parse(readFileSync(outPath, "utf-8"));
    expect(lib.type).toBe("excalidrawlib");
    expect(lib.libraryItems).toHaveLength(2);
    expect(lib.libraryItems[0].name).toBe("box");
    expect(lib.libraryItems[1].name).toBe("circle");
  });

  it("throws when no .excalidraw files found", async () => {
    const emptyDir = join(tmp, "empty");
    mkdirSync(emptyDir);
    await expect(
      bundle({ inputDir: emptyDir, outputPath: join(tmp, "out.excalidrawlib") }),
    ).rejects.toThrow("No .excalidraw files found");
  });
});

describe("registry command", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), "kaaro-registry-"));
    // Create a library directory with meta.json and .excalidrawlib
    const libDir = join(tmp, "libs", "shapes");
    mkdirSync(libDir, { recursive: true });

    writeFileSync(
      join(libDir, "meta.json"),
      JSON.stringify({
        name: "Basic Shapes",
        authors: [{ name: "Test Author" }],
        description: "A set of basic shapes",
      }),
    );

    writeFileSync(
      join(libDir, "shapes.excalidrawlib"),
      JSON.stringify({
        type: "excalidrawlib",
        version: 2,
        source: "test",
        libraryItems: [
          {
            id: "item-1",
            name: "Rectangle",
            status: "published",
            elements: [
              {
                id: "e1", type: "rectangle",
                x: 0, y: 0, width: 50, height: 50, angle: 0,
                strokeColor: "#1e1e1e", backgroundColor: "transparent",
                fillStyle: "solid", strokeWidth: 2, strokeStyle: "solid",
                roughness: 1, opacity: 100, seed: 1, version: 1, versionNonce: 1,
                isDeleted: false, groupIds: [], boundElements: null,
                updated: 1700000000000, link: null, locked: false,
                roundness: { type: 3 },
              },
            ],
            created: 1700000000000,
          },
        ],
      }),
    );
  });

  afterEach(() => rmSync(tmp, { recursive: true }));

  it("generates registry.json from library directories", async () => {
    const outDir = join(tmp, "out");
    const registry = await generateRegistry({
      librariesRoot: join(tmp, "libs"),
      outputDir: outDir,
    });

    expect(registry.libraries).toHaveLength(1);
    expect(registry.libraries[0].name).toBe("Basic Shapes");
    expect(registry.libraries[0].itemNames).toEqual(["Rectangle"]);

    // Check registry.json was written
    const registryFile = JSON.parse(readFileSync(join(outDir, "registry.json"), "utf-8"));
    expect(registryFile.libraries).toHaveLength(1);

    // Check .excalidrawlib was copied
    const copiedLib = JSON.parse(
      readFileSync(join(outDir, "libraries", "shapes", "shapes.excalidrawlib"), "utf-8"),
    );
    expect(copiedLib.type).toBe("excalidrawlib");
  });

  it("skips directories without meta.json", async () => {
    const noMetaDir = join(tmp, "libs", "no-meta");
    mkdirSync(noMetaDir, { recursive: true });
    writeFileSync(join(noMetaDir, "foo.excalidrawlib"), "{}");

    const outDir = join(tmp, "out");
    const registry = await generateRegistry({
      librariesRoot: join(tmp, "libs"),
      outputDir: outDir,
    });

    // Should only have the "shapes" library, not "no-meta"
    expect(registry.libraries).toHaveLength(1);
  });
});
