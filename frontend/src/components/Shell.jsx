import { useState } from 'react'
import AccountModal from './AccountModal'
import Sidebar from './Sidebar'

export default function Shell({ children }) {
  const [accountOpen, setAccountOpen] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar accountOpen={accountOpen} onAccount={() => setAccountOpen(true)} />
      <main className="app-main">{children}</main>
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  )
}

export function PageHead({ title }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
    </header>
  )
}
