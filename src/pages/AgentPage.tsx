import { useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'

const availableTools = ['Web search', 'Document summarization', 'Email drafting', 'Gmail', 'Knowledge base']

export function AgentPage() {
  const [active, setActive] = useState(true)
  const [instructions, setInstructions] = useState(
    'You are Waypoint, a helpful assistant. Use the connected tools and the knowledge base when they help answer the question.',
  )
  const [enabledTools, setEnabledTools] = useState<string[]>(['Web search', 'Knowledge base'])

  function toggleTool(tool: string) {
    setEnabledTools((prev) => (prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]))
  }

  return (
    <div className="knowledge-base-page">
      <PageHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="5" y="8" width="14" height="11" rx="2.5" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2M9.5 13.5v1M14.5 13.5v1" strokeLinecap="round" />
          </svg>
        }
        title="Agent"
        subtitle="Configure how the assistant behaves and which tools it can call on its own."
      />

      <section className="knowledge-base-section">
        <div className="connector-card agent-status-card">
          <div className="connector-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="connector-card-body">
            <div className="connector-card-title-row">
              <span className="connector-card-name">Waypoint agent</span>
              <span className="demo-badge">Demo</span>
            </div>
            <p className="connector-card-description">
              {active ? 'Active — able to call tools automatically during chat.' : 'Paused — will only reply with plain text.'}
            </p>
          </div>
          <div className="connector-card-actions">
            <button
              className={`toggle-switch ${active ? 'on' : ''}`}
              role="switch"
              aria-checked={active}
              aria-label="Toggle agent"
              onClick={() => setActive((a) => !a)}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>
      </section>

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Instructions</h2>
        <textarea
          className="text-input-textarea"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
        />
      </section>

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Tools the agent can use</h2>
        <div className="connector-list">
          {availableTools.map((tool) => {
            const enabled = enabledTools.includes(tool)
            return (
              <div key={tool} className="connector-card">
                <div className="connector-card-body">
                  <span className="connector-card-name">{tool}</span>
                </div>
                <div className="connector-card-actions">
                  <button
                    className={`toggle-switch ${enabled ? 'on' : ''}`}
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`Toggle ${tool}`}
                    onClick={() => toggleTool(tool)}
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
