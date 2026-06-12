'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Resume } from '@/lib/types'
import { resumesApi } from '@/lib/api'

function ScoreBar({ label, score, color }: { label: string; score: number | null; color: string }) {
  if (score === null) return null
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium">{score}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

export default function ResumeDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resumesApi.get(Number(id)).then(setResume).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">加载中...</div>
  if (!resume) return <div className="p-8 text-slate-400">简历不存在</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← 返回
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{resume.name || '简历详情'}</h1>
        {resume.status === 'ready' && (
          <Link
            href={`/resume/${id}/visualize`}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            📊 可视化分析
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Score Card */}
        <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">简历评分</h2>
          {resume.score_overall !== null && (
            <div className="text-center mb-5">
              <div className="text-5xl font-bold text-white">{resume.score_overall}</div>
              <div className="text-slate-400 text-sm mt-1">综合评分 / 100</div>
            </div>
          )}
          <div className="space-y-3">
            <ScoreBar label="完整度" score={resume.score_completeness} color="bg-cyan-500" />
            <ScoreBar label="量化描述" score={resume.score_quantification} color="bg-violet-500" />
            <ScoreBar label="关键词覆盖" score={resume.score_keywords} color="bg-emerald-500" />
            <ScoreBar label="格式规范" score={resume.score_format} color="bg-amber-500" />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">基本信息</h2>
          <div className="space-y-2 text-sm">
            {resume.email && <InfoRow icon="📧" text={resume.email} />}
            {resume.phone && <InfoRow icon="📞" text={resume.phone} />}
            {resume.location && <InfoRow icon="📍" text={resume.location} />}
            {resume.target_role && <InfoRow icon="🎯" text={resume.target_role} />}
          </div>
        </div>

        {/* Skills */}
        {resume.skills && resume.skills.length > 0 && (
          <div className="md:col-span-2 bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">技能标签</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-violet-500/15 text-violet-300 text-xs rounded-lg">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">教育经历</h2>
            <div className="space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i}>
                  <p className="text-white text-sm font-medium">{edu.school}</p>
                  {edu.degree && <p className="text-slate-400 text-xs">{edu.degree} {edu.field}</p>}
                  {edu.start_year && (
                    <p className="text-slate-500 text-xs">{edu.start_year} – {edu.end_year || '至今'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">工作/实习经历</h2>
            <div className="space-y-3">
              {resume.experience.map((exp, i) => (
                <div key={i}>
                  <p className="text-white text-sm font-medium">{exp.title}</p>
                  <p className="text-slate-400 text-xs">{exp.company}</p>
                  {exp.start_year && (
                    <p className="text-slate-500 text-xs">{exp.start_year} – {exp.is_current ? '至今' : exp.end_year || ''}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-300">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  )
}
