'use client'

import { useEffect, useRef } from 'react'
import type { SkillBubble } from '@/lib/types'

interface Props {
  data: SkillBubble[]
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#84cc16']

export default function SkillBubbleChart({ data }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const loadD3 = async () => {
      const d3 = await import('d3')
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove()

      const width = svgRef.current!.clientWidth || 400
      const height = 320

      type HierarchyDatum = { name?: string; value?: number; category?: string; children?: HierarchyDatum[] }
      const pack = d3.pack<HierarchyDatum>().size([width, height]).padding(6)

      const root = d3.hierarchy<HierarchyDatum>({ children: data as HierarchyDatum[] })
        .sum(d => d.value || 0)

      const nodes = pack(root).leaves()
      const g = svg.append('g')

      nodes.forEach((node, i) => {
        const color = COLORS[i % COLORS.length]
        g.append('circle')
          .attr('cx', node.x).attr('cy', node.y).attr('r', node.r)
          .attr('fill', color).attr('fill-opacity', 0.25)
          .attr('stroke', color).attr('stroke-width', 1.5)

        if (node.r > 18) {
          g.append('text')
            .attr('x', node.x).attr('y', node.y)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .attr('fill', 'white').attr('font-size', Math.min(node.r * 0.45, 13))
            .attr('font-weight', '500').text(node.data.name || '')
        }
      })
    }

    loadD3()
  }, [data])

  if (!data.length) return null

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">技能使用频次</h2>
      <svg ref={svgRef} width="100%" height="320" />
    </div>
  )
}
