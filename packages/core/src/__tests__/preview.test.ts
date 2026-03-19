import { describe, it, expect } from "vitest";
import { generateSvgPreview } from "../preview.js";
import { createElement } from "../builders.js";

describe("generateSvgPreview", () => {
  it("returns a valid SVG string", () => {
    const el = createElement({ type: "rectangle", x: 0, y: 0, width: 100, height: 50 });
    const svg = generateSvgPreview([el]);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("</svg>");
  });

  it("renders rectangle as <rect>", () => {
    const el = createElement({
      type: "rectangle", x: 10, y: 20, width: 100, height: 50,
      strokeColor: "#ff0000", backgroundColor: "#00ff00",
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<rect");
    expect(svg).toContain('stroke="#ff0000"');
    expect(svg).toContain('fill="#00ff00"');
  });

  it("renders ellipse as <ellipse>", () => {
    const el = createElement({ type: "ellipse", x: 0, y: 0, width: 80, height: 60 });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<ellipse");
  });

  it("renders diamond as <polygon>", () => {
    const el = createElement({ type: "diamond", x: 0, y: 0, width: 100, height: 100 });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<polygon");
  });

  it("renders text as <text>", () => {
    const el = createElement({
      type: "text", x: 0, y: 0, width: 100, height: 20,
      text: "Hello World", fontSize: 20, fontFamily: 1,
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<text");
    expect(svg).toContain("Hello World");
  });

  it("renders line as <polyline>", () => {
    const el = createElement({
      type: "line", x: 0, y: 0, width: 100, height: 0,
      points: [[0, 0], [100, 0]],
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<polyline");
  });

  it("renders arrow with arrowhead marker", () => {
    const el = createElement({
      type: "arrow", x: 0, y: 0, width: 100, height: 0,
      points: [[0, 0], [100, 0]],
      endArrowhead: "arrow",
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("<marker");
    expect(svg).toContain("marker-end");
  });

  it("produces valid SVG for empty elements", () => {
    const svg = generateSvgPreview([]);
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain("</svg>");
  });

  it("handles negative coordinates", () => {
    const el = createElement({ type: "rectangle", x: -50, y: -30, width: 100, height: 60 });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("viewBox");
    expect(svg).toContain("<rect");
  });

  it("applies stroke-dasharray for dashed style", () => {
    const el = createElement({
      type: "rectangle", x: 0, y: 0, width: 100, height: 50,
      strokeStyle: "dashed",
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("stroke-dasharray");
  });

  it("applies stroke-dasharray for dotted style", () => {
    const el = createElement({
      type: "rectangle", x: 0, y: 0, width: 100, height: 50,
      strokeStyle: "dotted",
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain("stroke-dasharray");
  });

  it("handles multiple elements", () => {
    const els = [
      createElement({ type: "rectangle", x: 0, y: 0, width: 100, height: 50 }),
      createElement({ type: "ellipse", x: 150, y: 0, width: 80, height: 80 }),
      createElement({ type: "text", x: 0, y: 100, width: 200, height: 30, text: "Label", fontSize: 16, fontFamily: 1 }),
    ];
    const svg = generateSvgPreview(els);
    expect(svg).toContain("<rect");
    expect(svg).toContain("<ellipse");
    expect(svg).toContain("<text");
  });

  it("sets opacity on elements", () => {
    const el = createElement({
      type: "rectangle", x: 0, y: 0, width: 100, height: 50,
      opacity: 50,
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain('opacity="0.5"');
  });

  it("handles transparent backgroundColor as none fill", () => {
    const el = createElement({
      type: "rectangle", x: 0, y: 0, width: 100, height: 50,
      backgroundColor: "transparent",
    });
    const svg = generateSvgPreview([el]);
    expect(svg).toContain('fill="none"');
  });
});
