import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import {
  readExcalidrawFile,
  readLibFile,
  writeExcalidrawFile,
  writeLibFile,
} from "../serialization.js";
import { createElement, createLibraryItem, createLibFile, createSceneFile } from "../builders.js";

const fixturesDir = resolve(__dirname, "../../../../tests/fixtures");

describe("readExcalidrawFile", () => {
  it("reads and validates a valid .excalidraw file", async () => {
    const file = await readExcalidrawFile(resolve(fixturesDir, "valid-scene.excalidraw"));
    expect(file.type).toBe("excalidraw");
    expect(file.elements).toHaveLength(1);
  });

  it("throws on invalid file content", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    const badFile = join(tmp, "bad.excalidraw");
    writeFileSync(badFile, JSON.stringify({ type: "wrong" }));
    await expect(readExcalidrawFile(badFile)).rejects.toThrow();
    rmSync(tmp, { recursive: true });
  });

  it("throws on non-existent file", async () => {
    await expect(readExcalidrawFile("/nonexistent/file.excalidraw")).rejects.toThrow();
  });
});

describe("readLibFile", () => {
  it("reads and validates a valid .excalidrawlib file", async () => {
    const file = await readLibFile(resolve(fixturesDir, "valid-library.excalidrawlib"));
    expect(file.type).toBe("excalidrawlib");
    expect(file.libraryItems).toHaveLength(2);
  });

  it("throws on invalid content", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    const badFile = join(tmp, "bad.excalidrawlib");
    writeFileSync(badFile, JSON.stringify({ type: "excalidraw", version: 2, source: "x", elements: [] }));
    await expect(readLibFile(badFile)).rejects.toThrow();
    rmSync(tmp, { recursive: true });
  });
});

describe("writeExcalidrawFile", () => {
  it("writes a valid .excalidraw file that can be read back", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    const outPath = join(tmp, "out.excalidraw");
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 100, height: 50 });
    const scene = createSceneFile([el]);

    await writeExcalidrawFile(outPath, scene);

    const raw = JSON.parse(readFileSync(outPath, "utf-8"));
    expect(raw.type).toBe("excalidraw");
    expect(raw.elements).toHaveLength(1);

    const readBack = await readExcalidrawFile(outPath);
    expect(readBack.elements[0].type).toBe("rectangle");

    rmSync(tmp, { recursive: true });
  });
});

describe("writeLibFile", () => {
  it("writes a valid .excalidrawlib file that can be read back", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "kaaro-test-"));
    const outPath = join(tmp, "out.excalidrawlib");
    const el = createElement({ type: "ellipse", x: 0, y: 0, width: 40, height: 40 });
    const item = createLibraryItem({ name: "Circle", elements: [el] });
    const lib = createLibFile([item]);

    await writeLibFile(outPath, lib);

    const readBack = await readLibFile(outPath);
    expect(readBack.libraryItems).toHaveLength(1);
    expect(readBack.libraryItems[0].name).toBe("Circle");

    rmSync(tmp, { recursive: true });
  });
});
