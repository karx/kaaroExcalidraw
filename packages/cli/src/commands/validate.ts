import { readFile } from "node:fs/promises";
import {
  validateExcalidrawFile,
  validateExcalidrawLibFile,
} from "@kaaro/core";

export async function validate(filePath: string): Promise<{ success: boolean; errors?: string[] }> {
  const raw = await readFile(filePath, "utf-8");
  const data = JSON.parse(raw);

  // Detect file type from content
  const type = (data as Record<string, unknown>).type;

  if (type === "excalidraw") {
    return validateExcalidrawFile(data);
  }
  if (type === "excalidrawlib") {
    return validateExcalidrawLibFile(data);
  }

  // Fallback: try to infer from file extension
  if (filePath.endsWith(".excalidrawlib")) {
    return validateExcalidrawLibFile(data);
  }
  if (filePath.endsWith(".excalidraw")) {
    return validateExcalidrawFile(data);
  }

  return {
    success: false,
    errors: [`Unknown file type: "${type}". Expected "excalidraw" or "excalidrawlib".`],
  };
}
