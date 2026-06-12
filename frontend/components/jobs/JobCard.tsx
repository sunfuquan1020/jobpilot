'use client'

import Link from 'next/link'
import type { Job } from '@/lib/types'
import MatchBadge from './MatchBadge'
import { applicationsApi } from '@/lib/api'
import { useState } from 'react'

interface JobCardProps {
  job: Job
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Salary not specified'
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function JobCard({ job }: JobCardProps) {
  const [applied, setApplied] = useState(false)
  const [applying, setApplying] = useState(false)

  const handleApply = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (applying || applied) return
    setApplying(true)
    try {
      await applicationsApi.create(job.id)
      setApplied(true)
    } catch {
      // already applied
      setApplied(true)
    } finally {
      setApplying(false)
    }
  }

  return (
    <Link href={`/jobs/${job.id}`}>
      <article className="group bg-[#1a1d2e] hover:bg-[#1e2138] border border-white/5 hover:border-violet-500/30 rounded-xl p-5 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          {/* Company logo placeholder */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
            {job.company[0]}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
              {job.title}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">{job.company}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <Tag>{job.location}</Tag>
              <Tag>{job.job_type}</Tag>
              {job.remote && <Tag accent>Remote</Tag>}
              {job.h1b_sponsor && <Tag accent>H1B</Tag>}
            </div>

            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-sm font-medium text-slate-200">{formatSalary(job.salary_min, job.salary_max)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{timeAgo(job.posted_at)}</p>
              </div>

              <button
                onClick={handleApply}
                disabled={applied || applying}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  applied
                    ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
              >
                {applied ? '已投递' : applying ? '投递中...' : 'AI 投递'}
              </button>
            </div>
          </div>

          <MatchBadge score={job.match_score} />
        </div>
      </article>
    </Link>
  )
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
      accent ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-slate-400'
    }`}>
      {children}
    </span>
  )
}
