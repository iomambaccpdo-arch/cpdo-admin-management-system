import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { FileGlyph, PlusIcon, SearchIcon } from '../components/Icons'
import RecordModal from '../components/RecordModal'
import { PageHead } from '../components/Shell'
import Shell from '../components/Shell'
import { modifiedLabel, recordDateLabel } from '../format'

export default function Dashboard() {
  const navigate = useNavigate()
  const [dates, setDates] = useState([])
  const [recent, setRecent] = useState([])
  const [recentMeta, setRecentMeta] = useState({ current_page: 1, last_page: 1, per_page: 5, total: 0 })
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [openingId, setOpeningId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const previewUrl = useRef(null)

  async function load(nextSearch = search, nextRecentPage = 1) {
    const { data } = await api.get('/dashboard', {
      params: {
        search: nextSearch || undefined,
        recent_page: nextRecentPage,
      },
    })
    setDates(data.dates || [])
    setRecent(data.recent || [])
    setRecentMeta(data.recent_meta || {
      current_page: nextRecentPage,
      last_page: 1,
      per_page: 5,
      total: (data.recent || []).length,
    })
  }

  function closePreview() {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current)
      previewUrl.current = null
    }
    setPreview(null)
  }

  useEffect(() => {
    return () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
    }
  }, [])

  useEffect(() => {
    if (!preview) return undefined
    function onKey(event) {
      if (event.key === 'Escape') closePreview()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  async function openRecent(file) {
    const extension = String(file.extension || '').toLowerCase()
    const kind = extension === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension) ? 'image' : 'file'
    setError('')
    setOpeningId(file.id)
    try {
      const response = await api.get(`/documents/${file.id}/download`, { responseType: 'blob' })
      const type = kind === 'pdf'
        ? 'application/pdf'
        : kind === 'image'
          ? `image/${extension === 'jpg' ? 'jpeg' : extension}`
          : (response.data?.type || 'application/octet-stream')
      const url = URL.createObjectURL(new Blob([response.data], { type }))
      if (kind === 'file') {
        window.open(url, '_blank', 'noopener')
        window.setTimeout(() => URL.revokeObjectURL(url), 60000)
        return
      }
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
      previewUrl.current = url
      setPreview({
        id: file.id,
        name: file.name,
        extension,
        url,
        kind,
      })
    } catch (err) {
      setError(errorMessage(err, 'Could not open this document.'))
    } finally {
      setOpeningId(null)
    }
  }

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))
  }, [])

  async function saveRecord(formData) {
    await api.post('/records', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await load()
  }

  return (
    <Shell>
      <PageHead title="Dashboard" />
      <div className="toolbar">
        <button className="btn-green" type="button" onClick={() => setModalOpen(true)}>
          <PlusIcon /> New
        </button>
        <div className="toolbar-right">
          <button
            className="btn-search"
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
          >
            Search <SearchIcon />
          </button>
        </div>
      </div>

      {searchOpen ? (
        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault()
            load(search, 1).catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search records or files"
            autoFocus
          />
          <button className="btn-green" type="submit">
            Search
          </button>
        </form>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <section className="block">
        <h2>Records</h2>
        {dates.length === 0 ? (
          <p className="empty-copy">No records yet. Use New to add the first document log.</p>
        ) : (
          <>
            <div className="date-grid">
              {dates.map((item) => (
                <button
                  key={item.date}
                  type="button"
                  className="date-card"
                  onClick={() => navigate(`/records/${item.date}`)}
                >
                  <span>
                    {recordDateLabel(item.date)}
                    <small className="date-count">
                      {item.total === 1 ? '1 record' : `${item.total} records`}
                    </small>
                  </span>
                  <span className="date-thumb" />
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="block">
        <h2>Recent</h2>
        <div className="recent">
          <div className="recent-head">
            <span>Name</span>
            <span>Date uploaded</span>
          </div>
          {recent.length === 0 ? (
            <p className="empty-copy inset">
              {search ? 'No uploaded documents match this search.' : 'No documents uploaded yet.'}
            </p>
          ) : (
            recent.map((file) => (
              <button
                key={file.id}
                type="button"
                className="recent-row"
                onClick={() => openRecent(file)}
                disabled={openingId === file.id}
              >
                <span className="recent-name">
                  <FileGlyph extension={file.extension} />
                  <span>
                    <strong>{openingId === file.id ? 'Opening...' : file.name}</strong>
                    <small>{file.location}</small>
                  </span>
                </span>
                <span className="recent-date">{modifiedLabel(file.created_at || file.updated_at)}</span>
              </button>
            ))
          )}
          {recentMeta.last_page > 1 ? (
            <nav className="pager" aria-label="Recent documents">
              <button
                className="btn-light"
                type="button"
                disabled={recentMeta.current_page <= 1}
                onClick={() => load(search, recentMeta.current_page - 1).catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))}
              >
                Previous
              </button>
              <span className="pager-label">
                {`${(recentMeta.current_page - 1) * recentMeta.per_page + 1}–${Math.min(
                  recentMeta.current_page * recentMeta.per_page,
                  recentMeta.total,
                )} of ${recentMeta.total}`}
              </span>
              <button
                className="btn-light"
                type="button"
                disabled={recentMeta.current_page >= recentMeta.last_page}
                onClick={() => load(search, recentMeta.current_page + 1).catch((err) => setError(errorMessage(err, 'Could not load the dashboard.')))}
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      </section>

      <RecordModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={saveRecord} />
      {preview ? (
        <div className="modal-backdrop" onMouseDown={closePreview}>
          <div
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label={preview.name}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <h2>{preview.name}</h2>
              <button type="button" className="icon-btn" onClick={closePreview} aria-label="Close preview">
                ×
              </button>
            </div>
            {preview.kind === 'pdf' ? (
              <iframe className="pdf-preview" title={preview.name} src={preview.url} />
            ) : null}
            {preview.kind === 'image' ? (
              <img className="preview-image" alt={preview.name} src={preview.url} />
            ) : null}
          </div>
        </div>
      ) : null}
    </Shell>
  )
}
