import { useEffect, useState } from "react";
import type { Registry } from "./types";
import { LibraryBrowser } from "./components/LibraryBrowser";
import "./styles.css";

export function App() {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("./cdn/registry.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setRegistry(data as Registry))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Kaaro Excalidraw Libraries</h1>
        <p className="subtitle">
          Browse and download reusable Excalidraw component libraries
        </p>
      </header>

      <main>
        {error && (
          <div className="error">
            Failed to load registry: {error}. Run{" "}
            <code>kaaro registry</code> to generate it.
          </div>
        )}

        {!registry && !error && <p className="loading">Loading libraries...</p>}

        {registry && (
          <>
            <LibraryBrowser
              libraries={registry.libraries}
              baseUrl="./cdn"
            />
            <footer>
              <p>
                Registry generated{" "}
                {new Date(registry.generatedAt).toLocaleDateString()}
              </p>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
