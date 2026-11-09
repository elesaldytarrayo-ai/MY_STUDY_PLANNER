import { useEffect, useMemo, useRef, useState } from 'react'
import { Folder, FolderPlus, Upload, Trash2, FolderOpen } from 'lucide-react'
import Modal from '../components/Modal'
import FileCard from '../components/FileCard'
import * as fileService from '../services/fileService'

export default function MyFiles() {
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [activeFolder, setActiveFolder] = useState('all')
  const [newFolder, setNewFolder] = useState('')
  const [preview, setPreview] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const inputRef = useRef(null)

  const load = async () => {
    const [f, fl] = await Promise.all([fileService.listFolders(), fileService.listFiles()])
    setFolders(f); setFiles(fl)
  }
  useEffect(() => { load() }, [])

  const visible = useMemo(() => {
    if (activeFolder === 'all') return files
    if (activeFolder === 'none') return files.filter((f) => f.folderId == null)
    return files.filter((f) => f.folderId === activeFolder)
  }, [files, activeFolder])

  const handleUpload = async (e) => {
    const list = e.target.files
    if (!list?.length) return
    const folderId = activeFolder === 'all' || activeFolder === 'none' ? null : activeFolder
    await fileService.uploadFiles(list, folderId)
    e.target.value = ''
    load()
  }

  const openPreview = (file) => {
    const url = fileService.getFileUrl(file)
    setPreviewUrl(url)
    setPreview(file)
  }
  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setPreview(null)
  }

  const remove = async (file) => {
    if (!confirm(`Delete "${file.name}"?`)) return
    await fileService.deleteFile(file.id)
    load()
  }

  const createFolder = async () => {
    if (!newFolder.trim()) return
    await fileService.addFolder(newFolder)
    setNewFolder('')
    load()
  }

  const removeFolder = async (folder) => {
    if (!confirm(`Delete folder "${folder.name}"? Files inside will move to Unfiled.`)) return
    await fileService.deleteFolder(folder.id)
    if (activeFolder === folder.id) setActiveFolder('all')
    load()
  }

  const kind = preview ? fileService.fileKind(preview.mime) : 'other'

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My Files</h1>
          <p>Store PDFs, documents, slides, spreadsheets, and images locally.</p>
        </div>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> Upload files
        </button>
        <input ref={inputRef} type="file" multiple hidden onChange={handleUpload} />
      </div>

      <div className="files-layout">
        <aside className="card folders-panel">
          <h4><FolderOpen size={15} /> Folders</h4>
          <button className={`folder-item ${activeFolder === 'all' ? 'active' : ''}`} onClick={() => setActiveFolder('all')}>
            <Folder size={14} /> All files <span className="count">{files.length}</span>
          </button>
          <button className={`folder-item ${activeFolder === 'none' ? 'active' : ''}`} onClick={() => setActiveFolder('none')}>
            <Folder size={14} /> Unfiled <span className="count">{files.filter((f) => f.folderId == null).length}</span>
          </button>
          {folders.map((f) => (
            <div key={f.id} className={`folder-row ${activeFolder === f.id ? 'active' : ''}`}>
              <button className="folder-item" onClick={() => setActiveFolder(f.id)}>
                <Folder size={14} /> {f.name}
                <span className="count">{files.filter((x) => x.folderId === f.id).length}</span>
              </button>
              <button className="icon-btn danger tiny" onClick={() => removeFolder(f)}><Trash2 size={11} /></button>
            </div>
          ))}

          <div className="folder-add">
            <input
              className="input"
              placeholder="New folder…"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <button className="icon-btn" onClick={createFolder}><FolderPlus size={14} /></button>
          </div>
        </aside>

        <section className="files-panel">
          {visible.length === 0 ? (
            <div className="card empty">
              <Folder size={28} />
              <p>No files here yet. Upload your first document.</p>
            </div>
          ) : (
            <div className="file-grid">
              {visible.map((f) => (
                <FileCard
                  key={f.id}
                  file={f}
                  onPreview={openPreview}
                  onDownload={fileService.downloadFile}
                  onDelete={remove}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal open={!!preview} title={preview?.name || 'Preview'} onClose={closePreview}>
        {preview && (
          <div className="preview-body">
            {kind === 'image' && <img src={previewUrl} alt={preview.name} className="preview-img" />}
            {kind === 'pdf' && <iframe src={previewUrl} title={preview.name} className="preview-frame" />}
            {kind !== 'image' && kind !== 'pdf' && (
              <p className="muted">Preview is not available for this file type. Use download instead.</p>
            )}
            <div className="row-actions end">
              <button className="btn" onClick={() => fileService.downloadFile(preview)}>Download</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}