import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ChatPage } from './pages/ChatPage'
import { KnowledgeBasePage } from './pages/KnowledgeBasePage'
import { ConnectorsPage } from './pages/ConnectorsPage'
import { SkillsPage } from './pages/SkillsPage'
import { AgentPage } from './pages/AgentPage'
import { ServerErrorPage } from './pages/ServerErrorPage'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ChatPage />} />
        <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/connectors" element={<ConnectorsPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/agent" element={<AgentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
