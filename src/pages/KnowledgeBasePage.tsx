import { Link } from 'react-router-dom'
import { FileUpload } from '../components/knowledge-base/FileUpload'
import { FileList } from '../components/knowledge-base/FileList'
import { useAppDispatch, useAppSelector, useApiRequest } from '../store/hooks'
import { fileRemoved, ingestFile } from '../store/knowledge-base/knowledge-base-slice'

export function KnowledgeBasePage() {
  const dispatch = useAppDispatch()
  const files = useAppSelector((state) => state.knowledgeBase.files)
  const { send: uploadFile } = useApiRequest(ingestFile)

  function handleFilesSelected(newFiles: File[]) {
    for (const file of newFiles) {
      uploadFile(file).catch(() => {
        // failure is already reflected in the file's status via the slice
      })
    }
  }

  function handleDelete(id: string) {
    dispatch(fileRemoved(id))
  }

  return (
    <div className="knowledge-base-page">
      <header className="knowledge-base-header">
        <div>
          <h1>Knowledge base</h1>
          <p className="knowledge-base-subtitle">
            Upload documents to make them available to the assistant.
          </p>
        </div>
        <Link to="/" className="back-to-chat-link">
          ← Back to chat
        </Link>
      </header>

      <section className="knowledge-base-section">
        <FileUpload onFilesSelected={handleFilesSelected} />
      </section>

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Uploaded files</h2>
        <FileList files={files} onDelete={handleDelete} />
      </section>
    </div>
  )
}
