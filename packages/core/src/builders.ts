import { nanoid } from "nanoid";
import type {
  ExcalidrawElement,
  ExcalidrawElementType,
  ExcalidrawFile,
  ExcalidrawLibFile,
  FillStyle,
  LibraryItem,
  StrokeStyle,
} from "./types.js";

export interface ElementSkeleton {
  type: ExcalidrawElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  id?: string;
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: FillStyle;
  strokeWidth?: number;
  strokeStyle?: StrokeStyle;
  roughness?: number;
  opacity?: number;
  angle?: number;
  locked?: boolean;
  // Text-specific
  text?: string;
  fontSize?: number;
  fontFamily?: number;
  textAlign?: string;
  verticalAlign?: string;
  // Line/arrow-specific
  points?: [number, number][];
  startArrowhead?: string | null;
  endArrowhead?: string | null;
  // Image-specific
  fileId?: string | null;
  // Frame-specific
  name?: string | null;
}

export function createElement(skeleton: ElementSkeleton): ExcalidrawElement {
  return {
    id: skeleton.id ?? nanoid(),
    type: skeleton.type,
    x: skeleton.x,
    y: skeleton.y,
    width: skeleton.width,
    height: skeleton.height,
    angle: skeleton.angle ?? 0,
    strokeColor: skeleton.strokeColor ?? "#1e1e1e",
    backgroundColor: skeleton.backgroundColor ?? "transparent",
    fillStyle: skeleton.fillStyle ?? "solid",
    strokeWidth: skeleton.strokeWidth ?? 2,
    strokeStyle: skeleton.strokeStyle ?? "solid",
    roughness: skeleton.roughness ?? 1,
    opacity: skeleton.opacity ?? 100,
    seed: Math.floor(Math.random() * 2147483647),
    version: 1,
    versionNonce: Math.floor(Math.random() * 2147483647),
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: skeleton.locked ?? false,
    roundness: skeleton.type === "line" || skeleton.type === "arrow"
      ? { type: 2 }
      : { type: 3 },
    // Optional type-specific fields
    ...(skeleton.text !== undefined && { text: skeleton.text }),
    ...(skeleton.fontSize !== undefined && { fontSize: skeleton.fontSize }),
    ...(skeleton.fontFamily !== undefined && { fontFamily: skeleton.fontFamily }),
    ...(skeleton.textAlign !== undefined && { textAlign: skeleton.textAlign }),
    ...(skeleton.verticalAlign !== undefined && { verticalAlign: skeleton.verticalAlign }),
    ...(skeleton.points !== undefined && { points: skeleton.points }),
    ...(skeleton.startArrowhead !== undefined && { startArrowhead: skeleton.startArrowhead }),
    ...(skeleton.endArrowhead !== undefined && { endArrowhead: skeleton.endArrowhead }),
    ...(skeleton.fileId !== undefined && { fileId: skeleton.fileId }),
    ...(skeleton.name !== undefined && { name: skeleton.name }),
  };
}

export function createLibraryItem(opts: {
  name: string;
  elements: ExcalidrawElement[];
  id?: string;
  status?: "published" | "unpublished";
}): LibraryItem {
  return {
    id: opts.id ?? nanoid(),
    name: opts.name,
    status: opts.status ?? "published",
    elements: opts.elements,
    created: Date.now(),
  };
}

export function createLibFile(
  items: LibraryItem[],
  source = "https://kaaro.dev",
): ExcalidrawLibFile {
  return {
    type: "excalidrawlib",
    version: 2,
    source,
    libraryItems: items,
  };
}

export function createSceneFile(
  elements: ExcalidrawElement[],
  source = "https://kaaro.dev",
): ExcalidrawFile {
  return {
    type: "excalidraw",
    version: 2,
    source,
    elements,
    appState: {},
    files: {},
  };
}
