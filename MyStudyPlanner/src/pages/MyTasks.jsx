import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Circle, ClipboardList } from 'lucide-react'
import Modal from '../components/Modal'
import * as taskService from '../services/taskService'
import * as subjectService from '../services/subjectService'
import { PRIORITIES, toDateKey } from '../database/schema'

const empty = { title: '', description: '', subjectId: '', priority: 'medium', deadline: '' }

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)

  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [search, setSearch] = useState('')

  const load = async () => {
    const [t, s] = await Promise.all([taskService.listTasks(), subjectService.listSubjects()])
    setTasks(t); setSubjects(s)
  }
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || 'Unassigned'

  const visible = useMemo(() => {
    return tasks
      .filter((t) => (filterStatus === 'all' ? true : t.status === filterStatus))
      .filter((t) => (filterSubject === 'all' ? true : String(t.subjectId) === filterSubject))
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return a.deadline.localeCompare(b.deadline)
      })
  }, [tasks, filterStatus, filterSubject, search])

  const openCreate = () => { setEditing(null); setForm(empty); setOpen(true) }
  const openEdit = (t) => {
    setEditing(t)
    setForm({
      title: t.title, description: t.description, priority: t.priority,
      deadline: t.deadline, subjectId: t.subjectId ?? ''
    })
    setOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, subjectId: form.subjectId === '' ? null : Number(form.subjectId) }
    if (editing) await taskService.updateTask(editing.id, payload)
    else await taskService.addTask(payload)
    setOpen(false)
    load()
  }

  const remove = async (t) => {
    if (!confirm(`Delete task "${t.title}"?`)) return
    await taskService.deleteTask(t.id)
    load()
  }

  const today = toDateKey(new Date())

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Tasks</h1>
          <p>Assignments, activities, and everything you need to finish.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New task</button>
      </div>

      <div className="card toolbar">
        <input className="input" placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select className="select" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
          <option value="all">All subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div className="card empty">
          <ClipboardList size={28} />
          <p>No tasks match your filters.</p>
        </div>
      ) : (
        <div className="task-list">
          {visible.map((t) => (
            <div className={`task-item ${t.status === 'completed' ? 'done' : ''}`} key={t.id}>
              <button className="task-check" onClick={() => taskService.toggleTask(t.id).then(load)}>
                {t.status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              <div className="task-body">
                <div className="task-title-row">
                  <strong>{t.title}</strong>
                  <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                </div>
                <div className="task-meta">
                  <span className="badge badge-muted">{subjectName(t.subjectId)}</span>
                  {t.deadline && (
                    <span className={`badge ${t.deadline < today && t.status !== 'completed' ? 'badge-high' : 'badge-info'}`}>
                      Due {t.deadline}
                    </span>
                  )}
                  {t.description && <span className="muted small">{t.description.slice(0, 80)}</span>}
                </div>
              </div>
              <div className="task-actions">
                <button className="icon-btn" onClick={() => openEdit(t)}><Pencil size={14} /></button>
                <button className="icon-btn danger" onClick={() => remove(t)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} title={editing ? 'Edit task' : 'New task'} onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="field">
            <label>Task title *</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Subject</label>
              <select className="select" value={form.subjectId} onChange={(e) => set('subjectId', e.target.value)}>
                <option value="">Unassigned</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Deadline</label>
              <input className="input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Notes / description</label>
            <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="row-actions end">
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" type="submit">{editing ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </Modal>
    </>
  )
}