import { useEffect, useState } from 'react'
import { datePart, timePart, todayInput } from '../format'

const EMPTY = {
  title: '',
  sender: '',
  received_date: '',
  received_time: '08:00',
  received_by: '',
  oic: '',
  venue: '',
  remarks: '',
  routed_date: '',
  routed_time: '',
  routed_to: '',
  due_on: '',
  status: 'Pending',
  file: null,
}

export default function RecordModal({ open, date, record, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (record) {
      setForm({
        title: record.title || '',
        sender: record.sender || '',
        received_date: datePart(record.received_at),
        received_time: timePart(record.received_at) || '08:00',
        received_by: record.received_by || '',
        oic: record.oic || '',
        venue: record.venue || '',
        remarks: record.remarks || '',
        routed_date: datePart(record.routed_at),
        routed_time: timePart(record.routed_at),
        routed_to: record.routed_to || '',
        due_on: record.due_on ? String(record.due_on).slice(0, 10) : '',
        status: record.status || 'Pending',
        file: null,
      })
    } else {
      setForm({
        ...EMPTY,
        received_date: date || todayInput(),
        routed_date: date || todayInput(),
      })
    }
    setError('')
  }, [open, record, date])

  if (!open) return null

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'file') {
          if (value) data.append('file', value)
          return
        }
        data.append(key, value ?? '')
      })
      await onSave(data, record)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save the record.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-head">
          <h2>{record ? `Edit ${record.reference_no}` : 'New record'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="form-grid">
          <label>
            Document title
            <input value={form.title} onChange={(event) => setField('title', event.target.value)} required />
          </label>
          <label>
            Sender (person / department)
            <input value={form.sender} onChange={(event) => setField('sender', event.target.value)} required />
          </label>
          <label>
            Date received
            <input type="date" value={form.received_date} onChange={(event) => setField('received_date', event.target.value)} required />
          </label>
          <label>
            Time received
            <input type="time" value={form.received_time} onChange={(event) => setField('received_time', event.target.value)} required />
          </label>
          <label>
            Received by
            <input value={form.received_by} onChange={(event) => setField('received_by', event.target.value)} required />
          </label>
          <label>
            OIC
            <input value={form.oic} onChange={(event) => setField('oic', event.target.value)} />
          </label>
          <label>
            Venue
            <input value={form.venue} onChange={(event) => setField('venue', event.target.value)} />
          </label>
          <label>
            Remarks
            <input value={form.remarks} onChange={(event) => setField('remarks', event.target.value)} />
          </label>
          <label>
            Date routed
            <input type="date" value={form.routed_date} onChange={(event) => setField('routed_date', event.target.value)} />
          </label>
          <label>
            Time routed
            <input type="time" value={form.routed_time} onChange={(event) => setField('routed_time', event.target.value)} />
          </label>
          <label>
            Routed to
            <input value={form.routed_to} onChange={(event) => setField('routed_to', event.target.value)} />
          </label>
          <label>
            Due on
            <input type="date" value={form.due_on} onChange={(event) => setField('due_on', event.target.value)} />
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField('status', event.target.value)}>
              <option>Pending</option>
              <option>For Review</option>
              <option>Approved</option>
              <option>Returned</option>
            </select>
          </label>
          <label>
            Document file
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(event) => setField('file', event.target.files?.[0] || null)} />
          </label>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <div className="modal-actions">
          {record && onDelete ? (
            <button type="button" className="btn-danger" onClick={() => onDelete(record)}>
              Delete
            </button>
          ) : <span />}
          <div className="modal-actions-right">
            <button type="button" className="btn-light" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-green" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
