import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Lightbulb, TrendingUp, MessageSquare, Brain, Target } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ReplayQuestion } from '@/data/mockData'

interface ReplayQuestionCardProps {
  question: ReplayQuestion;
  index: number;
}

function ScoreRow({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const barColor = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
        <span className={cn('font-semibold', color)}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function ReplayQuestionCard({ question, index }: ReplayQuestionCardProps) {
  const [expanded, setExpanded] = useState(index === 0)

  const overallColor = question.overallScore >= 75
    ? 'text-emerald-400'
    : question.overallScore >= 50
      ? 'text-amber-400'
      : 'text-rose-400'

  const category = question.overallScore >= 75 ? 'Strong' : question.overallScore >= 50 ? 'Average' : 'Weak'
  const categoryColor = question.overallScore >= 75
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : question.overallScore >= 50
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm">
            {question.questionNumber}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{question.question}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', categoryColor)}>
                {category}
              </Badge>
              <span className="text-xs text-gray-500">Score: {question.overallScore}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn('text-lg font-bold', overallColor)}>{question.overallScore}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-[#334155]/50"
        >
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Your Answer
                  </p>
                  <div className="bg-[#0F172A]/80 rounded-lg p-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{question.userAnswer}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Expected Answer
                  </p>
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{question.expectedAnswer}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Scores
                </p>
                <div className="bg-[#0F172A]/80 rounded-lg p-3 space-y-2.5">
                  <ScoreRow label="Confidence" value={question.confidence} icon={Brain} color={
                    question.confidence >= 75 ? 'text-emerald-400' : question.confidence >= 50 ? 'text-amber-400' : 'text-rose-400'
                  } />
                  <ScoreRow label="Technical" value={question.technicalScore} icon={CodeIcon} color={
                    question.technicalScore >= 75 ? 'text-emerald-400' : question.technicalScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  } />
                  <ScoreRow label="Communication" value={question.communicationScore} icon={MessageSquare} color={
                    question.communicationScore >= 75 ? 'text-emerald-400' : question.communicationScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  } />
                  <ScoreRow label="Clarity" value={question.clarityScore} icon={Target} color={
                    question.clarityScore >= 75 ? 'text-emerald-400' : question.clarityScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  } />
                  <div className="pt-1 border-t border-[#334155]/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Overall</span>
                      <span className={cn('font-bold', overallColor)}>{question.overallScore}%</span>
                    </div>
                    <Progress value={question.overallScore} className="h-1.5 mt-1" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-400">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {question.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400">Weaknesses</span>
                </div>
                <ul className="space-y-1">
                  {question.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-medium text-indigo-400">Improvements</span>
                </div>
                <ul className="space-y-1">
                  {question.improvementSuggestions.map((sugg, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      {sugg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
