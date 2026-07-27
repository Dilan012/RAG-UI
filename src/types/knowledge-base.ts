export interface KnowledgeBaseFile {
  id: string
  name: string
  size: number
  uploadedAt: number
  status: 'uploading' | 'uploaded' | 'error'
  errorMessage?: string
  source: 'file' | 'text'
}

// The persisted shape returned by the backend (see RAG's
// KnowledgeBaseDocumentSummary) — every entry in KnowledgeBaseFile with
// status 'uploaded' originated from one of these.
export interface KnowledgeBaseDocument {
  id: string
  fileName: string
  mimeType: string
  source: 'file' | 'text'
  sizeBytes: number
  chunkCount: number
  createdAt: string
}
