import db from '../database/db'

export async function getSetting(key, fallback = null) {
  const row = await db.settings.where('key').equals(key).first()
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  const row = await db.settings.where('key').equals(key).first()
  if (row) await db.settings.update(row.id, { value })
  else await db.settings.add({ key, value })
}