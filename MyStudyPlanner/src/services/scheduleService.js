import db from '../database/db'

export const listSchedules = () => db.schedules.toArray()

export async function addSchedule(data) {
  const id = await db.schedules.add({
    title: data.title?.trim() || 'Untitled',
    subjectId: data.subjectId ?? null,
    dayOfWeek: Number(data.dayOfWeek) || 0,
    startTime: data.startTime || '08:00',
    endTime: data.endTime || '09:00',
    type: data.type || 'class',
    location: data.location || '',
    createdAt: Date.now()
  })
  return db.schedules.get(id)
}

export async function updateSchedule(id, data) {
  await db.schedules.update(id, { ...data, updatedAt: Date.now() })
}

export const deleteSchedule = (id) => db.schedules.delete(id)