import type { Conversation } from '../../types/chat'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  userName?: string
  onLogout: () => void
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, userName, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="brand">RAG Chat</span>
        <button className="new-chat-btn" onClick={onNew}>
          + New
        </button>
      </div>
      <div className="conversation-list">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conversation-item ${c.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <div className="conversation-title">{c.title || 'New chat'}</div>
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
        ))}
      </div>
      <div className="sidebar-footer">
        {userName && <span className="user-name">{userName}</span>}
        <button className="logout-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </aside>
  )
}
