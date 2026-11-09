import db from '../database/db'

export const listEvents = () => db.events.toArray()

export async function addEvent(data) {
  const id = await db.events.add({
    title: data.title?.trim() || 'Untitled event',
    date: data.date,
    type: data.type || 'personal',
    description: data.description || '',
    createdAt: Date.now()
  })
  return db.events.get(id)
}

export const deleteEvent = (id) => db.events.delete(id)