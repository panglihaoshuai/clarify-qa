'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import MethodologyPicker, { METHODOLOGIES } from './MethodologyPicker'
import FilePreviewList from './FilePreviewList'

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([])
  const [methodology, setMethodology] = useState('brainstorming')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    if (files.length + dropped.length > 20) {
      alert('最多20个文件')
      return
    }
    setFiles((prev) => [...prev, ...dropped])
  }, [files.length])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const selected = Array.from(e.target.files)
    if (files.length + selected.length > 20) {
      alert('最多20个文件')
      return
    }
    setFiles((prev) => [...prev, ...selected])
  }

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (files.length === 0) {
      alert('请先上传文件')
      return
    }
    setUploading(true)

    const sessionRes = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ methodology }),
    })
    if (!sessionRes.ok) {
      alert('创建会话失败')
      setUploading(false)
      return
    }
    const { id: sessionId } = await sessionRes.json()

    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    formData.append('sessionId', sessionId)
    formData.append('methodology', methodology)

    const analyzeRes = await fetch('/api/sessions/' + sessionId + '/analyze', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)
    if (analyzeRes.ok) {
      router.push('/session/' + sessionId)
    } else {
      alert('分析失败')
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed',
          borderColor: dragging ? '#2563EB' : '#E5E5E0',
          borderRadius: '8px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#EFF6FF' : '#fff',
          transition: 'all 0.2s ease',
        }}>
        <p style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>
          拖拽文件或图片到这里<br />
          <span style={{ fontSize: '0.75rem' }}>最多20个文件，支持 PDF、图片、文档</span>
        </p>
        <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt" onChange={handleFileSelect} style={{ display: 'none' }} />
      </div>

      <FilePreviewList files={files} onRemove={handleRemove} />

      <div style={{ marginTop: '1.5rem' }}>
        <MethodologyPicker selected={methodology} onChange={setMethodology} />
      </div>

      <button onClick={handleSubmit} disabled={uploading || files.length === 0}
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem 2rem',
          background: files.length === 0 ? '#ccc' : '#2563EB',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: files.length === 0 ? 'not-allowed' : 'pointer',
        }}>
        {uploading ? '分析中...' : '开始分析'}
      </button>
    </div>
  )
}
