import { useRef, useState } from 'react'
import { KeyRound, Download, Upload, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import * as authService from '../services/authService'
import * as backupService from '../services/backupService'

export default function Settings() {
  const { user, logout } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const importRef = useRef(null)

  const changePassword = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (next !== confirmPw) return setMsg({ type: 'error', text: 'New passwords do not match.' })
    try {
      await authService.changePassword(user.id, current, next)
      setCurrent(''); setNext(''); setConfirmPw('')
      setMsg({ type: 'success', text: 'Password updated successfully.' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    }
  }

  const doExport = async () => {
    const data = await backupService.exportBackup()
    backupService.downloadBackup(data)
  }

  const doImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      if (!confirm('Restoring will overwrite all current data. Continue?')) return
      await backupService.importBackup(json)
      setMsg({ type: 'success', text: 'Backup restored. Reloading…' })
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setMsg({ type: 'error', text: err.message })
    } finally {
      e.target.value = ''
    }
  }

  const wipe = async () => {
    if (!confirm('This will permanently delete ALL data in this browser. Continue?')) return
    if (!confirm('Final warning: this cannot be undone. Delete everything?')) return
    await backupService.clearAllData()
    localStorage.removeItem('msp_session')
    logout()
    window.location.reload()
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Security, backups, and workspace management.</p>
        </div>
      </div>

      {msg.text && <div className={`alert ${msg.type}`}>{msg.text}</div>}

      <section className="card">
        <h3><KeyRound size={16} /> Change password</h3>
        <p className="muted small">Signed in as <strong>{user?.email}</strong></p>
        <form onSubmit={changePassword} className="settings-form">
          <div className="form-grid">
            <div className="field">
              <label>Current password</label>
              <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </div>
            <div className="field">
              <label>New password</label>
              <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
            </div>
            <div className="field">
              <label>Confirm new password</label>
              <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">Update password</button>
        </form>
      </section>

      <section className="card">
        <h3><ShieldCheck size={16} /> Backup & restore</h3>
        <p className="muted small">
          Your data lives only in this browser. Export a backup regularly so you can move it to another device.
        </p>
        <div className="row-actions">
          <button className="btn" onClick={doExport}><Download size={15} /> Export backup</button>
          <button className="btn" onClick={() => importRef.current?.click()}><Upload size={15} /> Restore backup</button>
          <input ref={importRef} type="file" accept="application/json" hidden onChange={doImport} />
        </div>
      </section>

      <section className="card danger-zone">
        <h3><AlertTriangle size={16} /> Danger zone</h3>
        <p className="muted small">
          Clearing all data wipes every record from IndexedDB and signs you out. Export a backup first.
        </p>
        <button className="btn btn-danger" onClick={wipe}>Erase all data</button>
      </section>
    </>
  )
}