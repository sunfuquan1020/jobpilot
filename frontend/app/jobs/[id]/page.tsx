'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Job } from '@/lib/types'
import { jobsApi, applicationsApi } from '@/lib/api'
import MatchBadge from '@/components/jobs/MatchBadge'

export default function JobDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    jobsApi.get(Number(id)).then(setJob).finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!job) return
    try {
      await applicationsApi.create(job.id)
      setApplied(true)
    } catch {
      setApplied(true)
    }
  }

  if (loading) return <div className="p-8 text-slate-400 animate-pulse">加载中...</div>
  if (!job) return <div className="p-8 text-slate-400">职位不存在</div>

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1">
        ← 返回列表
      </button>

      <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {job.company[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{job.title}</h1>
            <p className="text-slate-300 mt-0.5">{job.company}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Chip>{job.location}</Chip>
              <Chip>{job.job_type}</Chip>
              <Chip>{job.experience_level}</Chip>
              {job.remote && <Chip accent>Remote</Chip>}
              {job.h1b_sponsor && <Chip accent>H1B Sponsor</Chip>}
            </div>
          </div>
          <MatchBadge score={job.match_score} />
        </div>

        {/* Salary */}
        {(job.salary_min || job.salary_max) && (
          <div className="mb-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-300 font-semibold">
              {job.salary_min && job.salary_max
                ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k / year`
                : job.salary_min ? `From $${(job.salary_min / 1000).toFixed(0)}k` : `Up to $${(job.salary_max! / 1000).toFixed(0)}k`}
            </p>
          </div>
        )}

        {/* Description */}
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">职位描述</h2>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
        </section>

        {/* Requirements */}
        {job.requirements && (
          <section className="mb-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">任职要求</h2>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </section>
        )}

        {/* Skills */}
        {job.skills?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">所需技能</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(s => (
                <span key={s} className="px-2.5 py-1 bg-violet-500/15 text-violet-300 text-xs rounded-lg">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Apply */}
        <button
          onClick={handleApply}
          disabled={applied}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            applied
              ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {applied ? '✓ 已标记投递' : 'AI 一键投递'}
        </button>
      </div>
    </div>
  )
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${accent ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>
      {children}
    </span>
  )
}
