import db from '../database/db'

const SESSION_KEY = 'msp_session'

export const OWNER_EMAIL = 'elesaldy.owner@mystudyplanner.local'
export const OWNER_NAME = 'Elesaldy Tarrayo'
const OWNER_DEFAULT_PASSWORD = 'Study@ET2026!Planner'

async function sha256(text) {
  const buf = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function randomSalt() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const sanitize = (user) => {
  if (!user) return null
  const { passwordHash, salt, ...safe } = user
  return safe
}

export async function initializeOwner() {
  const count = await db.users.count()
  if (count > 0) return

  const salt = randomSalt()
  const passwordHash = await sha256(`${salt}:${OWNER_DEFAULT_PASSWORD}`)

  await db.users.add({
    email: OWNER_EMAIL,
    name: OWNER_NAME,
    role: 'owner',
    salt,
    passwordHash,
    createdAt: Date.now()
  })

  await db.profile.add({
    fullName: OWNER_NAME,
    email: OWNER_EMAIL,
    studentInfo: '',
    course: '',
    yearLevel: '',
    description: '',
    picture: '',
    updatedAt: Date.now()
  })

  const existingFolders = await db.folders.count()
  if (existingFolders === 0) {
    await db.folders.bulkAdd([
      { name: 'General', createdAt: Date.now() },
      { name: 'Lecture Notes', createdAt: Date.now() },
      { name: 'Assignments', createdAt: Date.now() },
      { name: 'Reviewers', createdAt: Date.now() }
    ])
  }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function login(email, password) {
  const normalized = String(email || '').trim().toLowerCase()
  const user = await db.users.where('email').equals(normalized).first()
  if (!user) throw new Error('No owner account found with that email.')

  const hash = await sha256(`${user.salt}:${password}`)
  if (hash !== user.passwordHash) throw new Error('Incorrect password.')

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ userId: user.id, email: user.email, loginAt: Date.now() })
  )
  return sanitize(user)
}

export async function getUserById(id) {
  const user = await db.users.get(id)
  return sanitize(user)
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters.')
  }
  const user = await db.users.get(userId)
  if (!user) throw new Error('Owner account not found.')

  const currentHash = await sha256(`${user.salt}:${currentPassword}`)
  if (currentHash !== user.passwordHash) throw new Error('Current password is incorrect.')

  const salt = randomSalt()
  const passwordHash = await sha256(`${salt}:${newPassword}`)
  await db.users.update(userId, { salt, passwordHash, updatedAt: Date.now() })
}

export async function resetOwnerToDefault() {
  const user = await db.users.toCollection().first()
  if (!user) return
  const salt = randomSalt()
  const passwordHash = await sha256(`${salt}:${OWNER_DEFAULT_PASSWORD}`)
  await db.users.update(user.id, { salt, passwordHash, updatedAt: Date.now() })
}