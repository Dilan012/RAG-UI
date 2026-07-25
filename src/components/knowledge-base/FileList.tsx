import type { KnowledgeBaseFile } from '../../types/knowledge-base'

interface FileListProps {
  files: KnowledgeBaseFile[]
  onDelete: (id: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function statusText(file: KnowledgeBaseFile): string {
  if (file.status === 'uploading') return file.source === 'text' ? 'Adding…' : 'Uploading…'
  if (file.status === 'error') return file.errorMessage ?? 'Failed'
  return `added ${formatDate(file.uploadedAt)}`
}

function FileIcon() {
  return (
    <svg className="file-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TextIcon() {
  return (
    <svg className="file-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function FileList({ files, onDelete }: FileListProps) {
  if (files.length === 0) {
    return <div className="empty-state">No knowledge base entries yet.</div>
  }

  return (
    <ul className="file-list">
      {files.map((file) => (
        <li key={file.id} className={`file-item file-item-${file.status}`}>
          {file.source === 'text' ? <TextIcon /> : <FileIcon />}
          <div className="file-info">
            <div className="file-name">{file.name}</div>
            <div className="file-meta">
              {formatSize(file.size)} · {statusText(file)}
            </div>
          </div>
          <button
            className="file-delete-btn"
            onClick={() => onDelete(file.id)}
            aria-label={`Delete ${file.name}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
