import { cn } from '@/lib/utils'
import type { ReplayQuestion } from '@/data/mockData'

interface ReplaySidebarProps {
  questions: ReplayQuestion[];
  activeIndex: number;
  onSelect: (index: number) => void;
  collapsed: boolean;
}

export default function ReplaySidebar({ questions, activeIndex, onSelect, collapsed }: ReplaySidebarProps) {
  if (collapsed) return null

  const completed = questions.filter(q => q.overallScore >= 50).length
  const progress = questions.length > 0 ? Math.round((completed / questions.length) * 100) : 0

  return (
    <div className="w-64 shrink-0 space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Questions</h3>
          <span className="text-xs text-gray-400">{questions.length}</span>
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scroll">
          {questions.map((q, i) => {
            const isActive = i === activeIndex
            const scoreColor = q.overallScore >= 75
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : q.overallScore >= 50
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'

            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                )}
              >
                <span className={cn('w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-medium border shrink-0', scoreColor)}>
                  {q.questionNumber}
                </span>
                <span className="truncate flex-1">{q.question}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
