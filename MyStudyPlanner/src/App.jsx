import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MyProfile from './pages/MyProfile'
import MySubjects from './pages/MySubjects'
import MyTasks from './pages/MyTasks'
import MySchedule from './pages/MySchedule'
import MyNotes from './pages/MyNotes'
import MyFiles from './pages/MyFiles'
import MyCalendar from './pages/MyCalendar'
import MyProgress from './pages/MyProgress'
import Settings from './pages/Settings'

function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="app-loading">Loading workspace…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<MyProfile />} />
          <Route path="/subjects"  element={<MySubjects />} />
          <Route path="/tasks"     element={<MyTasks />} />
          <Route path="/schedule"  element={<MySchedule />} />
          <Route path="/notes"     element={<MyNotes />} />
          <Route path="/files"     element={<MyFiles />} />
          <Route path="/calendar"  element={<MyCalendar />} />
          <Route path="/progress"  element={<MyProgress />} />
          <Route path="/settings"  element={<Settings />} />
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}