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
            <div className="conversation-title">{c.name || 'New chat'}</div>
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
