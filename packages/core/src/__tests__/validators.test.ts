import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateExcalidrawFile,
  validateExcalidrawLibFile,
  validateLibraryItem,
} from "../validators.js";

const fixturesDir = resolve(__dirname, "../../../../tests/fixtures");

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(resolve(fixturesDir, name), "utf-8"));
}

describe("validateExcalidrawFile", () => {
  it("accepts a valid .excalidraw file", () => {
    const data = readFixture("valid-scene.excalidraw");
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("rejects when type field is missing", () => {
    const data = readFixture("valid-scene.excalidraw") as Record<string, unknown>;
    delete data.type;
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it("rejects when type field is wrong", () => {
    const data = readFixture("valid-scene.excalidraw") as Record<string, unknown>;
    data.type = "excalidrawlib";
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects when version is not a number", () => {
    const data = readFixture("valid-scene.excalidraw") as Record<string, unknown>;
    data.version = "two";
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects when elements is not an array", () => {
    const data = readFixture("valid-scene.excalidraw") as Record<string, unknown>;
    data.elements = "not-an-array";
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects an element missing required fields", () => {
    const data = {
      type: "excalidraw",
      version: 2,
      source: "test",
      elements: [{ id: "x", type: "rectangle" }], // missing x, y, width, height, etc.
    };
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(false);
  });

  it("accepts a file with empty elements array", () => {
    const data = {
      type: "excalidraw",
      version: 2,
      source: "test",
      elements: [],
    };
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(true);
  });

  it("accepts optional appState and files fields", () => {
    const data = {
      type: "excalidraw",
      version: 2,
      source: "test",
      elements: [],
      appState: { viewBackgroundColor: "#ffffff" },
      files: {},
    };
    const result = validateExcalidrawFile(data);
    expect(result.success).toBe(true);
  });
});

describe("validateExcalidrawLibFile", () => {
  it("accepts a valid .excalidrawlib file", () => {
    const data = readFixture("valid-library.excalidrawlib");
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("rejects when type is wrong", () => {
    const data = readFixture("valid-library.excalidrawlib") as Record<string, unknown>;
    data.type = "excalidraw";
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects when libraryItems is missing", () => {
    const data = {
      type: "excalidrawlib",
      version: 2,
      source: "test",
    };
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(false);
  });

  it("accepts empty libraryItems array", () => {
    const data = {
      type: "excalidrawlib",
      version: 2,
      source: "test",
      libraryItems: [],
    };
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(true);
  });

  it("rejects a library item missing id", () => {
    const data = {
      type: "excalidrawlib",
      version: 2,
      source: "test",
      libraryItems: [
        {
          name: "No ID",
          status: "published",
          elements: [],
          created: 1700000000000,
        },
      ],
    };
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects a library item missing name", () => {
    const data = {
      type: "excalidrawlib",
      version: 2,
      source: "test",
      libraryItems: [
        {
          id: "item-1",
          status: "published",
          elements: [],
          created: 1700000000000,
        },
      ],
    };
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid status value", () => {
    const data = {
      type: "excalidrawlib",
      version: 2,
      source: "test",
      libraryItems: [
        {
          id: "item-1",
          name: "Test",
          status: "draft",
          elements: [],
          created: 1700000000000,
        },
      ],
    };
    const result = validateExcalidrawLibFile(data);
    expect(result.success).toBe(false);
  });
});

describe("validateLibraryItem", () => {
  it("accepts a valid library item", () => {
    const libFile = readFixture("valid-library.excalidrawlib") as {
      libraryItems: unknown[];
    };
    const result = validateLibraryItem(libFile.libraryItems[0]);
    expect(result.success).toBe(true);
  });

  it("rejects an item with invalid element types", () => {
    const result = validateLibraryItem({
      id: "test",
      name: "Test",
      status: "published",
      elements: [
        {
          id: "e1",
          type: "nonexistent-type",
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          angle: 0,
          strokeColor: "#000",
          backgroundColor: "transparent",
          fillStyle: "solid",
          strokeWidth: 1,
          strokeStyle: "solid",
          roughness: 1,
          opacity: 100,
          seed: 1,
          version: 1,
          versionNonce: 1,
          isDeleted: false,
          groupIds: [],
          boundElements: null,
          updated: 1700000000000,
          link: null,
          locked: false,
          roundness: null,
        },
      ],
      created: 1700000000000,
    });
    expect(result.success).toBe(false);
  });
});
