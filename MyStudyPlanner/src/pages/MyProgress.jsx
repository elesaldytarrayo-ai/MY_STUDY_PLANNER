import { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import db from '../database/db'
import { toDateKey } from '../database/schema'

export default function MyProgress() {
  const [subjects, setSubjects] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    ;(async () => {
      const [s, t] = await Promise.all([db.subjects.toArray(), db.tasks.toArray()])
      setSubjects(s); setTasks(t)
    })()
  }, [])

  const completed = tasks.filter((t) => t.status === 'completed')
  const overall = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - (6 - i))
    const start = d.getTime()
    const end = start + 86400000
    const count = completed.filter((t) => t.completedAt >= start && t.completedAt < end).length
    return { key: toDateKey(d), label: d.toLocaleDateString(undefined, { weekday: 'short' }), count }
  })
  const maxDay = Math.max(1, ...last7.map((d) => d.count))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Progress</h1>
          <p>Track completion, subject strength, and weekly productivity.</p>
        </div>
      </div>

      <section className="progress-top">
        <div className="card progress-ring-card">
          <div className="progress-ring" style={{ '--pct': `${overall}%` }}>
            <div className="progress-ring-inner">
              <strong>{overall}%</strong>
              <span>completed</span>
            </div>
          </div>
          <p className="muted small">{completed.length} of {tasks.length} tasks done</p>
        </div>

        <div className="card weekly-card">
          <h3><TrendingUp size={16} /> Weekly productivity</h3>
          <div className="weekly-bars">
            {last7.map((d) => (
              <div className="weekly-bar-col" key={d.key}>
                <div className="weekly-bar-track">
                  <div className="weekly-bar-fill" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                </div>
                <span className="weekly-bar-count">{d.count}</span>
                <span className="weekly-bar-label">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <h3>Subject progress</h3>
        {subjects.length === 0 ? (
          <p className="muted small">Add subjects and tasks to see per-subject progress.</p>
        ) : (
          <div className="subject-progress-list">
            {subjects.map((s) => {
              const st = tasks.filter((t) => t.subjectId === s.id)
              const done = st.filter((t) => t.status === 'completed').length
              const pct = st.length ? Math.round((done / st.length) * 100) : 0
              return (
                <div className="subject-progress-row" key={s.id}>
                  <div className="subject-progress-head">
                    <span className="dot" style={{ background: s.color }} />
                    <strong>{s.name}</strong>
                    <span className="muted small">{done}/{st.length} tasks</span>
                    <span className="mini-pct">{pct}%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%`, background: s.color }} /></div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="progress-stats">
        <div className="card stat-mini"><CheckCircle2 size={18} /><div><strong>{completed.length}</strong><span>Completed</span></div></div>
        <div className="card stat-mini"><Clock size={18} /><div><strong>{tasks.length - completed.length}</strong><span>Pending</span></div></div>
        <div className="card stat-mini"><TrendingUp size={18} /><div><strong>{subjects.length}</strong><span>Subjects</span></div></div>
      </section>
    </>
  )
}