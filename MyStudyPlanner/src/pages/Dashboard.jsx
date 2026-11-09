import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, ClipboardList, CheckCircle2, CalendarClock, TrendingUp, ArrowRight
} from 'lucide-react'
import db from '../database/db'
import { toDateKey } from '../database/schema'

export default function Dashboard() {
  const [state, setState] = useState({ subjects: [], tasks: [], notes: [] })

  useEffect(() => {
    ;(async () => {
      const [subjects, tasks, notes] = await Promise.all([
        db.subjects.toArray(),
        db.tasks.toArray(),
        db.notes.orderBy('createdAt').reverse().limit(4).toArray()
      ])
      setState({ subjects, tasks, notes })
    })()
  }, [])

  const { subjects, tasks, notes } = state
  const pending = tasks.filter((t) => t.status !== 'completed')
  const completed = tasks.filter((t) => t.status === 'completed')
  const todayKey = toDateKey(new Date())

  const upcoming = pending
    .filter((t) => t.deadline && t.deadline >= todayKey)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5)

  const progress = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Good day, Elesaldy 👋</h1>
          <p>Here is a snapshot of your study workspace today.</p>
        </div>
      </div>

      <section className="stat-grid">
        <StatCard icon={<BookOpen size={18} />} label="Total subjects" value={subjects.length} tone="blue" />
        <StatCard icon={<ClipboardList size={18} />} label="Pending tasks" value={pending.length} tone="amber" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Completed tasks" value={completed.length} tone="green" />
        <StatCard icon={<CalendarClock size={18} />} label="Upcoming deadlines" value={upcoming.length} tone="cyan" />
      </section>

      <section className="dash-grid">
        <div className="card">
          <div className="card-head">
            <h3>Study progress</h3>
            <span className="badge badge-info">{progress}%</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
          <p className="muted small">{completed.length} of {tasks.length} tasks completed</p>

          <div className="mini-subject-list">
            {subjects.slice(0, 4).map((s) => {
              const st = tasks.filter((t) => t.subjectId === s.id)
              const done = st.filter((t) => t.status === 'completed').length
              const pct = st.length ? Math.round((done / st.length) * 100) : 0
              return (
                <div className="mini-subject" key={s.id}>
                  <span className="dot" style={{ background: s.color || '#3b82f6' }} />
                  <span className="mini-subject-name">{s.name}</span>
                  <div className="progress-track slim"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                  <span className="mini-pct">{pct}%</span>
                </div>
              )
            })}
            {subjects.length === 0 && <p className="muted small">No subjects yet. Add one in My Subjects.</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Upcoming deadlines</h3>
            <Link to="/tasks" className="link">View all <ArrowRight size={13} /></Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="muted small">Nothing due soon. You're clear! 🎉</p>
          ) : (
            <ul className="deadline-list">
              {upcoming.map((t) => (
                <li key={t.id}>
                  <div>
                    <strong>{t.title}</strong>
                    <span>{t.deadline}</span>
                  </div>
                  <span className={`badge badge-${t.priority || 'medium'}`}>{t.priority || 'medium'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3><TrendingUp size={16} /> Recent notes</h3>
          <Link to="/notes" className="link">Open notes <ArrowRight size={13} /></Link>
        </div>
        {notes.length === 0 ? (
          <p className="muted small">No notes yet. Capture your first idea in My Notes.</p>
        ) : (
          <ul className="recent-list">
            {notes.map((n) => (
              <li key={n.id}>
                <strong>{n.title || 'Untitled note'}</strong>
                <span className="muted small">{(n.content || '').slice(0, 90) || 'No content'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

function StatCard({ icon, label, value, tone }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}