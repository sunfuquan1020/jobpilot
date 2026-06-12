'use client'

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import type { ExperienceTreeItem } from '@/lib/types'

interface Props {
  data: ExperienceTreeItem[]
}

const COLORS = ['#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

const CustomContent = (props: {
  x?: number; y?: number; width?: number; height?: number
  name?: string; index?: number; depth?: number
  root?: { name: string }
}) => {
  const { x = 0, y = 0, width = 0, height = 0, name, index = 0, depth } = props
  if (!width || !height || depth === 0) return null
  const color = COLORS[index % COLORS.length]
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1} rx={4} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={Math.min(14, width / 6)} fontWeight="500">
          {name}
        </text>
      )}
    </g>
  )
}

export default function ExperienceTreemap({ data }: Props) {
  if (!data.length) return null

  const flat = data.flatMap(group =>
    (group.children || []).map(c => ({
      name: c.name,
      value: c.value,
      parent: group.name,
    }))
  )

  if (!flat.length) return null

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">工作经历分布</h2>
      <ResponsiveContainer width="100%" height={280}>
        <Treemap
          data={flat}
          dataKey="value"
          nameKey="name"
          content={<CustomContent />}
        >
          <Tooltip
            contentStyle={{ background: '#1a1d2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => [`${value} 月`, '时长']}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
