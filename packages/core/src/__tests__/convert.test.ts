import { describe, it, expect } from "vitest";
import { convertClipboard } from "../convert.js";
import { createElement } from "../builders.js";

// Helper: build a minimal clipboard payload from elements
function makeClipboard(elements: Record<string, unknown>[], files?: Record<string, unknown>) {
  return {
    type: "excalidraw/clipboard" as const,
    elements,
    ...(files ? { files } : {}),
  };
}

// A valid element in clipboard form (with extra clipboard-only fields)
function clipboardElement(overrides: Record<string, unknown> = {}) {
  const el = createElement({
    type: "rectangle",
    x: 500,
    y: 1000,
    width: 100,
    height: 50,
  });
  return {
    ...el,
    // Clipboard-only fields that Excalidraw adds
    index: "b4n",
    frameId: null,
    containerId: null,
    originalText: "hello",
    autoResize: true,
    lineHeight: 1.6,
    polygon: false,
    ...overrides,
  };
}

describe("convertClipboard", () => {
  it("converts valid clipboard data to a scene file", () => {
    const data = makeClipboard([clipboardElement()]);
    const result = convertClipboard(data);

    expect(result.scene.type).toBe("excalidraw");
    expect(result.scene.version).toBe(2);
    expect(result.scene.elements).toHaveLength(1);
    expect(result.elementCount).toBe(1);
  });

  it("strips clipboard-only fields", () => {
    const data = makeClipboard([clipboardElement()]);
    const result = convertClipboard(data);

    expect(result.strippedFields).toContain("index");
    expect(result.strippedFields).toContain("frameId");
    expect(result.strippedFields).toContain("containerId");
    expect(result.strippedFields).toContain("polygon");

    const el = result.scene.elements[0] as Record<string, unknown>;
    expect(el.index).toBeUndefined();
    expect(el.frameId).toBeUndefined();
    expect(el.polygon).toBeUndefined();
  });

  it("normalizes coordinates to near origin by default", () => {
    const data = makeClipboard([
      clipboardElement({ x: -5000, y: 2000 }),
      clipboardElement({ x: -4900, y: 2100 }),
    ]);
    const result = convertClipboard(data);

    expect(result.offset).toEqual({ x: -5000, y: 2000 });
    expect(result.scene.elements[0].x).toBe(0);
    expect(result.scene.elements[0].y).toBe(0);
    expect(result.scene.elements[1].x).toBe(100);
    expect(result.scene.elements[1].y).toBe(100);
  });

  it("skips normalization when normalize=false", () => {
    const data = makeClipboard([
      clipboardElement({ x: -5000, y: 2000 }),
    ]);
    const result = convertClipboard(data, { normalize: false });

    expect(result.offset).toEqual({ x: 0, y: 0 });
    expect(result.scene.elements[0].x).toBe(-5000);
    expect(result.scene.elements[0].y).toBe(2000);
  });

  it("preserves files (image data) from clipboard", () => {
    const files = { "img_123": { mimeType: "image/png", id: "img_123", dataURL: "data:image/png;base64,abc" } };
    const data = makeClipboard([clipboardElement()], files);
    const result = convertClipboard(data);

    expect(result.scene.files).toEqual(files);
  });

  it("handles multiple elements of different types", () => {
    const rect = clipboardElement({ type: "rectangle" });
    const textEl = {
      ...clipboardElement({ type: "text" }),
      text: "Hello",
      fontSize: 20,
      fontFamily: 1,
      textAlign: "left",
    };
    const data = makeClipboard([rect, textEl]);
    const result = convertClipboard(data);

    expect(result.elementCount).toBe(2);
    expect(result.scene.elements[0].type).toBe("rectangle");
    expect(result.scene.elements[1].type).toBe("text");
  });

  it("uses custom source when provided", () => {
    const data = makeClipboard([clipboardElement()]);
    const result = convertClipboard(data, { source: "https://custom.dev" });
    expect(result.scene.source).toBe("https://custom.dev");
  });

  it("throws on non-clipboard type", () => {
    expect(() => convertClipboard({ type: "excalidraw", elements: [] })).toThrow(
      'Expected type "excalidraw/clipboard"',
    );
  });

  it("throws on empty elements array", () => {
    expect(() =>
      convertClipboard({ type: "excalidraw/clipboard", elements: [] }),
    ).toThrow("contains no elements");
  });

  it("throws on non-object input", () => {
    expect(() => convertClipboard("not an object")).toThrow("not a valid JSON object");
    expect(() => convertClipboard(null)).toThrow("not a valid JSON object");
  });

  it("throws on invalid element data with descriptive error", () => {
    const bad = { type: "excalidraw/clipboard", elements: [{ id: "x", type: "rectangle" }] };
    expect(() => convertClipboard(bad)).toThrow("failed validation");
  });
});
