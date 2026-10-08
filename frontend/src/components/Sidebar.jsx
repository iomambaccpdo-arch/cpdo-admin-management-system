import { NavLink } from 'react-router-dom'
import Logo from './Logo'

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V9h5.5" />
    </svg>
  )
}

function FilesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5 7.2A1.7 1.7 0 0 1 5.2 5.5H9l1.8 2h8a1.7 1.7 0 0 1 1.7 1.7v8.6a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V7.2Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2c1.4-3 3.7-4.4 6.5-4.4s5.1 1.4 6.5 4.4" />
    </svg>
  )
}

export default function Sidebar({ accountOpen, onAccount }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo size={120} />
        <p className="brand-name">CPDO Records</p>
      </div>
      <nav className="side-nav">
        <NavLink to="/dashboard">
          <GridIcon />
          Dashboard
        </NavLink>
        <NavLink to="/documents">
          <DocIcon />
          Documents
        </NavLink>
        <NavLink to="/files">
          <FilesIcon />
          Files
        </NavLink>
      </nav>
      <button
        type="button"
        className={accountOpen ? 'account-link active' : 'account-link'}
        onClick={onAccount}
      >
        <UserIcon />
        Account
      </button>
    </aside>
  )
}
