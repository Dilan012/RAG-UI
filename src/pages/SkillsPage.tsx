import { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'

interface Skill {
  id: string
  name: string
  description: string
  enabled: boolean
}

const initialSkills: Skill[] = [
  { id: 'web-search', name: 'Web search', description: 'Look up current information on the web to answer questions.', enabled: true },
  { id: 'data-analysis', name: 'Data analysis', description: 'Summarize and chart data from uploaded files.', enabled: false },
  { id: 'document-summary', name: 'Document summarization', description: 'Condense long reports, contracts, or PDFs into key points.', enabled: true },
  { id: 'email-drafting', name: 'Email drafting', description: 'Draft replies and outbound emails in your voice, ready to review.', enabled: true },
  { id: 'meeting-notes', name: 'Meeting notes', description: 'Turn a transcript or rough notes into a clean summary with action items.', enabled: false },
  { id: 'spreadsheet-helper', name: 'Spreadsheet helper', description: 'Explain formulas and clean up messy tabular data.', enabled: false },
]

function SkillIcon({ id }: { id: string }) {
  switch (id) {
    case 'web-search':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
      )
    case 'data-analysis':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
        </svg>
      )
    case 'document-summary':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M9 12h6M9 16h6" strokeLinecap="round" />
        </svg>
      )
    case 'email-drafting':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'meeting-notes':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c1.2-4 4-6 7.5-6s6.3 2 7.5 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 9.5l1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h3v3H8zM13 9h3M8 15h3M13 15h3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

export function SkillsPage() {
  const [skills, setSkills] = useState(initialSkills)

  function toggleSkill(id: string) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  return (
    <div className="knowledge-base-page">
      <PageHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        title="Skills"
        subtitle="Turn on capabilities the assistant can use while chatting."
      />

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Available skills</h2>
        <div className="connector-list">
          {skills.map((skill) => (
            <div key={skill.id} className="connector-card">
              <div className="connector-card-icon">
                <SkillIcon id={skill.id} />
              </div>
              <div className="connector-card-body">
                <div className="connector-card-title-row">
                  <span className="connector-card-name">{skill.name}</span>
                  <span className="demo-badge">Demo</span>
                </div>
                <p className="connector-card-description">{skill.description}</p>
              </div>
              <div className="connector-card-actions">
                <button
                  className={`toggle-switch ${skill.enabled ? 'on' : ''}`}
                  role="switch"
                  aria-checked={skill.enabled}
                  aria-label={`Toggle ${skill.name}`}
                  onClick={() => toggleSkill(skill.id)}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
