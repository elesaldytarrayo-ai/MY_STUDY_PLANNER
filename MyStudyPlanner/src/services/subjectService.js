import db from '../database/db'

export const listSubjects = () => db.subjects.orderBy('name').toArray()

export async function addSubject(data) {
  const id = await db.subjects.add({
    name: data.name?.trim() || 'Untitled subject',
    code: data.code || '',
    instructor: data.instructor || '',
    color: data.color || '#3b82f6',
    units: data.units || '',
    description: data.description || '',
    createdAt: Date.now()
  })
  return db.subjects.get(id)
}

export async function updateSubject(id, data) {
  await db.subjects.update(id, { ...data, updatedAt: Date.now() })
  return db.subjects.get(id)
}

export async function deleteSubject(id) {
  await db.transaction('rw', db.subjects, db.tasks, db.notes, db.schedules, async () => {
    await db.subjects.delete(id)
    await db.tasks.where('subjectId').equals(id).modify({ subjectId: null })
    await db.notes.where('subjectId').equals(id).modify({ subjectId: null })
    await db.schedules.where('subjectId').equals(id).delete()
  })
}