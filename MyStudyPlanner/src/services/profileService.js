import db from '../database/db'

export async function getProfile() {
  return (await db.profile.toCollection().first()) || null
}

export async function ensureProfile() {
  const existing = await getProfile()
  if (existing) return existing
  const id = await db.profile.add({
    fullName: 'Elesaldy Tarrayo',
    email: '',
    studentInfo: '',
    course: '',
    yearLevel: '',
    description: '',
    picture: '',
    updatedAt: Date.now()
  })
  return db.profile.get(id)
}

export async function saveProfile(data) {
  const existing = await getProfile()
  const payload = { ...data, updatedAt: Date.now() }
  delete payload.id
  if (existing) {
    await db.profile.update(existing.id, payload)
    return db.profile.get(existing.id)
  }
  const id = await db.profile.add(payload)
  return db.profile.get(id)
}