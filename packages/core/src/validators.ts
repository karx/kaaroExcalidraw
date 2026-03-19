import { z } from "zod";

// ── Element schemas ─────────────────────────────────────────────────

const ExcalidrawElementTypeSchema = z.enum([
  "rectangle",
  "ellipse",
  "diamond",
  "arrow",
  "line",
  "freedraw",
  "text",
  "image",
  "frame",
]);

const FillStyleSchema = z.enum(["hachure", "cross-hatch", "solid", "zigzag"]);
const StrokeStyleSchema = z.enum(["solid", "dashed", "dotted"]);

const BoundElementSchema = z.object({
  id: z.string(),
  type: z.enum(["arrow", "text"]),
});

const BindingSchema = z.object({
  elementId: z.string(),
  focus: z.number(),
  gap: z.number(),
});

export const ExcalidrawElementSchema = z.object({
  id: z.string().min(1),
  type: ExcalidrawElementTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  angle: z.number(),
  strokeColor: z.string(),
  backgroundColor: z.string(),
  fillStyle: FillStyleSchema,
  strokeWidth: z.number(),
  strokeStyle: StrokeStyleSchema,
  roughness: z.number(),
  opacity: z.number().min(0).max(100),
  seed: z.number(),
  version: z.number(),
  versionNonce: z.number(),
  isDeleted: z.boolean(),
  groupIds: z.array(z.string()),
  boundElements: z.array(BoundElementSchema).nullable(),
  updated: z.number(),
  link: z.string().nullable(),
  locked: z.boolean(),
  roundness: z
    .object({ type: z.number(), value: z.number().optional() })
    .nullable(),
  // Optional fields for specific element types
  text: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.number().optional(),
  textAlign: z.string().optional(),
  verticalAlign: z.string().optional(),
  points: z.array(z.tuple([z.number(), z.number()])).optional(),
  startBinding: BindingSchema.nullable().optional(),
  endBinding: BindingSchema.nullable().optional(),
  startArrowhead: z.string().nullable().optional(),
  endArrowhead: z.string().nullable().optional(),
  fileId: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
});

// ── Library item schema ─────────────────────────────────────────────

export const LibraryItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(["published", "unpublished"]),
  elements: z.array(ExcalidrawElementSchema),
  created: z.number(),
});

// ── .excalidraw file schema ─────────────────────────────────────────

export const ExcalidrawFileSchema = z.object({
  type: z.literal("excalidraw"),
  version: z.number(),
  source: z.string(),
  elements: z.array(ExcalidrawElementSchema),
  appState: z.record(z.unknown()).optional(),
  files: z.record(z.unknown()).optional(),
});

// ── .excalidrawlib file schema ──────────────────────────────────────

export const ExcalidrawLibFileSchema = z.object({
  type: z.literal("excalidrawlib"),
  version: z.number(),
  source: z.string(),
  libraryItems: z.array(LibraryItemSchema),
});

// ── Validation functions ────────────────────────────────────────────

export interface ValidationResult {
  success: boolean;
  errors?: string[];
}

export function validateExcalidrawFile(data: unknown): ValidationResult {
  const result = ExcalidrawFileSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    ),
  };
}

export function validateExcalidrawLibFile(data: unknown): ValidationResult {
  const result = ExcalidrawLibFileSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    ),
  };
}

export function validateLibraryItem(data: unknown): ValidationResult {
  const result = LibraryItemSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  return {
    success: false,
    errors: result.error.issues.map(
      (i) => `${i.path.join(".")}: ${i.message}`,
    ),
  };
}
