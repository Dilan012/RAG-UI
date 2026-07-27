import { useEffect } from 'react'
import { FileUpload } from '../components/knowledge-base/FileUpload'
import { TextInput } from '../components/knowledge-base/TextInput'
import { FileList } from '../components/knowledge-base/FileList'
import { PageHeader } from '../components/common/PageHeader'
import { useAppSelector, useApiRequest } from '../store/hooks'
import { fetchKnowledgeBaseFiles, ingestFile, ingestText } from '../store/knowledge-base/knowledge-base-slice'

export function KnowledgeBasePage() {
  const files = useAppSelector((state) => state.knowledgeBase.files)
  const { send: loadFiles } = useApiRequest(fetchKnowledgeBaseFiles)
  const { send: uploadFile } = useApiRequest(ingestFile)
  const { send: addText, loading: isAddingText } = useApiRequest(ingestText)

  useEffect(() => {
    loadFiles(undefined).catch(() => {
      // error is non-fatal; the list just stays empty
    })
  }, [loadFiles])

  function handleFilesSelected(newFiles: File[]) {
    for (const file of newFiles) {
      uploadFile(file).catch(() => {
        // failure is already reflected in the file's status via the slice
      })
    }
  }

  function handleTextSubmit(text: string) {
    addText(text).catch(() => {
      // failure is already reflected in the entry's status via the slice
    })
  }

  return (
    <div className="knowledge-base-page">
      <PageHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Knowledge base"
        subtitle="Upload documents or paste text to make them available to the assistant."
      />

      <section className="knowledge-base-section">
        <FileUpload onFilesSelected={handleFilesSelected} />
      </section>

      <section className="knowledge-base-section">
        <TextInput onSubmit={handleTextSubmit} isSubmitting={isAddingText} />
      </section>

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Knowledge base entries</h2>
        <FileList files={files} />
      </section>
    </div>
  )
}
