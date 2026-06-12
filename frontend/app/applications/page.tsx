'use client'

import { useEffect, useState } from 'react'
import type { Application } from '@/lib/types'
import { applicationsApi } from '@/lib/api'
import Link from 'next/link'

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
  applied: { label: '已投递', style: 'bg-blue-500/20 text-blue-300' },
  interview: { label: '面试中', style: 'bg-amber-500/20 text-amber-300' },
  offer: { label: '已拿到Offer', style: 'bg-emerald-500/20 text-emerald-300' },
  rejected: { label: '未通过', style: 'bg-red-500/20 text-red-300' },
}

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`
  return min && max ? `${fmt(min)}–${fmt(max)}` : min ? `${fmt(min)}+` : `≤${fmt(max!)}`
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  return days === 0 ? '今天' : `${days} 天前`
}

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    applicationsApi.list().then(setApps).finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await applicationsApi.updateStatus(id, status)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const stats = {
    total: apps.length,
    interview: apps.filter(a => a.status === 'interview').length,
    offer: apps.filter(a => a.status === 'offer').length,
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">投递记录</h1>
      <p className="text-slate-400 text-sm mb-6">追踪所有职位投递的进展</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="总投递" value={stats.total} color="text-white" />
        <StatCard label="面试中" value={stats.interview} color="text-amber-300" />
        <StatCard label="已拿 Offer" value={stats.offer} color="text-emerald-300" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#1a1d2e] rounded-xl h-24 animate-pulse" />)}</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 bg-[#1a1d2e] rounded-2xl border border-white/5">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white font-semibold mb-1">还没有投递记录</p>
          <p className="text-slate-400 text-sm mb-4">在职位列表中点击"AI 投递"开始求职</p>
          <Link href="/jobs" className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold">
            浏览职位
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
            const salary = formatSalary(app.job.salary_min, app.job.salary_max)
            return (
              <div key={app.id} className="bg-[#1a1d2e] border border-white/5 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${app.job.id}`} className="font-semibold text-white hover:text-violet-300 transition-colors truncate block">
                      {app.job.title}
                    </Link>
                    <p className="text-sm text-slate-400">{app.job.company} · {app.job.location}</p>
                    {salary && <p className="text-xs text-emerald-400 mt-0.5">{salary}</p>}
                    <p className="text-xs text-slate-500 mt-1">{timeAgo(app.applied_at)} 投递</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.style}`}>{cfg.label}</span>
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 px-2 py-1 focus:outline-none"
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}
