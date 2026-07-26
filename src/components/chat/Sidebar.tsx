import { NavLink } from 'react-router-dom'
import { BrandLogo } from '../common/BrandLogo'
import type { ConversationSummary } from '../../types/conversation'

interface SidebarProps {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string, currentName: string) => void
  onDelete: (id: string) => void
  userName?: string
  onLogout: () => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const chars = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '')
  return chars.join('') || '?'
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  userName,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <BrandLogo size={26} />
      </div>

      <div className="sidebar-actions">
        <button className="new-chat-btn" onClick={onNew}>
          <span className="new-chat-icon">+</span> New chat
        </button>
        <NavLink to="/knowledge-base" className={({ isActive }) => `knowledge-base-link ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Knowledge base
        </NavLink>
        <NavLink to="/connectors" className={({ isActive }) => `knowledge-base-link ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path d="M8.2 7.2 15.8 16.8M15.8 7.2 8.2 16.8M8.5 6h7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Connectors
        </NavLink>
        <NavLink to="/skills" className={({ isActive }) => `knowledge-base-link ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Skills
        </NavLink>
        <NavLink to="/agent" className={({ isActive }) => `knowledge-base-link ${isActive ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="5" y="8" width="14" height="11" rx="2.5" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2M9.5 13.5v1M14.5 13.5v1" strokeLinecap="round" />
          </svg>
          Agent
        </NavLink>
      </div>

      <div className="conversation-list">
        <div className="conversation-list-label">Conversations</div>
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conversation-item ${c.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <div className="conversation-title">{c.name || 'New chat'}</div>
            <div className="conversation-item-actions">
              <button
                className="rename-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onRename(c.id, c.name)
                }}
                aria-label="Rename conversation"
              >
                ✎
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(c.id)
                }}
                aria-label="Delete conversation"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        {userName && (
          <div className="user-badge">
            <span className="user-avatar">{initials(userName)}</span>
            <span className="user-name">{userName}</span>
          </div>
        )}
        <button className="logout-btn" onClick={onLogout} aria-label="Log out">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  )
}
