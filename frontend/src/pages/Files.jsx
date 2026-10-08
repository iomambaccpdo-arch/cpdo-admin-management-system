import { useEffect, useRef, useState } from 'react'
import api, { errorMessage } from '../api'
import { SearchIcon, UploadIcon } from '../components/Icons'
import { PageHead } from '../components/Shell'
import Shell from '../components/Shell'

export default function Files() {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [openingId, setOpeningId] = useState(null)
  const [preview, setPreview] = useState(null)
  const previewUrl = useRef(null)

  async function load(nextSearch = search) {
    const { data } = await api.get('/files', {
      params: {
        search: nextSearch || undefined,
      },
    })
    setFiles(data)
  }

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err, 'Could not load PDF files.')))
  }, [])

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

  function closePreview() {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current)
      previewUrl.current = null
    }
    setPreview(null)
  }

  async function upload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Only PDF files can be uploaded here.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const data = new FormData()
      data.append('file', file)
      await api.post('/files', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  async function openFile(file) {
    setError('')
    setOpeningId(file.id)
    try {
      const response = await api.get(`/files/${file.id}/download`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current)
      previewUrl.current = url
      setPreview({ id: file.id, name: file.name, url })
    } catch (err) {
      setError(errorMessage(err, 'Could not open this PDF.'))
    } finally {
      setOpeningId(null)
    }
  }

  async function removeFile(file) {
    if (!window.confirm(`Delete ${file.name}?`)) return
    setError('')
    try {
      await api.delete(`/files/${file.id}`)
      if (preview?.id === file.id) closePreview()
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Could not delete this PDF.'))
    }
  }

  return (
    <Shell>
      <PageHead title="Files" />
      <div className="toolbar">
        <button className="btn-upload" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <UploadIcon /> {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
        <input ref={inputRef} className="hidden-input" type="file" accept=".pdf,application/pdf" onChange={upload} />
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
            load().catch((err) => setError(errorMessage(err, 'Could not search PDF files.')))
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search PDF name or location"
            autoFocus
          />
          <button className="btn-green" type="submit">
            Search
          </button>
        </form>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <section className="block">
        <h2>Uploaded PDFs</h2>
        {files.length === 0 ? (
          <p className="empty-copy">
            {search ? 'No PDF files match this search.' : 'No PDF files yet. Upload a PDF to add it here.'}
          </p>
        ) : (
          <div className="file-grid files-grid">
            {files.map((file) => (
              <article key={file.id} className="file-card">
                <button type="button" className="file-open" onClick={() => openFile(file)} title={file.name} disabled={openingId === file.id}>
                  <span className="file-ext">.pdf</span>
                  <span className="file-thumb" />
                  <span className="file-name">{openingId === file.id ? 'Opening...' : file.name}</span>
                </button>
                <button type="button" className="file-delete" onClick={() => removeFile(file)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

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
            <iframe className="pdf-preview" title={preview.name} src={preview.url} />
          </div>
        </div>
      ) : null}
    </Shell>
  )
}
