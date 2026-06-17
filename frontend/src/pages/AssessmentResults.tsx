import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, CheckCircle, XCircle, AlertTriangle, ArrowRight,
  Target, TrendingUp, Lightbulb, BarChart3, AlertCircle, FileText, History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAttemptApi, type AssessmentAttemptData } from '@/services/api'
import { getAttemptById, getAttemptsForAssessment, calculateAnalytics } from '@/lib/assessmentEngine'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
          filter="url(#glow)" />
        <defs>
          <filter id="glow">
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

  const localAttempt = attemptId ? getAttemptById(attemptId) : null
  const analytics = attempt?.assessmentId ? calculateAnalytics(attempt.assessmentId) : null
  const allAttempts = attempt?.assessmentId ? getAttemptsForAssessment(attempt.assessmentId) : []

  const trendData = allAttempts.slice(-10).map((a, i) => ({
    name: `#${i + 1}`,
    accuracy: a.accuracy,
    date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  const previousAttempt = allAttempts.length >= 2 ? allAttempts[allAttempts.length - 2] : null

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
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

  const accuracy = attempt.accuracy ?? localAttempt?.accuracy ?? 0
  const score = attempt.score ?? localAttempt?.score ?? 0
  const totalMarks = attempt.totalMarks ?? localAttempt?.totalMarks ?? 0
  const sectionScores: { section: string; score: number; total: number }[] = localAttempt?.sectionScores || (attempt.sectionScores as any || [])
  const strengths = attempt.strengths.length > 0 ? attempt.strengths : localAttempt?.strengths || []
  const weaknesses = attempt.weaknesses.length > 0 ? attempt.weaknesses : localAttempt?.weaknesses || []
  const suggestions: { area: string; suggestion: string }[] = localAttempt?.suggestions || (attempt.suggestions as any || [])
  const timeTaken = attempt.timeTaken ?? localAttempt?.timeTaken ?? 0
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
  const localCorrect = localAttempt?.answers.filter(a => a.isCorrect === true).length ?? 0
  const localIncorrect = localAttempt?.answers.filter(a => a.isCorrect === false).length ?? 0
  const answersList = localAttempt?.answers || attempt.answers

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] border border-[#334155]/50 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-sm font-bold text-white">{payload[0].value}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{attempt.assessment?.title || localAttempt?.assessmentTitle || 'Assessment'} Results</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : localAttempt ? new Date(localAttempt.completedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '--'}
          </p>
        </div>
        <Badge className={cn('px-3 sm:px-4 py-2 text-xs sm:text-sm', grade.bg, grade.color)}>
          {grade.label}
        </Badge>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl flex flex-col items-center justify-center">
          <CircularGauge value={accuracy} size={120} />
          <p className="text-xs sm:text-sm text-gray-400 mt-3">Overall Accuracy</p>
          {analytics && (
            <p className="text-xs text-gray-500 mt-1">Avg: {analytics.averageAccuracy}% | Best: {analytics.bestAccuracy}%</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
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
            {analytics && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Percentile</span>
                <span className="text-indigo-400 font-semibold">{analytics.percentile}th</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Correct</p>
                <p className="text-lg font-bold text-emerald-400">{attempt.answers?.filter(a => a.isCorrect).length ?? localCorrect}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Incorrect</p>
                <p className="text-lg font-bold text-rose-400">{attempt.answers?.filter(a => a.isCorrect === false).length ?? localIncorrect}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
              <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm text-gray-300">Total</p>
                <p className="text-lg font-bold text-white">{attempt.answers?.length ?? localAttempt?.answers.length ?? 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Previous Attempt Comparison */}
      {previousAttempt && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" /> vs Previous Attempt
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
              <p className="text-xs text-gray-500 mb-1">Score</p>
              <p className="text-lg font-bold text-white">{score}/{totalMarks}</p>
              <p className="text-xs text-gray-500">Previous: {previousAttempt.score}/{previousAttempt.totalMarks}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
              <p className="text-xs text-gray-500 mb-1">Accuracy</p>
              <p className={cn('text-lg font-bold', accuracy >= previousAttempt.accuracy ? 'text-emerald-400' : 'text-rose-400')}>
                {accuracy}%
              </p>
              <p className="text-xs text-gray-500">Previous: {previousAttempt.accuracy}%</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
              <p className="text-xs text-gray-500 mb-1">Correct</p>
              <p className="text-lg font-bold text-emerald-400">{localCorrect}</p>
              <p className="text-xs text-gray-500">Previous: {previousAttempt.correctCount}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
              <p className="text-xs text-gray-500 mb-1">Time</p>
              <p className="text-lg font-bold text-white">{formatTime(timeTaken)}</p>
              <p className="text-xs text-gray-500">Previous: {formatTime(previousAttempt.timeTaken)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trends Chart */}
      {trendData.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Performance Trend
          </h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="accuracy" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 6, fill: '#818CF8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Section-wise Performance */}
      {sectionScores.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Section-wise Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sectionScores.map((section) => {
              const pct = section.total > 0 ? Math.round((section.score / section.total) * 100) : 0
              const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              return (
                <div key={section.section} className="p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium truncate mr-2">{section.section}</span>
                    <span className={cn('font-semibold shrink-0', pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-rose-400')}>
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
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl h-full">
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
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl h-full">
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
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> Improvement Suggestions
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
      {answersList && answersList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
          <h2 className="text-base sm:text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> Answer Review
          </h2>
          <div className="space-y-4">
            {answersList.map((ans: any, i: number) => {
              const q = ans.question
              const ansData = ans.questionData || (q?.questionData as any)
              const isCorrect = ans.isCorrect
              const explanation = ans.explanation || ansData?.explanation
              return (
                <div key={ans.id || ans.questionId}
                  className={cn(
                    'p-4 rounded-xl border',
                    isCorrect ? 'bg-emerald-500/5 border-emerald-500/10' : isCorrect === false ? 'bg-rose-500/5 border-rose-500/10' : 'bg-[#1E293B]/50 border-[#334155]/30'
                  )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 font-mono">Q{i + 1}</span>
                        <Badge variant="outline" className="text-xs border-[#334155] text-gray-400">{ans.topic || q?.topic}</Badge>
                        <Badge variant="outline" className="text-xs border-[#334155] text-gray-400">{ans.difficulty || q?.difficulty}</Badge>
                        {isCorrect
                          ? <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Correct</Badge>
                          : isCorrect === false
                          ? <Badge className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/20">Incorrect</Badge>
                          : <Badge className="text-xs bg-gray-500/10 text-gray-400 border-gray-500/20">Unanswered</Badge>
                        }
                      </div>
                      {ans.questionType === 'MCQ' || q?.questionType === 'MCQ' ? (
                        <p className="text-sm text-gray-300">{q ? ansData?.text : ans.questionData?.text}</p>
                      ) : (
                        <p className="text-sm text-gray-300">{q ? ansData?.title : ans.questionData?.title}</p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                        <span className="text-gray-500">Your answer: <span className="text-gray-300 font-mono">{ans.answer || ans.userAnswer || 'No answer'}</span></span>
                        {(ans.questionType === 'MCQ' || q?.questionType === 'MCQ') && (
                          <span className="text-gray-500">Correct: <span className="text-emerald-400 font-mono">{ans.correctAnswer}</span></span>
                        )}
                      </div>
                      {explanation && isCorrect === false && (
                        <p className="text-xs text-indigo-400 mt-2">{explanation}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isCorrect
                        ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                        : isCorrect === false
                        ? <XCircle className="w-5 h-5 text-rose-400" />
                        : <AlertCircle className="w-5 h-5 text-gray-500" />
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
        className="flex flex-wrap gap-3 sm:gap-4 pb-8">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
          onClick={() => navigate(`/assessment/${attempt.assessmentId}`)}>
          <ArrowRight className="w-4 h-4 mr-2" /> Retake
        </Button>
        <Button variant="outline" className="border-[#334155] text-gray-300"
          onClick={() => navigate('/assessments')}>
          All Assessments
        </Button>
        <Button variant="outline" className="border-[#334155] text-gray-300"
          onClick={() => navigate('/assessment-dashboard')}>
          Analytics Dashboard
        </Button>
        <Button variant="outline" className="border-[#334155] text-gray-300"
          onClick={() => navigate('/gap-analysis')}>
          Gap Analysis
        </Button>
      </motion.div>
    </div>
  )
}
