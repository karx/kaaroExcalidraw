import type { ExcalidrawElement, ExcalidrawFile } from "./types.js";
import { ExcalidrawElementSchema } from "./validators.js";
import { createSceneFile } from "./builders.js";

export interface ClipboardData {
  type: "excalidraw/clipboard";
  elements: Record<string, unknown>[];
  files?: Record<string, unknown>;
}

export interface ConvertResult {
  scene: ExcalidrawFile;
  elementCount: number;
  offset: { x: number; y: number };
  strippedFields: string[];
}

/**
 * Known fields that Excalidraw clipboard adds but our schema doesn't include.
 * These are safely stripped during conversion.
 */
const CLIPBOARD_ONLY_FIELDS = [
  "index",
  "frameId",
  "containerId",
  "originalText",
  "autoResize",
  "lineHeight",
  "polygon",
];

/**
 * Convert Excalidraw clipboard JSON into a valid .excalidraw scene file.
 *
 * Handles:
 * - Stripping clipboard-only fields (index, frameId, polygon, etc.)
 * - Normalizing coordinates so top-left is near (0, 0)
 * - Wrapping elements in a proper ExcalidrawFile envelope
 * - Preserving embedded file data (images)
 */
export function convertClipboard(
  data: unknown,
  opts: { normalize?: boolean; source?: string } = {},
): ConvertResult {
  const { normalize = true, source } = opts;

  // Parse and validate input shape
  if (!data || typeof data !== "object") {
    throw new Error("Input is not a valid JSON object");
  }

  const raw = data as Record<string, unknown>;

  if (raw.type !== "excalidraw/clipboard") {
    throw new Error(
      `Expected type "excalidraw/clipboard", got "${String(raw.type)}"`,
    );
  }

  if (!Array.isArray(raw.elements) || raw.elements.length === 0) {
    throw new Error("Clipboard data contains no elements");
  }

  const rawElements = raw.elements as Record<string, unknown>[];

  // Strip clipboard-only fields
  const strippedFields = new Set<string>();
  const cleaned = rawElements.map((el) => {
    const copy = { ...el };
    for (const field of CLIPBOARD_ONLY_FIELDS) {
      if (field in copy) {
        strippedFields.add(field);
        delete copy[field];
      }
    }
    return copy;
  });

  // Normalize coordinates
  let offset = { x: 0, y: 0 };
  if (normalize) {
    const xs = cleaned.map((el) => el.x as number);
    const ys = cleaned.map((el) => el.y as number);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    offset = { x: minX, y: minY };

    for (const el of cleaned) {
      el.x = (el.x as number) - minX;
      el.y = (el.y as number) - minY;
    }
  }

  // Validate each element through our schema (strip unknown fields via parse)
  const elements: ExcalidrawElement[] = [];
  const errors: string[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const result = ExcalidrawElementSchema.safeParse(cleaned[i]);
    if (result.success) {
      elements.push(result.data as ExcalidrawElement);
    } else {
      const issues = result.error.issues
        .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
        .join("; ");
      errors.push(`Element ${i} (${String(cleaned[i].id)}): ${issues}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `${errors.length} element(s) failed validation:\n${errors.join("\n")}`,
    );
  }

  // Build scene, preserving files (image data) if present
  const scene = createSceneFile(elements, source);
  if (raw.files && typeof raw.files === "object") {
    scene.files = raw.files as Record<string, any>;
  }

  return {
    scene,
    elementCount: elements.length,
    offset,
    strippedFields: [...strippedFields],
  };
}
