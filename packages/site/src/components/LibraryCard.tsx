import type { RegistryEntry } from "../types";

interface Props {
  library: RegistryEntry;
  baseUrl: string;
}

export function LibraryCard({ library, baseUrl }: Props) {
  const downloadUrl = `${baseUrl}/${library.source}`;

  return (
    <div className="library-card">
      <div className="library-card-header">
        <h2>{library.name}</h2>
        <span className="item-count">{library.itemNames.length} items</span>
      </div>

      {library.description && (
        <p className="library-description">{library.description}</p>
      )}

      <div className="library-authors">
        {library.authors.map((author, i) => (
          <span key={i} className="author">
            {author.url ? (
              <a href={author.url} target="_blank" rel="noopener noreferrer">
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
        <a href={downloadUrl} download className="download-btn">
          Download .excalidrawlib
        </a>
      </div>
    </div>
  );
}
