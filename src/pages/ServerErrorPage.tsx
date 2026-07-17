import { Link } from 'react-router-dom'
import { ERROR_CODES } from '../errors/error-codes'

export function ServerErrorPage() {
  return (
    <div className="auth-page">
      <div className="auth-form">
        <h1>500 — {ERROR_CODES.INTERNAL_ERROR.message}</h1>
        <p className="auth-switch">Something went wrong on our end. Please try again in a moment.</p>
        <Link to="/">Back to chat</Link>
      </div>
    </div>
  )
}
