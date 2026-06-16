import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, CheckCircle, XCircle, AlertTriangle, ArrowRight, Clock,
  Target, TrendingUp, Lightbulb, BarChart3, Loader2, AlertCircle, FileText, Code2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAttemptApi, type AssessmentAttemptData } from '@/services/api'

function CircularGauge({ value, size = 140 }: { value: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value >= 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#F43F5E'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          filter="url(#glow1)" />
        <defs>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color }}>{Math.round(value)}</span>
        <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#1E293B]/50 border border-[#334155]/30 p-6 animate-pulse">
      <div className="h-5 w-40 bg-[#334155]/50 rounded mb-4" />
      <div className="h-8 w-20 bg-[#334155]/50 rounded mb-2" />
      <div className="h-3 w-full bg-[#334155]/50 rounded" />
    </div>
  )
}

export default function AssessmentResults() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState<AssessmentAttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!attemptId) return
      setLoading(true)
      try {
        const res = await getAttemptApi(attemptId)
        if (res.error) { setError(res.error); return }
        setAttempt(res.data!)
      } catch {
        setError('Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [attemptId])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse"><div className="h-8 w-64 bg-[#1E293B]/50 rounded" /><div className="h-4 w-48 bg-[#1E293B]/50 rounded mt-2" /></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-gray-400 text-lg">{error || 'Results not found'}</p>
        <Button onClick={() => navigate('/assessments')} variant="outline" className="border-[#334155] text-gray-300">
          Back to Assessments
        </Button>
      </div>
    )
  }

  const accuracy = attempt.accuracy ?? 0
  const score = attempt.score ?? 0
  const totalMarks = attempt.totalMarks ?? 0
  const sectionScores: { section: string; score: number; total: number }[] = attempt.sectionScores as any || []
  const strengths = attempt.strengths || []
  const weaknesses = attempt.weaknesses || []
  const suggestions: { area: string; suggestion: string }[] = attempt.suggestions as any || []
  const timeTaken = attempt.timeTaken ?? 0
  const isPassed = accuracy >= 40

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const getGradeInfo = (acc: number) => {
    if (acc >= 85) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
    if (acc >= 70) return { label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' }
    if (acc >= 55) return { label: 'Average', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
    if (acc >= 40) return { label: 'Below Average', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' }
    return { label: 'Needs Improvement', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' }
  }

  const grade = getGradeInfo(accuracy)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{attempt.assessment?.title || 'Assessment'} Results</h1>
          <p className="text-sm text-gray-400 mt-1">
            Submitted on {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
          </p>
        </div>
        <Badge className={cn('px-4 py-2 text-sm', grade.bg, grade.color)}>
          {grade.label}
        </Badge>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl flex flex-col items-center justify-center">
          <CircularGauge value={accuracy} size={140} />
          <p className="text-sm text-gray-400 mt-3">Overall Accuracy</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-400" /> Score Breakdown
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Total Score</span>
                <span className={cn('font-semibold', accuracy >= 60 ? 'text-emerald-400' : 'text-amber-400')}>
                  {score}/{totalMarks}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1E293B] overflow-hidden">
                <div className={cn('h-full rounded-full transition-all duration-1000', accuracy >= 60 ? 'bg-emerald-500' : 'bg-amber-500')}
                  style={{ width: `${totalMarks > 0 ? (score / totalMarks) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Time Taken</span>
              <span className="text-gray-300 font-medium">{formatTime(timeTaken)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <Badge variant="outline" className={cn('text-xs', isPassed ? 'text-emerald-400 border-emerald-500/20' : 'text-rose-400 border-rose-500/20')}>
                {isPassed ? 'Passed' : 'Not Passed'}
              </Badge>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Correct Answers</p>
                <p className="text-lg font-bold text-emerald-400">{attempt.answers?.filter(a => a.isCorrect).length ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Incorrect</p>
                <p className="text-lg font-bold text-rose-400">{attempt.answers?.filter(a => a.isCorrect === false).length ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Total Questions</p>
                <p className="text-lg font-bold text-white">{attempt.answers?.length ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section-wise Performance */}
      {sectionScores.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Section-wise Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sectionScores.map((section, i) => {
              const pct = section.total > 0 ? Math.round((section.score / section.total) * 100) : 0
              const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={section.section} className="p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium">{section.section}</span>
                    <span className={cn('font-semibold', pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-rose-400')}>
                      {section.score}/{section.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#0F172A] overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all duration-1000', barColor)}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strengths.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl h-full">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Strengths
              </h3>
              <div className="space-y-2">
                {strengths.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {weaknesses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl h-full">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Areas to Improve
              </h3>
              <div className="space-y-2">
                {weaknesses.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> AI Improvement Suggestions
          </h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{s.area}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{s.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Answer Review */}
      {attempt.answers && attempt.answers.length > 0 && attempt.answers[0]?.question && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Answer Review
          </h2>
          <div className="space-y-4">
            {attempt.answers.map((ans, i) => {
              const q = ans.question
              const qData = q?.questionData as any
              return (
                <div key={ans.id}
                  className={cn(
                    'p-4 rounded-xl border',
                    ans.isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-rose-500/5 border-rose-500/10'
                  )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">Q{i + 1}</span>
                        <Badge variant="outline" className="text-xs border-[#334155] text-gray-400">{q?.topic}</Badge>
                        {ans.isCorrect
                          ? <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Correct</Badge>
                          : <Badge className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/20">Incorrect</Badge>
                        }
                      </div>
                      {q?.questionType === 'MCQ' ? (
                        <p className="text-sm text-gray-300">{qData?.text}</p>
                      ) : (
                        <p className="text-sm text-gray-300">{qData?.title}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="text-gray-500">Your answer: <span className="text-gray-300 font-mono">{ans.answer || 'No answer'}</span></span>
                        {q?.questionType === 'MCQ' && (
                          <span className="text-gray-500">Correct: <span className="text-emerald-400 font-mono">{qData?.correctAnswer}</span></span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {ans.isCorrect
                        ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                        : <XCircle className="w-5 h-5 text-rose-400" />
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
          onClick={() => navigate(`/assessment/${attempt.assessmentId}`)}>
          <ArrowRight className="w-4 h-4 mr-2" /> Retake Assessment
        </Button>
        <Button variant="outline" className="border-[#334155] text-gray-300"
          onClick={() => navigate('/assessments')}>
          Back to Assessments
        </Button>
        <Button variant="outline" className="border-[#334155] text-gray-300"
          onClick={() => navigate('/gap-analysis')}>
          View Gap Analysis
        </Button>
      </motion.div>
    </div>
  )
}
