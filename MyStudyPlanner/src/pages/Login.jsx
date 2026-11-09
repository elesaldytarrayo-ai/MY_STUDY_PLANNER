import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { OWNER_EMAIL } from '../services/authService'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-brand">
          <div className="auth-logo"><GraduationCap size={24} /></div>
          <div>
            <h1>MyStudyPlanner</h1>
            <p>Know what to study today</p>
          </div>
        </div>

        <div className="auth-owner">
          <div className="auth-avatar">ET</div>
          <div>
            <strong>Elesaldy Tarrayo</strong>
            <span>OWNER / ADMIN · Personal account</span>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label>Email address</label>
          <div className="input-wrap">
            <Mail size={16} />
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@mystudyplanner.local"
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="field">
          <label>Password</label>
          <div className="input-wrap">
            <Lock size={16} />
            <input
              className="input"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="input-eye"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button className="btn btn-primary auth-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in to workspace'}
        </button>

        <p className="auth-hint">
          First run creates the owner account with the password
          <code>Study@ET2026!Planner</code>. Change it in Settings after signing in.
        </p>
      </form>
    </div>
  )
}