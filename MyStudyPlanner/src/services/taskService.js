import db from '../database/db'

export const listTasks = () => db.tasks.orderBy('createdAt').reverse().toArray()

export async function addTask(data) {
  const id = await db.tasks.add({
    title: data.title?.trim() || 'Untitled task',
    description: data.description || '',
    subjectId: data.subjectId ?? null,
    priority: data.priority || 'medium',
    deadline: data.deadline || '',
    status: 'pending',
    createdAt: Date.now(),
    completedAt: null
  })
  return db.tasks.get(id)
}

export async function updateTask(id, data) {
  await db.tasks.update(id, { ...data, updatedAt: Date.now() })
  return db.tasks.get(id)
}

export async function toggleTask(id) {
  const task = await db.tasks.get(id)
  if (!task) return
  const completed = task.status === 'completed'
  await db.tasks.update(id, {
    status: completed ? 'pending' : 'completed',
    completedAt: completed ? null : Date.now()
  })
}

export const deleteTask = (id) => db.tasks.delete(id)