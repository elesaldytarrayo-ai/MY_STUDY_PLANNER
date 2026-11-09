import { useLocation } from 'react-router-dom'
import { Menu, CalendarDays } from 'lucide-react'
import { NAV_ITEMS } from './Sidebar'

const today = new Date().toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
})

export default function Header({ onMenu }) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((n) => pathname.startsWith(n.to))

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <div className="topbar-title">
        <h2>{current?.label || 'Dashboard'}</h2>
        <span><CalendarDays size={13} /> {today}</span>
      </div>
    </header>
  )
}