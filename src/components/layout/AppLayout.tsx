import { useEffect, useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from '../chat/Sidebar'
import { useAppDispatch, useAppSelector, useApiRequest } from '../../store/hooks'
import { logout } from '../../store/auth/auth-slice'
import {
  conversationSelected,
  createConversation,
  deleteConversation,
  fetchConversations,
  renameConversation,
} from '../../store/chat/chat-slice'

export function AppLayout() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const conversations = useAppSelector((state) => state.chat.conversations)
  const activeId = useAppSelector((state) => state.chat.activeId)

  const { send: loadConversations } = useApiRequest(fetchConversations)
  const { send: addConversation } = useApiRequest(createConversation)
  const { send: editConversation } = useApiRequest(renameConversation)
  const { send: removeConversation } = useApiRequest(deleteConversation)

  useEffect(() => {
    loadConversations(undefined).catch(() => {
      // error surfaced via the failed request; nothing else to do here
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNewConversation() {
    try {
      await addConversation('New chat')
      navigate('/')
    } catch {
      // error already captured by useApiRequest
    }
  }

  function handleSelectConversation(id: string) {
    dispatch(conversationSelected(id))
    navigate('/')
  }

  function handleRenameConversation(id: string, currentName: string) {
    const name = window.prompt('Rename conversation', currentName)?.trim()
    if (!name || name === currentName) return
    editConversation({ id, name }).catch(() => {
      // error already captured by useApiRequest
    })
  }

  function handleDeleteConversation(id: string) {
    removeConversation(id).catch(() => {
      // error already captured by useApiRequest
    })
  }

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [conversations],
  )

  return (
    <div className="app">
      <Sidebar
        conversations={sortedConversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onRename={handleRenameConversation}
        onDelete={handleDeleteConversation}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <main className="chat-panel">
        <Outlet />
      </main>
    </div>
  )
}
