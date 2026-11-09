import db from '../database/db'

export const listFiles = () => db.files.orderBy('createdAt').reverse().toArray()
export const listFolders = () => db.folders.toArray()

export async function addFolder(name) {
  const clean = name?.trim()
  if (!clean) return null
  const exists = await db.folders.where('name').equalsIgnoreCase(clean).first()
  if (exists) return exists
  const id = await db.folders.add({ name: clean, createdAt: Date.now() })
  return db.folders.get(id)
}

export async function deleteFolder(id) {
  await db.transaction('rw', db.folders, db.files, async () => {
    await db.folders.delete(id)
    await db.files.where('folderId').equals(id).modify({ folderId: null })
  })
}

export async function uploadFiles(fileList, folderId = null) {
  const arr = Array.from(fileList || [])
  if (!arr.length) return []
  const records = arr.map((file) => ({
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    folderId: folderId ?? null,
    data: file,
    createdAt: Date.now()
  }))
  await db.files.bulkAdd(records)
  return records
}

export const deleteFile = (id) => db.files.delete(id)

export function getFileUrl(file) {
  if (!file?.data) return ''
  return URL.createObjectURL(file.data)
}

export function downloadFile(file) {
  const url = getFileUrl(file)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name || 'download'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function fileKind(mime = '') {
  if (mime.startsWith('image/')) return 'image'
  if (mime === 'application/pdf') return 'pdf'
  if (mime.includes('word')) return 'word'
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel'
  if (mime.includes('powerpoint') || mime.includes('presentation')) return 'ppt'
  if (mime.startsWith('text/')) return 'text'
  return 'other'
}