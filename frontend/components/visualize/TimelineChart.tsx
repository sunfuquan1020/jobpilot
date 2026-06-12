'use client'

import type { TimelineItem } from '@/lib/types'

interface Props {
  data: TimelineItem[]
}

const MIN_YEAR = 2013
const MAX_YEAR = 2027

function yearToPercent(year: number, month: number = 1): number {
  const total = MAX_YEAR - MIN_YEAR
  return ((year - MIN_YEAR + (month - 1) / 12) / total) * 100
}

const CATEGORY_LABELS: Record<string, string> = {
  education: '教育',
  internship: '实习',
  work: '工作',
}

export default function TimelineChart({ data }: Props) {
  const years = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">经历时间轴</h2>

      {/* Legend */}
      <div className="flex gap-4 mb-4">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getCategoryColor(key) }} />
            {label}
          </div>
        ))}
      </div>

      {/* Year axis */}
      <div className="relative ml-32">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1 pr-2">
          {years.filter((_, i) => i % 2 === 0).map(y => (
            <span key={y}>{y}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {data.map((item, i) => {
            const startY = item.start_year || MIN_YEAR
            const endY = item.end_year || (item.is_current ? new Date().getFullYear() : startY + 1)
            const startPct = yearToPercent(startY, item.start_month)
            const endPct = yearToPercent(endY, item.end_month)
            const widthPct = Math.max(endPct - startPct, 1)

            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-32 shrink-0 text-right">
                  <p className="text-xs text-slate-300 truncate">{item.label}</p>
                  {item.sublabel && <p className="text-[10px] text-slate-500 truncate">{item.sublabel}</p>}
                </div>
                <div className="flex-1 relative h-6 bg-white/[0.03] rounded">
                  <div
                    className="absolute h-full rounded"
                    style={{
                      left: `${Math.min(startPct, 98)}%`,
                      width: `${Math.min(widthPct, 100 - startPct)}%`,
                      backgroundColor: item.color,
                      opacity: 0.85,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    education: '#4ECDC4',
    internship: '#FFB347',
    work: '#FF6B6B',
  }
  return map[category] || '#8b5cf6'
}
