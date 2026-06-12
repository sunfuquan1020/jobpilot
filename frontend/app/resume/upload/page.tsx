'use client'

import { useState, useRef, DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import { resumesApi } from '@/lib/api'

export default function UploadPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [targetRole, setTargetRole] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && (f.name.endsWith('.pdf') || f.name.endsWith('.docx'))) setFile(f)
    else setError('请上传 PDF 或 DOCX 格式的简历')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setError('') }
  }

  const handleSubmit = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const resume = await resumesApi.upload(file, targetRole)
      router.push(`/resume/${resume.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败，请重试')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← 返回
      </button>

      <h1 className="text-2xl font-bold text-white mb-2">上传简历</h1>
      <p className="text-slate-400 text-sm mb-8">支持 PDF、DOCX 格式，AI 将自动解析并生成可视化分析</p>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? 'border-violet-400 bg-violet-500/10' : file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5'
        }`}
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileChange} />
        {file ? (
          <>
            <p className="text-4xl mb-3">📄</p>
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB</p>
            <p className="text-emerald-400 text-xs mt-2">点击重新选择</p>
          </>
        ) : (
          <>
            <p className="text-4xl mb-3">⬆️</p>
            <p className="text-white font-medium">拖拽文件到此处或点击上传</p>
            <p className="text-slate-400 text-sm mt-1">PDF · DOCX · 最大 10MB</p>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

      {/* Target Role */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-slate-300 mb-1.5">目标岗位（可选）</label>
        <input
          type="text"
          placeholder="例如：Senior Software Engineer"
          value={targetRole}
          onChange={e => setTargetRole(e.target.value)}
          className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || uploading}
        className="mt-6 w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
      >
        {uploading ? '解析中...' : '上传并解析'}
      </button>
    </div>
  )
}
