import { describe, it, expect } from "vitest";
import {
  createElement,
  createLibraryItem,
  createLibFile,
  createSceneFile,
} from "../builders.js";
import {
  ExcalidrawElementSchema,
  LibraryItemSchema,
  ExcalidrawFileSchema,
  ExcalidrawLibFileSchema,
} from "../validators.js";

describe("createElement", () => {
  it("produces a valid element from minimal skeleton", () => {
    const el = createElement({ type: "rectangle", x: 10, y: 20, width: 100, height: 50 });
    const result = ExcalidrawElementSchema.safeParse(el);
    expect(result.success).toBe(true);
  });

  it("generates a unique id when not provided", () => {
    const a = createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 });
    const b = createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 });
    expect(a.id).not.toBe(b.id);
  });

  it("preserves provided id", () => {
    const el = createElement({ type: "ellipse", x: 0, y: 0, width: 10, height: 10, id: "my-id" });
    expect(el.id).toBe("my-id");
  });

  it("applies custom stroke and fill", () => {
    const el = createElement({
      type: "rectangle",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      strokeColor: "#ff0000",
      backgroundColor: "#00ff00",
    });
    expect(el.strokeColor).toBe("#ff0000");
    expect(el.backgroundColor).toBe("#00ff00");
  });

  it("sets defaults for all required fields", () => {
    const el = createElement({ type: "diamond", x: 5, y: 5, width: 50, height: 50 });
    expect(el.angle).toBe(0);
    expect(el.fillStyle).toBe("solid");
    expect(el.strokeStyle).toBe("solid");
    expect(el.roughness).toBe(1);
    expect(el.opacity).toBe(100);
    expect(el.isDeleted).toBe(false);
    expect(el.locked).toBe(false);
    expect(el.groupIds).toEqual([]);
  });

  it("handles text elements with text property", () => {
    const el = createElement({
      type: "text",
      x: 0,
      y: 0,
      width: 100,
      height: 20,
      text: "Hello",
      fontSize: 20,
      fontFamily: 1,
    });
    expect(el.text).toBe("Hello");
    expect(el.fontSize).toBe(20);
    const result = ExcalidrawElementSchema.safeParse(el);
    expect(result.success).toBe(true);
  });

  it("handles line elements with points", () => {
    const el = createElement({
      type: "line",
      x: 0,
      y: 0,
      width: 100,
      height: 0,
      points: [[0, 0], [100, 0]],
    });
    expect(el.points).toEqual([[0, 0], [100, 0]]);
    const result = ExcalidrawElementSchema.safeParse(el);
    expect(result.success).toBe(true);
  });
});

describe("createLibraryItem", () => {
  it("produces a valid library item", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 50, height: 50 });
    const item = createLibraryItem({ name: "My Shape", elements: [el] });
    const result = LibraryItemSchema.safeParse(item);
    expect(result.success).toBe(true);
  });

  it("generates id and timestamp automatically", () => {
    const el = createElement({ type: "ellipse", x: 0, y: 0, width: 30, height: 30 });
    const item = createLibraryItem({ name: "Test", elements: [el] });
    expect(item.id).toBeDefined();
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.created).toBeGreaterThan(0);
  });

  it("uses provided id when given", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 });
    const item = createLibraryItem({ name: "Test", elements: [el], id: "custom-id" });
    expect(item.id).toBe("custom-id");
  });

  it("defaults status to published", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 });
    const item = createLibraryItem({ name: "Test", elements: [el] });
    expect(item.status).toBe("published");
  });

  it("respects custom status", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 });
    const item = createLibraryItem({ name: "Test", elements: [el], status: "unpublished" });
    expect(item.status).toBe("unpublished");
  });
});

describe("createLibFile", () => {
  it("produces a valid .excalidrawlib structure", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 50, height: 50 });
    const item = createLibraryItem({ name: "Shape", elements: [el] });
    const lib = createLibFile([item]);
    const result = ExcalidrawLibFileSchema.safeParse(lib);
    expect(result.success).toBe(true);
  });

  it("sets correct type and version", () => {
    const lib = createLibFile([]);
    expect(lib.type).toBe("excalidrawlib");
    expect(lib.version).toBe(2);
  });

  it("uses custom source when provided", () => {
    const lib = createLibFile([], "https://kaaro.dev");
    expect(lib.source).toBe("https://kaaro.dev");
  });
});

describe("createSceneFile", () => {
  it("produces a valid .excalidraw structure", () => {
    const el = createElement({ type: "rectangle", x: 10, y: 10, width: 100, height: 100 });
    const scene = createSceneFile([el]);
    const result = ExcalidrawFileSchema.safeParse(scene);
    expect(result.success).toBe(true);
  });

  it("sets correct type and version", () => {
    const scene = createSceneFile([]);
    expect(scene.type).toBe("excalidraw");
    expect(scene.version).toBe(2);
  });

  it("includes all provided elements", () => {
    const els = [
      createElement({ type: "rectangle", x: 0, y: 0, width: 10, height: 10 }),
      createElement({ type: "ellipse", x: 20, y: 20, width: 30, height: 30 }),
    ];
    const scene = createSceneFile(els);
    expect(scene.elements).toHaveLength(2);
  });
});
