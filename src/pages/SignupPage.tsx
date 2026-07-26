import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApiRequest } from '../store/hooks'
import { signup } from '../store/auth/auth-slice'
import { BrandLogo } from '../components/common/BrandLogo'

export function SignupPage() {
  const navigate = useNavigate()
  const { send, loading, error } = useApiRequest(signup)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    try {
      await send({ name, email, password })
      navigate('/')
    } catch {
      // error is already captured by useApiRequest
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-brand">
          <BrandLogo size={32} />
        </div>
        <h1>Create your account</h1>
        <p className="auth-subtitle">Get started with Waypoint</p>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  )
}
