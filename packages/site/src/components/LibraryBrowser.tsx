import { useState, useMemo } from "react";
import type { RegistryEntry } from "../types";
import { LibraryCard } from "./LibraryCard";

interface Props {
  libraries: RegistryEntry[];
  baseUrl: string;
}

export function LibraryBrowser({ libraries, baseUrl }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return libraries;
    const q = search.toLowerCase();
    return libraries.filter(
      (lib) =>
        lib.name.toLowerCase().includes(q) ||
        lib.description?.toLowerCase().includes(q) ||
        lib.itemNames.some((name) => name.toLowerCase().includes(q)) ||
        lib.authors.some((a) => a.name.toLowerCase().includes(q)),
    );
  }, [libraries, search]);

  return (
    <div className="library-browser">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search libraries, items, authors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="result-count">
          {filtered.length} {filtered.length === 1 ? "library" : "libraries"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No libraries match your search.</p>
      ) : (
        <div className="library-grid">
          {filtered.map((lib) => (
            <LibraryCard key={lib.id} library={lib} baseUrl={baseUrl} />
          ))}
        </div>
      )}
    </div>
  );
}
