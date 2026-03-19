import type { RegistryEntry } from "../types";

interface Props {
  library: RegistryEntry;
  baseUrl: string;
}

export function LibraryCard({ library, baseUrl }: Props) {
  const downloadUrl = `${baseUrl}/${library.source}`;
  const previewUrl = library.preview ? `${baseUrl}/${library.preview}` : null;

  // Import-by-URL: compute excalidraw.com deep link
  const fullLibUrl = new URL(
    `${baseUrl}/${library.source}`,
    window.location.href,
  ).href;
  const importUrl = `https://excalidraw.com/#addLibrary=${encodeURIComponent(fullLibUrl)}`;
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return (
    <div className="library-card">
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`${library.name} preview`}
          className="library-preview"
        />
      )}

      <div className="library-card-header">
        <h2>{library.name}</h2>
        <span className="item-count">
          {library.itemNames.length} items
        </span>
      </div>

      {library.description && (
        <p className="library-description">{library.description}</p>
      )}

      <div className="library-authors">
        {library.authors.map((author, i) => (
          <span key={i} className="author">
            {author.url ? (
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {author.name}
              </a>
            ) : (
              author.name
            )}
          </span>
        ))}
      </div>

      <div className="library-items">
        {library.itemNames.map((name) => (
          <span key={name} className="item-tag">
            {name}
          </span>
        ))}
      </div>

      <div className="library-card-footer">
        <span className="updated">Updated {library.updated}</span>
        <div className="card-actions">
          {!isLocalhost && (
            <a
              href={importUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="import-btn"
              title="Open in Excalidraw and add this library"
            >
              Import
            </a>
          )}
          <a href={downloadUrl} download className="download-btn">
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
