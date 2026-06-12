'use client'

import type { SkillMatrixItem } from '@/lib/types'

interface Props {
  data: SkillMatrixItem[]
}

const LEVELS = ['Beginner', 'Lower-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

export default function SkillLevelMatrix({ data }: Props) {
  if (!data.length) return null

  return (
    <div className="bg-[#1a1d2e] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">技能水平矩阵</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-normal pb-2 pr-4 w-28">技能</th>
              {LEVELS.map(l => (
                <th key={l} className="text-center text-slate-500 font-normal pb-2 px-2">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.skill} className="border-t border-white/5">
                <td className="py-2 pr-4 text-slate-300">{item.skill}</td>
                {LEVELS.map((level, li) => (
                  <td key={level} className="py-2 px-2 text-center">
                    {li <= item.level_index ? (
                      <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/30 border border-violet-500/60">
                        <div className="w-2 h-2 rounded-full bg-violet-400" />
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
