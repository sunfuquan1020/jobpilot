'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { VisualizeData } from '@/lib/types'
import { resumesApi } from '@/lib/api'

const TimelineChart = dynamic(() => import('@/components/visualize/TimelineChart'), { ssr: false })
const SkillBubbleChart = dynamic(() => import('@/components/visualize/SkillBubbleChart'), { ssr: false })
const SkillLevelMatrix = dynamic(() => import('@/components/visualize/SkillLevelMatrix'), { ssr: false })
const ExperienceTreemap = dynamic(() => import('@/components/visualize/ExperienceTreemap'), { ssr: false })

export default function VisualizePage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState<VisualizeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    resumesApi.visualize(Number(id))
      .then(setData)
      .catch(() => setError('加载可视化数据失败'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-[#1a1d2e] rounded-2xl h-64 animate-pulse" />)}
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="p-8 text-slate-400">
      {error || '数据不存在'}
      <button onClick={() => router.back()} className="block mt-4 text-violet-400 hover:text-violet-300">返回</button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 mb-2">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-white">简历可视化分析</h1>
          <p className="text-slate-400 text-sm mt-1">直观展示你的经历、技能结构和职业路径</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Timeline */}
        {data.timeline.length > 0 && <TimelineChart data={data.timeline} />}

        {/* Side by side: Bubble + Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {data.skill_bubbles.length > 0 && <SkillBubbleChart data={data.skill_bubbles} />}
          {data.skill_matrix.length > 0 && <SkillLevelMatrix data={data.skill_matrix} />}
        </div>

        {/* Treemap */}
        {data.experience_tree.length > 0 && <ExperienceTreemap data={data.experience_tree} />}

        {data.timeline.length === 0 && data.skill_bubbles.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-4xl mb-3">📊</p>
            <p>暂无可视化数据，请确认简历已成功解析</p>
          </div>
        )}
      </div>
    </div>
  )
}
