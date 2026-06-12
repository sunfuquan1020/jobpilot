interface MatchBadgeProps {
  score: number | null
}

export default function MatchBadge({ score }: MatchBadgeProps) {
  if (score === null || score === undefined) return null

  const getStyle = () => {
    if (score >= 65) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    if (score >= 40) return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }

  const getLabel = () => {
    if (score >= 65) return 'High Match'
    if (score >= 40) return 'Fair Match'
    return 'Low Match'
  }

  return (
    <div className={`flex flex-col items-center border rounded-xl px-3 py-2 min-w-[72px] ${getStyle()}`}>
      <span className="text-2xl font-bold leading-none">{Math.round(score)}%</span>
      <span className="text-[10px] mt-0.5 opacity-80">{getLabel()}</span>
    </div>
  )
}
