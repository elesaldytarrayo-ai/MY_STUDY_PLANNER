import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import Modal from '../components/Modal'
import * as subjectService from '../services/subjectService'
import { SUBJECT_COLORS } from '../database/schema'

const empty = { name: '', code: '', instructor: '', units: '', color: SUBJECT_COLORS[0], description: '' }

export default function MySubjects() {
  const [subjects, setSubjects] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  const load = async () => setSubjects(await subjectService.listSubjects())
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (s) => { setEditing(s); setForm({ ...empty, ...s }); setOpen(true) }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editing) await subjectService.updateSubject(editing.id, form)
    else await subjectService.addSubject(form)
    setOpen(false)
    load()
  }

  const remove = async (s) => {
    if (!confirm(`Delete "${s.name}"? Related tasks and notes will be unassigned.`)) return
    await subjectService.deleteSubject(s.id)
    load()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Subjects</h1>
          <p>Organize the courses you are studying this term.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Add subject</button>
      </div>

      {subjects.length === 0 ? (
        <div className="card empty">
          <BookOpen size={28} />
          <p>No subjects yet. Create your first subject to get started.</p>
        </div>
      ) : (
        <div className="subject-grid">
          {subjects.map((s) => (
            <div className="subject-card" key={s.id} style={{ '--accent-color': s.color }}>
              <div className="subject-card-top">
                <div className="subject-icon" style={{ background: `${s.color}22`, color: s.color }}>
                  <BookOpen size={18} />
                </div>
                <div className="subject-actions">
                  <button className="icon-btn" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                  <button className="icon-btn danger" onClick={() => remove(s)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3>{s.name}</h3>
              <p className="muted small">{s.code || 'No code'} {s.instructor ? `· ${s.instructor}` : ''}</p>
              {s.description && <p className="subject-desc">{s.description}</p>}
              {s.units && <span className="badge badge-muted">{s.units} units</span>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title={editing ? 'Edit subject' : 'New subject'} onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>Subject name *</label>
              <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="field">
              <label>Subject code</label>
              <input className="input" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="CS101" />
            </div>
            <div className="field">
              <label>Instructor</label>
              <input className="input" value={form.instructor} onChange={(e) => set('instructor', e.target.value)} />
            </div>
            <div className="field">
              <label>Units</label>
              <input className="input" value={form.units} onChange={(e) => set('units', e.target.value)} placeholder="3" />
            </div>
          </div>
          <div className="field">
            <label>Color</label>
            <div className="color-row">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">{editing ? 'Save changes' : 'Create subject'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}