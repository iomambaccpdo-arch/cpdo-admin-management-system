import { useState } from 'react'
import { Link } from 'react-router-dom'
import api, { errorMessage } from '../api'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const [loginName, setLoginName] = useState('')
  const [message, setMessage] = useState('')
  const [temporary, setTemporary] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    setTemporary('')
    try {
      const { data } = await api.post('/forgot-password', { login: loginName.trim() })
      setMessage(data.message)
      setTemporary(data.temporary_password || '')
    } catch (err) {
      setError(errorMessage(err, 'Could not reset the password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <Logo size={86} />
        <h1>Reset password</h1>
        <p className="login-sub">Enter the username or email used on this office system.</p>
        <label className="field">
          <span>Username or Email</span>
          <input
            value={loginName}
            onChange={(event) => setLoginName(event.target.value)}
            placeholder="Enter your username or email"
            required
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        {message ? <p className="form-note">{message}</p> : null}
        {temporary ? (
          <p className="temp-password">
            Temporary password: <strong>{temporary}</strong>
          </p>
        ) : null}
        <button className="btn-green login-submit" type="submit" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset password'}
        </button>
        <Link className="back-link" to="/login">
          Back to sign in
        </Link>
      </form>
    </div>
  )
}
