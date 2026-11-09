import db from '../database/db'

export const listNotes = () => db.notes.orderBy('createdAt').reverse().toArray()

export async function addNote(data) {
  const id = await db.notes.add({
    title: data.title?.trim() || 'Untitled note',
    content: data.content || '',
    subjectId: data.subjectId ?? null,
    pinned: !!data.pinned,
    createdAt: Date.now()
  })
  return db.notes.get(id)
}

export async function updateNote(id, data) {
  await db.notes.update(id, { ...data, updatedAt: Date.now() })
}

export async function togglePin(id) {
  const note = await db.notes.get(id)
  if (!note) return
  await db.notes.update(id, { pinned: !note.pinned })
}

export const deleteNote = (id) => db.notes.delete(id)