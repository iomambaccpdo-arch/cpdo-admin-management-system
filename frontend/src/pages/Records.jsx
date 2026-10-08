import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { ExportIcon, PencilIcon, PlusIcon } from '../components/Icons'
import Logo from '../components/Logo'
import RecordModal from '../components/RecordModal'
import { cellDate, cellTime, datePart, recordTitle, timePart } from '../format'

function statusClass(status) {
  const key = String(status || 'pending').toLowerCase().replace(/\s+/g, '-')
  return `status-pill status-${key}`
}

function DocId({ value }) {
  const match = String(value || '').match(/^(DOC)-(\d+)$/i)
  if (!match) return value
  return (
    <>
      DOC
      <br />- {match[2]}
    </>
  )
}

export default function RecordsPage() {
  const { date } = useParams()
  const location = useLocation()
  const from = location.state?.from
  const backTo = typeof from === 'string' && from.startsWith('/documents') ? from : '/dashboard'
  const [records, setRecords] = useState([])
  const [editing, setEditing] = useState(false)
  const [drafts, setDrafts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [active, setActive] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    const { data } = await api.get('/records', { params: { date } })
    setRecords(data)
    setDrafts(data.map((record) => ({ ...record })))
  }

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err, 'Could not load records.')))
  }, [date])

  function updateDraft(id, field, value) {
    setDrafts((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  async function saveEdits() {
    setError('')
    try {
      await Promise.all(
        drafts.map((row) => {
          const payload = {
            reference_no: row.reference_no,
            title: row.title,
            sender: row.sender,
            received_date: datePart(row.received_at),
            received_time: timePart(row.received_at) || '00:00',
            received_by: row.received_by,
            oic: row.oic || '',
            venue: row.venue || '',
            remarks: row.remarks || '',
            routed_date: datePart(row.routed_at),
            routed_time: timePart(row.routed_at),
            routed_to: row.routed_to || '',
            due_on: row.due_on ? String(row.due_on).slice(0, 10) : '',
            status: row.status,
            document_label: row.document_label || '.pdf',
          }
          return api.put(`/records/${row.id}`, payload)
        }),
      )
      setEditing(false)
      setNotice('Records saved.')
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the edits.'))
    }
  }

  async function saveModal(formData, record) {
    if (record) {
      await api.post(`/records/${record.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await api.post('/records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    await load()
  }

  async function removeRecord(record) {
    if (!window.confirm(`Delete ${record.reference_no}?`)) return
    await api.delete(`/records/${record.id}`)
    setModalOpen(false)
    setActive(null)
    await load()
  }

  async function exportRecords() {
    const response = await api.get('/records/export', {
      params: { date },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = `cpdo-records-${date}.xls`
    link.click()
    URL.revokeObjectURL(url)
  }

  const rows = editing ? drafts : records

  return (
    <div className="records-page">
      <Logo className="watermark" size={460} />
      <div className="records-top">
        <Link className="back-nav" to={backTo}>
          ‹ Back
        </Link>
        <div className="records-actions">
          <button className="btn-light" type="button" onClick={exportRecords}>
            <ExportIcon /> Export
          </button>
          {editing ? (
            <>
              <button className="btn-light" type="button" onClick={() => { setEditing(false); setDrafts(records.map((row) => ({ ...row }))) }}>
                Cancel
              </button>
              <button className="btn-green" type="button" onClick={saveEdits}>
                Save
              </button>
            </>
          ) : (
            <button className="btn-light" type="button" onClick={() => setEditing(true)}>
              <PencilIcon /> Edit
            </button>
          )}
        </div>
      </div>

      <h1 className="records-title">{recordTitle(date)}</h1>
      {notice ? <p className="form-note">{notice}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="table-scroll">
        <table className="records-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Document Title</th>
              <th>Sender (Person/Dept)</th>
              <th>Date &amp; Time Received</th>
              <th>Received By</th>
              <th>OIC</th>
              <th>Venue</th>
              <th>Remarks</th>
              <th>Date &amp; Time Routed To</th>
              <th>Routed To</th>
              <th>Document</th>
              <th>Due on</th>
              <th>Status</th>
              <th className="pencil-col" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="14" className="empty-cell">
                  No records for this date.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="id-cell"><DocId value={row.reference_no} /></td>
                  <td>{editing ? <input value={row.title} onChange={(event) => updateDraft(row.id, 'title', event.target.value)} /> : row.title}</td>
                  <td>{editing ? <input value={row.sender} onChange={(event) => updateDraft(row.id, 'sender', event.target.value)} /> : row.sender}</td>
                  <td>
                    {cellDate(row.received_at)}
                    <br />
                    {cellTime(row.received_at)}
                  </td>
                  <td>{editing ? <input value={row.received_by} onChange={(event) => updateDraft(row.id, 'received_by', event.target.value)} /> : row.received_by}</td>
                  <td>{editing ? <input value={row.oic || ''} onChange={(event) => updateDraft(row.id, 'oic', event.target.value)} /> : row.oic}</td>
                  <td>{editing ? <input value={row.venue || ''} onChange={(event) => updateDraft(row.id, 'venue', event.target.value)} /> : row.venue}</td>
                  <td>{editing ? <input value={row.remarks || ''} onChange={(event) => updateDraft(row.id, 'remarks', event.target.value)} /> : row.remarks}</td>
                  <td>
                    {row.routed_at ? (
                      <>
                        {cellDate(row.routed_at)}
                        <br />
                        {cellTime(row.routed_at)}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{editing ? <input value={row.routed_to || ''} onChange={(event) => updateDraft(row.id, 'routed_to', event.target.value)} /> : row.routed_to}</td>
                  <td className="doc-link">{row.document_label || '.pdf'}</td>
                  <td>{row.due_on ? cellDate(row.due_on) : '-'}</td>
                  <td>
                    {editing ? (
                      <select value={row.status} onChange={(event) => updateDraft(row.id, 'status', event.target.value)}>
                        <option>Pending</option>
                        <option>For Review</option>
                        <option>Approved</option>
                        <option>Returned</option>
                      </select>
                    ) : (
                      <span className={statusClass(row.status)}>{row.status}</span>
                    )}
                  </td>
                  <td className="pencil-col">
                    <button
                      type="button"
                      className="row-edit"
                      aria-label={`Edit ${row.reference_no}`}
                      onClick={() => {
                        setActive(row)
                        setModalOpen(true)
                      }}
                    >
                      <PencilIcon />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        className="fab"
        type="button"
        onClick={() => {
          setActive(null)
          setModalOpen(true)
        }}
      >
        <PlusIcon /> New
      </button>

      <RecordModal
        open={modalOpen}
        date={date}
        record={active}
        onClose={() => {
          setModalOpen(false)
          setActive(null)
        }}
        onSave={saveModal}
        onDelete={removeRecord}
      />
    </div>
  )
}
