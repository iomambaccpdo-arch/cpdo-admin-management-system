import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api'
import { useAuth } from '../auth'
import { EyeIcon } from '../components/Icons'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await login(loginName.trim(), password, remember)
      navigate('/dashboard')
    } catch (err) {
      setError(errorMessage(err, 'Invalid username or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <Logo size={86} />
        <h1>
          CPDO Admin Management
          <br />
          System
        </h1>
        <p className="login-sub">Sign in to your account</p>

        <label className="field">
          <span>Username or Email</span>
          <input
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="Enter your username or email"
            autoComplete="username"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <span className="password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon off={showPassword} />
            </button>
          </span>
        </label>

        <div className="login-meta">
          <label className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember me
          </label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="btn-green login-submit" type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
