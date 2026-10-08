export function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16.5 20 20.5" />
    </svg>
  )
}

export function EyeIcon({ off = false }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.4" />
      {off ? <path d="M5 19 19 5" /> : null}
    </svg>
  )
}

export function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V6" />
      <path d="m8 9 4-4 4 4" />
      <path d="M5 18.5h14" />
    </svg>
  )
}

export function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  )
}

export function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4.2L19 9.2 14.8 5 4 15.8V20Z" />
      <path d="m13.2 6.6 4.2 4.2" />
    </svg>
  )
}

export function FileGlyph({ extension }) {
  const spreadsheet = ['xls', 'xlsx', 'csv'].includes(extension)
  return (
    <svg viewBox="0 0 24 24" className={spreadsheet ? 'file-glyph sheet' : 'file-glyph'} aria-hidden="true">
      <path d="M7 2.8h6.2L19 8.4V20a1.4 1.4 0 0 1-1.4 1.4H7A1.4 1.4 0 0 1 5.6 20V4.2A1.4 1.4 0 0 1 7 2.8Z" />
      <path d="M13 2.8V8.6h6" />
      {spreadsheet ? <path d="M8.2 12.2h7.6M8.2 15.2h7.6M8.2 18h4.6" /> : <path d="M8.2 12h7.6M8.2 15.4h7.6" />}
    </svg>
  )
}
