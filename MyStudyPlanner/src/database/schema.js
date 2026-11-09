export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const PRIORITIES = ['low', 'medium', 'high']

export const SCHEDULE_TYPES = ['class', 'exam', 'deadline', 'personal']

export const EVENT_TYPES = ['exam', 'deadline', 'class', 'study', 'personal']

export const DEFAULT_FOLDERS = ['General', 'Lecture Notes', 'Assignments', 'Reviewers']

export const SUBJECT_COLORS = [
  '#3b82f6', '#22d3ee', '#a855f7', '#f59e0b',
  '#22c55e', '#ef4444', '#ec4899', '#14b8a6'
]

export const toDateKey = (date) => {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}