import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, UserRound, BookOpen, ClipboardList, CalendarDays,
  StickyNote, FolderOpen, Calendar, TrendingUp, Settings, GraduationCap, LogOut
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/profile',   label: 'My Profile',  icon: UserRound },
  { to: '/subjects',  label: 'My Subjects', icon: BookOpen },
  { to: '/tasks',     label: 'My Tasks',    icon: ClipboardList },
  { to: '/schedule',  label: 'My Schedule', icon: CalendarDays },
  { to: '/notes',     label: 'My Notes',    icon: StickyNote },
  { to: '/files',     label: 'My Files',    icon: FolderOpen },
  { to: '/calendar',  label: 'My Calendar', icon: Calendar },
  { to: '/progress',  label: 'My Progress', icon: TrendingUp },
  { to: '/settings',  label: 'Settings',    icon: Settings }
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const initials = (user?.name || 'ET')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo"><GraduationCap size={20} /></div>
        <div>
          <strong>MyStudyPlanner</strong>
          <span>Personal workspace</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <strong>{user?.name || 'Owner'}</strong>
            <span>OWNER / ADMIN</span>
          </div>
        </div>
        <button className="btn btn-sm btn-block" onClick={logout}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}