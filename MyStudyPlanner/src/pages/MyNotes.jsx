import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Pin, StickyNote } from 'lucide-react'
import Modal from '../components/Modal'
import * as noteService from '../services/noteService'
import * as subjectService from '../services/subjectService'

const empty = { title: '', content: '', subjectId: '', pinned: false }

export default function MyNotes() {
  const [notes, setNotes] = useState([])
  const [subjects, setSubjects] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')

  const load = async () => {
    const [n, s] = await Promise.all([noteService.listNotes(), subjectService.listSubjects()])
    setNotes(n); setSubjects(s)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name

  const visible = useMemo(() => {
    return notes
      .filter((n) => (filterSubject === 'all' ? true : String(n.subjectId) === filterSubject))
      .filter((n) => {
        if (!search) return true
        const q = search.toLowerCase()
        return n.title.toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q)
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
  }, [notes, search, filterSubject])

  const submit = async (e) => {
    e.preventDefault()
    const payload = { ...form, subjectId: form.subjectId === '' ? null : Number(form.subjectId) }
    if (editing) await noteService.updateNote(editing.id, payload)
    else await noteService.addNote(payload)
    setOpen(false)
    load()
  }

  const remove = async (n) => {
    if (!confirm(`Delete note "${n.title}"?`)) return
    await noteService.deleteNote(n.id)
    load()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Notes</h1>
          <p>Capture ideas, summaries, and study reminders.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(empty); setOpen(true) }}>
          <Plus size={16} /> New note
        </button>
      </div>

      <div className="card toolbar">
        <input className="input" placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="card empty"><StickyNote size={28} /><p>No notes yet.</p></div>
      ) : (
        <div className="note-grid">
          {visible.map((n) => (
            <div className={`note-card ${n.pinned ? 'pinned' : ''}`} key={n.id}>
              <div className="note-head">
                <strong>{n.title}</strong>
                <div className="note-actions">
                  <button className={`icon-btn ${n.pinned ? 'active' : ''}`}
                    onClick={() => noteService.togglePin(n.id).then(load)}>
                    <Pin size={13} />
                  </button>
                  <button className="icon-btn" onClick={() => {
                    setEditing(n)
                    setForm({ title: n.title, content: n.content, subjectId: n.subjectId ?? '', pinned: n.pinned })
                    setOpen(true)
                  }}><Pencil size={13} /></button>
                  <button className="icon-btn danger" onClick={() => remove(n)}><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="note-content">{n.content || 'No content'}</p>
              {subjectName(n.subjectId) && <span className="badge badge-muted">{subjectName(n.subjectId)}</span>}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title={editing ? 'Edit note' : 'New note'} onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Title</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="field">
            <label>Subject</label>
            <select className="select" value={form.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
              <option value="">Unassigned</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Content</label>
            <textarea className="textarea note-textarea" value={form.content} onChange={(e) => set('content', e.target.value)} />
          </div>
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">{editing ? 'Save note' : 'Create note'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}