'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Job, JobListResponse } from '@/lib/types'
import { jobsApi } from '@/lib/api'
import JobCard from '@/components/jobs/JobCard'

const SOURCES = [
  { key: '', label: '全部推荐' },
  { key: 'internal', label: '智能推荐' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'external', label: '外部职位' },
]

export default function JobsPage() {
  const [data, setData] = useState<JobListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [source, setSource] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 400)
    return () => clearTimeout(t)
  }, [keyword])

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (debouncedKeyword) params.keyword = debouncedKeyword
      if (source) params.source = source
      const result = await jobsApi.list(params)
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, source])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">职位推荐</h1>
        <p className="text-slate-400 text-sm mt-1">基于你的简历智能匹配最适合的岗位</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="搜索职位、公司、技能..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="w-full bg-[#1a1d2e] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Source Tabs */}
      <div className="flex gap-1 mb-6 bg-[#13151e] rounded-xl p-1">
        {SOURCES.map(s => (
          <button
            key={s.key}
            onClick={() => setSource(s.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              source === s.key
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {data && (
        <p className="text-xs text-slate-500 mb-4">{data.total} 个职位</p>
      )}

      {/* Job List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1a1d2e] rounded-xl h-36 animate-pulse" />
          ))}
        </div>
      ) : data?.jobs.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p>没有找到匹配的职位</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
