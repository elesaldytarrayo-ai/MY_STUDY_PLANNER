import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Modal from '../components/Modal'
import db from '../database/db'
import * as eventService from '../services/eventService'
import { EVENT_TYPES, toDateKey } from '../database/schema'

export default function MyCalendar() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', date: '', type: 'personal', description: '' })

  const load = async () => {
    const [e, t] = await Promise.all([eventService.listEvents(), db.tasks.toArray()])
    setEvents(e); setTasks(t)
  }
  useEffect(() => { load() }, [])

  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const out = []
    for (let i = 0; i < first.getDay(); i++) out.push(null)
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d))
    while (out.length % 7 !== 0) out.push(null)
    return out
  }, [cursor])

  const itemsFor = (dateKey) => {
    const evs = events.filter((e) => e.date === dateKey).map((e) => ({ ...e, kind: 'event' }))
    const tks = tasks.filter((t) => t.deadline === dateKey).map((t) => ({ ...t, kind: 'task' }))
    return [...evs, ...tks]
  }

  const openAdd = (dateKey) => {
    setForm({ title: '', date: dateKey, type: 'personal', description: '' })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await eventService.addEvent(form)
    setOpen(false)
    load()
  }

  const removeItem = async (item) => {
    if (item.kind === 'event') {
      if (!confirm('Delete this event?')) return
      await eventService.deleteEvent(item.id)
    } else {
      if (!confirm('Delete this task?')) return
      await db.tasks.delete(item.id)
    }
    load()
  }

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Calendar</h1>
          <p>Deadlines, exams, and events in one month view.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAdd(toDateKey(new Date()))}>
          <Plus size={16} /> Add event
        </button>
      </div>

      <div className="card calendar-card">
        <div className="calendar-head">
          <div className="calendar-nav">
            <button className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <ChevronLeft size={16} />
            </button>
            <h3>{monthLabel}</h3>
            <button className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          <button className="btn btn-sm" onClick={() => {
            const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
          }}>Today</button>
        </div>

        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <span key={d}>{d}</span>)}
        </div>

        <div className="calendar-grid">
          {cells.map((date, i) => {
            if (!date) return <div className="cal-cell empty" key={`e-${i}`} />
            const key = toDateKey(date)
            const dayItems = itemsFor(key)
            const isToday = key === toDateKey(new Date())
            return (
              <div className={`cal-cell ${isToday ? 'today' : ''}`} key={key} onClick={() => openAdd(key)}>
                <span className="cal-day">{date.getDate()}</span>
                <div className="cal-chips">
                  {dayItems.slice(0, 3).map((it) => (
                    <span
                      key={`${it.kind}-${it.id}`}
                      className={`cal-chip ${it.kind === 'task' ? 'task' : it.type}`}
                      onClick={(e) => { e.stopPropagation(); removeItem(it) }}
                      title="Click to delete"
                    >
                      {it.title}
                    </span>
                  ))}
                  {dayItems.length > 3 && <span className="cal-more">+{dayItems.length - 3} more</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={open} title="Add calendar event" onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Date</label>
              <input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
            </div>
            <div className="field">
              <label>Type</label>
              <select className="select" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Add event</button>
          </div>
        </form>
      </Modal>
    </>
  )
}