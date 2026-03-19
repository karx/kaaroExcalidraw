import { readFile } from "node:fs/promises";
import {
  convertClipboard,
  writeExcalidrawFile,
} from "@kaaro/core";

export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  noNormalize?: boolean;
  source?: string;
}

export async function convert(opts: ConvertOptions): Promise<{
  elementCount: number;
  outputPath: string;
  offset: { x: number; y: number };
  strippedFields: string[];
}> {
  const raw = await readFile(opts.inputPath, "utf-8");
  const data = JSON.parse(raw);

  const result = convertClipboard(data, {
    normalize: !opts.noNormalize,
    source: opts.source,
  });

  await writeExcalidrawFile(opts.outputPath, result.scene);

  return {
    elementCount: result.elementCount,
    outputPath: opts.outputPath,
    offset: result.offset,
    strippedFields: result.strippedFields,
  };
}
