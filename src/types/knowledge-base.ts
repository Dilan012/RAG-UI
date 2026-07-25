export interface KnowledgeBaseFile {
  id: string
  name: string
  size: number
  uploadedAt: number
  status: 'uploading' | 'uploaded' | 'error'
  errorMessage?: string
  source: 'file' | 'text'
}
