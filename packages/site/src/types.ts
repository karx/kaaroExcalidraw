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
