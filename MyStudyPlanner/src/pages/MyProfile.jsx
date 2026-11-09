import { useEffect, useRef, useState } from 'react'
import { Camera, Save } from 'lucide-react'
import * as profileService from '../services/profileService'
import { useAuth } from '../context/AuthContext'

export default function MyProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    ;(async () => setProfile(await profileService.ensureProfile()))()
  }, [])

  const set = (key, value) => setProfile((p) => ({ ...p, [key]: value }))

  const onPickImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('picture', reader.result)
    reader.readAsDataURL(file)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    await profileService.saveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  if (!profile) return <div className="empty">Loading profile…</div>

  const initials = (profile.fullName || 'ET')
    .split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Profile</h1>
          <p>Your personal information as the owner of this workspace.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card profile-card">
        <div className="profile-avatar-block">
          <div className="profile-avatar">
            {profile.picture
              ? <img src={profile.picture} alt="Profile" />
              : <span>{initials}</span>}
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={14} /> Change photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickImage}
          />
          <span className="profile-role">OWNER / ADMIN</span>
        </div>

        <div className="profile-fields">
          <div className="form-grid">
            <div className="field">
              <label>Full name</label>
              <input
                className="input"
                value={profile.fullName || ''}
                onChange={(e) => set('fullName', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="field">
              <label>Email address</label>
              <input
                className="input"
                type="email"
                value={profile.email || ''}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label>Student ID / Info</label>
              <input
                className="input"
                value={profile.studentInfo || ''}
                onChange={(e) => set('studentInfo', e.target.value)}
                placeholder="e.g. 2024-00123"
              />
            </div>
            <div className="field">
              <label>Course</label>
              <input
                className="input"
                value={profile.course || ''}
                onChange={(e) => set('course', e.target.value)}
                placeholder="e.g. BS Computer Science"
              />
            </div>
            <div className="field">
              <label>Year level</label>
              <input
                className="input"
                value={profile.yearLevel || ''}
                onChange={(e) => set('yearLevel', e.target.value)}
                placeholder="e.g. 3rd Year"
              />
            </div>
            <div className="field">
              <label>Account email (login)</label>
              <input className="input" value={user?.email || ''} disabled />
            </div>
          </div>

          <div className="field">
            <label>Personal description</label>
            <textarea
              className="textarea"
              value={profile.description || ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="A short note about yourself, your goals, or study habits…"
            />
          </div>

          <div className="row-actions">
            <button className="btn btn-primary" type="submit">
              <Save size={16} /> Save profile
            </button>
            {saved && <span className="save-flash">Profile saved ✓</span>}
          </div>
        </div>
      </form>
    </>
  )
}