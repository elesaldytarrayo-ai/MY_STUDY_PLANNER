import db from '../database/db'

const TABLES = [
  'users', 'profile', 'subjects', 'tasks', 'schedules',
  'notes', 'files', 'folders', 'events', 'settings'
]

const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(blob)
})

const dataUrlToBlob = async (dataUrl) => (await fetch(dataUrl)).blob()

export async function exportBackup() {
  const payload = {
    app: 'MyStudyPlanner',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {}
  }
  for (const table of TABLES) {
    payload.data[table] = await db.table(table).toArray()
  }
  payload.data.files = await Promise.all(
    (payload.data.files || []).map(async (f) => ({
      ...f,
      data: f.data ? await blobToDataUrl(f.data) : null
    }))
  )
  return payload
}

export function downloadBackup(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mystudyplanner-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function importBackup(payload) {
  if (!payload || payload.app !== 'MyStudyPlanner') {
    throw new Error('This is not a valid MyStudyPlanner backup file.')
  }
  const files = await Promise.all(
    (payload.data.files || []).map(async (f) => ({
      ...f,
      data: f.data ? await dataUrlToBlob(f.data) : null
    }))
  )

  await db.transaction('rw', db.tables, async () => {
    for (const table of TABLES) {
      await db.table(table).clear()
      if (table === 'files') {
        if (files.length) await db.files.bulkAdd(files)
      } else {
        const rows = payload.data[table] || []
        if (rows.length) await db.table(table).bulkAdd(rows)
      }
    }
  })
}

export async function clearAllData() {
  await db.transaction('rw', db.tables, async () => {
    for (const table of TABLES) await db.table(table).clear()
  })
}