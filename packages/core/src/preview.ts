import type { ExcalidrawElement } from "./types.js";

const PADDING = 20;

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function computeBoundingBox(elements: ExcalidrawElement[]): BBox {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + el.width);
    maxY = Math.max(maxY, el.y + el.height);
  }
  return { minX, minY, maxX, maxY };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strokeDasharray(style: string): string {
  if (style === "dashed") return ' stroke-dasharray="8 4"';
  if (style === "dotted") return ' stroke-dasharray="2 2"';
  return "";
}

function fillValue(bg: string): string {
  return bg === "transparent" ? "none" : bg;
}

function commonAttrs(el: ExcalidrawElement): string {
  const parts: string[] = [];
  parts.push(`stroke="${el.strokeColor}"`);
  parts.push(`fill="${fillValue(el.backgroundColor)}"`);
  parts.push(`stroke-width="${el.strokeWidth}"`);
  parts.push(`opacity="${el.opacity / 100}"`);
  const dash = strokeDasharray(el.strokeStyle);
  if (dash) parts.push(dash.trim());
  return parts.join(" ");
}

function renderElement(el: ExcalidrawElement): string {
  const attrs = commonAttrs(el);

  switch (el.type) {
    case "rectangle": {
      const rx = el.roundness ? Math.min(el.width, el.height) * 0.1 : 0;
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${rx}" ${attrs}/>`;
    }

    case "ellipse": {
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const rx = el.width / 2;
      const ry = el.height / 2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrs}/>`;
    }

    case "diamond": {
      const mx = el.x + el.width / 2;
      const my = el.y + el.height / 2;
      const points = [
        `${mx},${el.y}`,
        `${el.x + el.width},${my}`,
        `${mx},${el.y + el.height}`,
        `${el.x},${my}`,
      ].join(" ");
      return `<polygon points="${points}" ${attrs}/>`;
    }

    case "text": {
      const text = el.text ?? "";
      const fontSize = el.fontSize ?? 16;
      const fontFamily = el.fontFamily === 3 ? "monospace" : el.fontFamily === 2 ? "sans-serif" : "serif";
      const tx = el.x;
      const ty = el.y + fontSize;
      return `<text x="${tx}" y="${ty}" font-size="${fontSize}" font-family="${fontFamily}" fill="${el.strokeColor}" opacity="${el.opacity / 100}">${escapeXml(text)}</text>`;
    }

    case "line":
    case "freedraw": {
      const pts = el.points ?? [];
      if (pts.length === 0) return "";
      const pointsStr = pts.map(([px, py]) => `${el.x + px},${el.y + py}`).join(" ");
      return `<polyline points="${pointsStr}" fill="none" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" opacity="${el.opacity / 100}"${strokeDasharray(el.strokeStyle)}/>`;
    }

    case "arrow": {
      const pts = el.points ?? [];
      if (pts.length === 0) return "";
      const markerId = `arrow-${el.id}`;
      const pointsStr = pts.map(([px, py]) => `${el.x + px},${el.y + py}`).join(" ");
      const markerEnd = el.endArrowhead ? ` marker-end="url(#${markerId})"` : "";
      const markerDef = el.endArrowhead
        ? `<defs><marker id="${markerId}" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="${el.strokeColor}"/></marker></defs>`
        : "";
      return `${markerDef}<polyline points="${pointsStr}" fill="none" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" opacity="${el.opacity / 100}"${strokeDasharray(el.strokeStyle)}${markerEnd}/>`;
    }

    case "image":
    case "frame": {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" stroke="#888" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>`;
    }

    default:
      return "";
  }
}

export function generateSvgPreview(elements: ExcalidrawElement[]): string {
  const bbox = computeBoundingBox(elements);
  const vx = bbox.minX - PADDING;
  const vy = bbox.minY - PADDING;
  const vw = bbox.maxX - bbox.minX + PADDING * 2;
  const vh = bbox.maxY - bbox.minY + PADDING * 2;

  const rendered = elements
    .filter((el) => !el.isDeleted)
    .map(renderElement)
    .filter(Boolean)
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw}" height="${vh}" style="background: #ffffff">
  ${rendered}
</svg>`;
}
