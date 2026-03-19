// ── Excalidraw element types ────────────────────────────────────────

export type ExcalidrawElementType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "line"
  | "freedraw"
  | "text"
  | "image"
  | "frame";

export type FillStyle = "hachure" | "cross-hatch" | "solid" | "zigzag";
export type StrokeStyle = "solid" | "dashed" | "dotted";
export type RoundnessType = 1 | 2 | 3;

export interface ExcalidrawElement {
  id: string;
  type: ExcalidrawElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  roughness: number;
  opacity: number;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  groupIds: string[];
  boundElements: BoundElement[] | null;
  updated: number;
  link: string | null;
  locked: boolean;
  roundness: { type: RoundnessType; value?: number } | null;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  verticalAlign?: string;
  // Line/arrow-specific
  points?: [number, number][];
  startBinding?: Binding | null;
  endBinding?: Binding | null;
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  // Image-specific
  fileId?: string | null;
  // Frame-specific
  name?: string | null;
}

export interface BoundElement {
  id: string;
  type: "arrow" | "text";
}

export interface Binding {
  elementId: string;
  focus: number;
  gap: number;
}

// ── .excalidraw file ────────────────────────────────────────────────

export interface ExcalidrawFile {
  type: "excalidraw";
  version: number;
  source: string;
  elements: ExcalidrawElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, BinaryFileData>;
}

export interface BinaryFileData {
  mimeType: string;
  id: string;
  dataURL: string;
  created?: number;
  lastRetrieved?: number;
}

// ── .excalidrawlib file ─────────────────────────────────────────────

export interface ExcalidrawLibFile {
  type: "excalidrawlib";
  version: number;
  source: string;
  libraryItems: LibraryItem[];
}

export interface LibraryItem {
  id: string;
  name: string;
  status: "published" | "unpublished";
  elements: ExcalidrawElement[];
  created: number;
}

// ── Registry ────────────────────────────────────────────────────────

export interface RegistryEntry {
  id: string;
  name: string;
  description?: string;
  authors: Array<{ name: string; url?: string }>;
  source: string;
  preview?: string;
  created: string;
  updated: string;
  version: number;
  itemNames: string[];
}

export interface Registry {
  libraries: RegistryEntry[];
  generatedAt: string;
}

// ── Library meta.json ───────────────────────────────────────────────

export interface LibraryMeta {
  name: string;
  description?: string;
  authors: Array<{ name: string; url?: string }>;
}
