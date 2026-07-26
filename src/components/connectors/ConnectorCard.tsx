import type { ReactNode } from 'react'

interface ConnectorCardProps {
  icon: ReactNode
  name: string
  description: string
  connected: boolean
  connectedLabel?: string
  actionLabel: string
  actionLoading: boolean
  onAction: () => void
  disconnectLoading?: boolean
  onDisconnect?: () => void
  disabled?: boolean
}

export function ConnectorCard({
  icon,
  name,
  description,
  connected,
  connectedLabel,
  actionLabel,
  actionLoading,
  onAction,
  disconnectLoading,
  onDisconnect,
  disabled,
}: ConnectorCardProps) {
  return (
    <div className="connector-card">
      <div className="connector-card-icon">{icon}</div>
      <div className="connector-card-body">
        <div className="connector-card-title-row">
          <span className="connector-card-name">{name}</span>
          {connected && <span className="connector-status-badge">Connected</span>}
        </div>
        <p className="connector-card-description">
          {connected && connectedLabel ? connectedLabel : description}
        </p>
      </div>
      <div className="connector-card-actions">
        {connected ? (
          <button className="connector-disconnect-btn" onClick={onDisconnect} disabled={disconnectLoading}>
            {disconnectLoading ? 'Disconnecting…' : 'Disconnect'}
          </button>
        ) : (
          <button className="connector-connect-btn" onClick={onAction} disabled={actionLoading || disabled}>
            {actionLoading ? 'Connecting…' : actionLabel}
          </button>
        )}
      </div>
    </div>
  )
}
