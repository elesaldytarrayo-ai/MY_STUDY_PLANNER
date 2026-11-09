import { useEffect, useState } from 'react'
import { Plus, Trash2, Clock, MapPin } from 'lucide-react'
import Modal from '../components/Modal'
import * as scheduleService from '../services/scheduleService'
import * as subjectService from '../services/subjectService'
import { DAYS, SCHEDULE_TYPES } from '../database/schema'

const empty = {
  title: '', subjectId: '', dayOfWeek: 1, startTime: '08:00',
  endTime: '09:00', type: 'class', location: ''
}

export default function MySchedule() {
  const [items, setItems] = useState([])
  const [subjects, setSubjects] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const load = async () => {
    const [s, sub] = await Promise.all([scheduleService.listSchedules(), subjectService.listSubjects()])
    setItems(s); setSubjects(sub)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await scheduleService.addSchedule({
      ...form,
      subjectId: form.subjectId === '' ? null : Number(form.subjectId),
      dayOfWeek: Number(form.dayOfWeek)
    })
    setOpen(false)
    setForm(empty)
    load()
  }

  const remove = async (id) => {
    if (!confirm('Remove this schedule entry?')) return
    await scheduleService.deleteSchedule(id)
    load()
  }

  const subjectName = (id) => subjects.find((s) => s.id === id)?.name

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Schedule</h1>
          <p>Weekly classes, exams, deadlines, and personal study blocks.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(empty); setOpen(true) }}>
          <Plus size={16} /> Add entry
        </button>
      </div>

      <div className="week-grid">
        {DAYS.map((day, idx) => {
          const dayItems = items
            .filter((i) => i.dayOfWeek === idx)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
          return (
            <div className="week-col" key={day}>
              <div className="week-col-head">{day}</div>
              {dayItems.length === 0 ? (
                <p className="week-empty">Free</p>
              ) : (
                dayItems.map((i) => (
                  <div className={`schedule-chip type-${i.type}`} key={i.id}>
                    <div className="schedule-chip-top">
                      <strong>{i.title}</strong>
                      <button className="chip-x" onClick={() => remove(i.id)}><Trash2 size={11} /></button>
                    </div>
                    <span className="schedule-time"><Clock size={11} /> {i.startTime}–{i.endTime}</span>
                    {subjectName(i.subjectId) && <span className="schedule-subject">{subjectName(i.subjectId)}</span>}
                    {i.location && <span className="schedule-loc"><MapPin size={11} /> {i.location}</span>}
                  </div>
                ))
              )}
            </div>
          )
        })}
      </div>

      <Modal open={open} title="New schedule entry" onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title *</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Subject</label>
              <select className="select" value={form.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
                <option value="">None</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {SCHEDULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Day</label>
              <select className="select" value={form.dayOfWeek} onChange={(e) => set('dayOfWeek', e.target.value)}>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="field">
              <label>Start time</label>
              <input className="input" type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} />
            </div>
            <div className="field">
              <label>End time</label>
              <input className="input" type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} />
            </div>
          </div>
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">Add entry</button>
          </div>
        </form>
      </Modal>
    </>
  )
}