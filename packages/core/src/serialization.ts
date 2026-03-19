import { readFile, writeFile } from "node:fs/promises";
import type { ExcalidrawFile, ExcalidrawLibFile } from "./types.js";
import {
  ExcalidrawFileSchema,
  ExcalidrawLibFileSchema,
} from "./validators.js";

export async function readExcalidrawFile(filePath: string): Promise<ExcalidrawFile> {
  const raw = await readFile(filePath, "utf-8");
  const data = JSON.parse(raw);
  const result = ExcalidrawFileSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid .excalidraw file: ${errors.join("; ")}`);
  }
  return result.data as ExcalidrawFile;
}

export async function readLibFile(filePath: string): Promise<ExcalidrawLibFile> {
  const raw = await readFile(filePath, "utf-8");
  const data = JSON.parse(raw);
  const result = ExcalidrawLibFileSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid .excalidrawlib file: ${errors.join("; ")}`);
  }
  return result.data as ExcalidrawLibFile;
}

export async function writeExcalidrawFile(
  filePath: string,
  data: ExcalidrawFile,
): Promise<void> {
  const result = ExcalidrawFileSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid .excalidraw data: ${errors.join("; ")}`);
  }
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function writeLibFile(
  filePath: string,
  data: ExcalidrawLibFile,
): Promise<void> {
  const result = ExcalidrawLibFileSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid .excalidrawlib data: ${errors.join("; ")}`);
  }
  await writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
