import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { useAuth } from '../auth'

export default function AccountModal({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setCurrent('')
    setPassword('')
    setConfirmation('')
    setMessage('')
    setError('')

    function onKey(event) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await api.put('/password', {
        current_password: current,
        password,
        password_confirmation: confirmation,
      })
      setMessage(data.message)
      setCurrent('')
      setPassword('')
      setConfirmation('')
    } catch (err) {
      setError(errorMessage(err, 'Could not update the password.'))
    } finally {
      setSaving(false)
    }
  }

  async function signOut() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="account-title">Account</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <section className="account-profile">
          <p><span>Name</span><strong>{user?.name}</strong></p>
          <p><span>Username</span><strong>{user?.username}</strong></p>
          <p><span>Email</span><strong>{user?.email}</strong></p>
        </section>

        <form onSubmit={submit}>
          <h3>Change password</h3>
          <label className="field">
            <span>Current password</span>
            <input type="password" value={current} onChange={(event) => setCurrent(event.target.value)} required />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} minLength={6} required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className="form-note">{message}</p> : null}
          <div className="account-actions">
            <button className="btn-light" type="button" onClick={signOut}>
              Sign out
            </button>
            <button className="btn-green" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
