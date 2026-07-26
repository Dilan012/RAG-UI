import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConnectorCard } from '../components/connectors/ConnectorCard'
import { PageHeader } from '../components/common/PageHeader'
import { useAppSelector, useApiRequest } from '../store/hooks'
import { fetchGmailStatus, getGmailAuthUrl, disconnectGmail } from '../store/connectors/connectors-slice'
import gmailIcon from '../assets/connectors/gmail.webp'
import slackIcon from '../assets/connectors/slack.png'

function NotionIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 8h5l3 8V8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ConnectorsPage() {
  const gmail = useAppSelector((state) => state.connectors.gmail)
  const { send: loadStatus } = useApiRequest(fetchGmailStatus)
  const { send: startConnect, loading: connecting } = useApiRequest(getGmailAuthUrl)
  const { send: disconnect, loading: disconnecting } = useApiRequest(disconnectGmail)
  const [searchParams, setSearchParams] = useSearchParams()
  const [banner, setBanner] = useState<'connected' | 'error' | null>(null)

  useEffect(() => {
    loadStatus(undefined).catch(() => {
      // error surfaced via useApiRequest; status stays disconnected in state
    })
  }, [loadStatus])

  useEffect(() => {
    const gmailParam = searchParams.get('gmail')
    if (gmailParam === 'connected' || gmailParam === 'error') {
      setBanner(gmailParam)
      searchParams.delete('gmail')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  async function handleConnectGmail() {
    try {
      const authUrl = await startConnect(undefined)
      window.location.assign(authUrl)
    } catch {
      // error already captured by useApiRequest
    }
  }

  function handleDisconnectGmail() {
    disconnect(undefined).catch(() => {
      // error already captured by useApiRequest
    })
  }

  return (
    <div className="knowledge-base-page">
      <PageHeader
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="6" cy="6" r="2.5" />
            <circle cx="18" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            <path d="M8.2 7.2 15.8 16.8M15.8 7.2 8.2 16.8M8.5 6h7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        }
        title="Connectors"
        subtitle="Connect external services so the assistant can use them as tools."
      />

      {banner === 'connected' && (
        <div className="connector-banner connector-banner-success">Gmail connected successfully.</div>
      )}
      {banner === 'error' && (
        <div className="connector-banner connector-banner-error">Couldn't connect Gmail. Please try again.</div>
      )}

      <section className="knowledge-base-section">
        <h2 className="knowledge-base-section-title">Available connectors</h2>
        <div className="connector-list">
          <ConnectorCard
            icon={<img src={gmailIcon} alt="" className="connector-card-icon-img" />}
            name="Gmail"
            description="Let the assistant search, read, and send email from your Gmail account."
            connected={gmail.connected}
            connectedLabel={gmail.googleEmail ? `Connected as ${gmail.googleEmail}` : undefined}
            actionLabel="Connect"
            actionLoading={connecting}
            onAction={handleConnectGmail}
            disconnectLoading={disconnecting}
            onDisconnect={handleDisconnectGmail}
          />
          <ConnectorCard
            icon={<img src={slackIcon} alt="" className="connector-card-icon-img" />}
            name="Slack"
            description="Coming soon — send and read messages in your workspace."
            connected={false}
            actionLabel="Coming soon"
            actionLoading={false}
            onAction={() => {}}
            disabled
          />
          <ConnectorCard
            icon={<NotionIcon />}
            name="Notion"
            description="Coming soon — search and reference your Notion workspace."
            connected={false}
            actionLabel="Coming soon"
            actionLoading={false}
            onAction={() => {}}
            disabled
          />
        </div>
      </section>
    </div>
  )
}
