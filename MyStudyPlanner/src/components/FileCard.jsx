import { FileText, FileSpreadsheet, Presentation, Image as ImageIcon, File, Eye, Download, Trash2 } from 'lucide-react'
import { fileKind, formatBytes } from '../services/fileService'

const ICONS = {
  image: ImageIcon,
  pdf: FileText,
  word: FileText,
  excel: FileSpreadsheet,
  ppt: Presentation,
  text: FileText,
  other: File
}

export default function FileCard({ file, onPreview, onDownload, onDelete }) {
  const kind = fileKind(file.mime)
  const Icon = ICONS[kind] || File

  return (
    <div className="file-card">
      <div className={`file-icon kind-${kind}`}>
        <Icon size={22} />
      </div>
      <div className="file-meta">
        <strong title={file.name}>{file.name}</strong>
        <span>{formatBytes(file.size)} · {kind.toUpperCase()}</span>
      </div>
      <div className="file-actions">
        <button className="icon-btn" onClick={() => onPreview(file)} title="Preview"><Eye size={14} /></button>
        <button className="icon-btn" onClick={() => onDownload(file)} title="Download"><Download size={14} /></button>
        <button className="icon-btn danger" onClick={() => onDelete(file)} title="Delete"><Trash2 size={14} /></button>
      </div>
    </div>
  )
}