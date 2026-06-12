'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Resume } from '@/lib/types'
import { resumesApi } from '@/lib/api'

function ScoreRing({ score, label }: { score: number | null; label: string }) {
  if (score === null) return null
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill="none" stroke="#1e2138" strokeWidth="6" />
          <circle
            cx="28" cy="28" r="22"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - score / 100)}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{score}</span>
      </div>
      <span className="text-[10px] text-slate-400 mt-1 text-center">{label}</span>
    </div>
  )
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resumesApi.list().then(setResumes).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">我的简历</h1>
          <p className="text-slate-400 text-sm mt-1">上传简历以获得智能职位匹配和 AI 分析</p>
        </div>
        <Link
          href="/resume/upload"
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          + 上传简历
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-[#1a1d2e] rounded-xl h-36 animate-pulse" />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-20 bg-[#1a1d2e] rounded-2xl border border-white/5">
          <p className="text-5xl mb-4">📄</p>
          <p className="text-white font-semibold mb-1">还没有上传简历</p>
          <p className="text-slate-400 text-sm mb-6">上传简历后，AI 将自动分析并匹配最适合你的职位</p>
          <Link href="/resume/upload" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold">
            立即上传
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map(resume => (
            <div key={resume.id} className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{resume.name || resume.filename}</p>
                    <StatusBadge status={resume.status} />
                  </div>
                  {resume.target_role && (
                    <p className="text-sm text-slate-400 mt-0.5">目标岗位：{resume.target_role}</p>
                  )}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {resume.skills.slice(0, 6).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-white/5 text-slate-400 text-xs rounded">{s}</span>
                      ))}
                      {resume.skills.length > 6 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xs">+{resume.skills.length - 6}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <Link href={`/resume/${resume.id}`} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-lg transition-colors">
                      查看详情
                    </Link>
                    {resume.status === 'ready' && (
                      <Link href={`/resume/${resume.id}/visualize`} className="px-3 py-1.5 bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs rounded-lg transition-colors">
                        可视化分析
                      </Link>
                    )}
                  </div>
                </div>

                {resume.status === 'ready' && (
                  <div className="flex gap-3 shrink-0">
                    <ScoreRing score={resume.score_overall} label="综合" />
                    <ScoreRing score={resume.score_completeness} label="完整度" />
                    <ScoreRing score={resume.score_keywords} label="关键词" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ready: 'bg-emerald-500/20 text-emerald-300',
    processing: 'bg-amber-500/20 text-amber-300',
    error: 'bg-red-500/20 text-red-300',
  }
  const labels: Record<string, string> = { ready: '已解析', processing: '处理中', error: '错误' }
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${map[status] || map.processing}`}>{labels[status] || status}</span>
}
