import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, Code2, Server, LayoutDashboard, Building2, Clock,
  HelpCircle, ArrowRight, Award, Loader2, AlertCircle, BarChart3,
  CheckCircle, Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getAssessmentsApi, getAllAttemptsApi, type AssessmentData, type AssessmentAttemptData } from '@/services/api'
import { MOCK_ASSESSMENTS } from '@/lib/assessmentData'

const assessmentIcons: Record<string, any> = {
  APTITUDE: Brain,
  TECHNICAL: Server,
  CODING: Code2,
  FULL_PLACEMENT: LayoutDashboard,
  PRODUCT_COMPANY: Building2,
}

const assessmentColors: Record<string, { bg: string; border: string; icon: string; gradient: string }> = {
  APTITUDE: { bg: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-500/20', icon: 'bg-indigo-500/20 text-indigo-400', gradient: 'from-indigo-500 to-purple-600' },
  TECHNICAL: { bg: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20 text-emerald-400', gradient: 'from-emerald-500 to-teal-600' },
  CODING: { bg: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/20', icon: 'bg-cyan-500/20 text-cyan-400', gradient: 'from-cyan-500 to-blue-600' },
  FULL_PLACEMENT: { bg: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20', icon: 'bg-amber-500/20 text-amber-400', gradient: 'from-amber-500 to-orange-600' },
  PRODUCT_COMPANY: { bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/20', icon: 'bg-rose-500/20 text-rose-400', gradient: 'from-rose-500 to-pink-600' },
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-[#1E293B]/50 border border-[#334155]/30 p-6 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-[#334155]/50 mb-4" />
      <div className="h-5 w-3/4 bg-[#334155]/50 rounded mb-2" />
      <div className="h-3 w-full bg-[#334155]/50 rounded mb-3" />
      <div className="h-3 w-2/3 bg-[#334155]/50 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-[#334155]/50 rounded-full" />
        <div className="h-6 w-16 bg-[#334155]/50 rounded-full" />
      </div>
    </div>
  )
}

export default function AssessmentList() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState<AssessmentData[]>([])
  const [attempts, setAttempts] = useState<AssessmentAttemptData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [assessmentsRes, attemptsRes] = await Promise.all([
          getAssessmentsApi(),
          getAllAttemptsApi()
        ])
        if (assessmentsRes.error) setError(assessmentsRes.error)
        else setAssessments(assessmentsRes.data || [])
        if (!attemptsRes.error) setAttempts(attemptsRes.data || [])
      } catch {
        setError('Failed to load assessments')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const getBestAttempt = (assessmentId: string) => {
    const assessmentAttempts = attempts.filter(a => a.assessmentId === assessmentId && a.status === 'SUBMITTED')
    if (assessmentAttempts.length === 0) return null
    return assessmentAttempts.reduce((best, a) => (a.score || 0) > (best.score || 0) ? a : best)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="animate-pulse"><div className="h-8 w-64 bg-[#1E293B]/50 rounded" /><div className="h-4 w-96 bg-[#1E293B]/50 rounded mt-2" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-gray-400 text-lg">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="border-[#334155] text-gray-300">
          <Loader2 className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Mock Assessments</h1>
        <p className="text-sm text-gray-400 mt-1">
          Practice with real-world assessment patterns used by top recruiters. Each assessment simulates the actual test environment.
        </p>
      </motion.div>

      {attempts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Your Recent Results</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attempts.slice(0, 6).map(attempt => {
              const colors = attempt.accuracy != null
                ? attempt.accuracy >= 60 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : attempt.accuracy >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-gray-400 bg-gray-500/10 border-gray-500/20'
              return (
                <div key={attempt.id}
                  className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4 cursor-pointer hover:border-indigo-500/30 transition-colors"
                  onClick={() => navigate(`/assessment-results/${attempt.id}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{attempt.assessment?.title || 'Assessment'}</span>
                    <Badge variant="outline" className="text-xs border-[#334155] text-gray-400">
                      {new Date(attempt.startedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={cn("text-2xl font-bold", attempt.accuracy != null && attempt.accuracy >= 60 ? 'text-emerald-400' : 'text-amber-400')}>
                      {attempt.accuracy != null ? `${attempt.accuracy}%` : '--'}
                    </span>
                    <span className="text-xs text-gray-500">Accuracy</span>
                    <span className={cn("ml-auto text-xs font-medium px-2 py-1 rounded-full", colors)}>
                      {attempt.score}/{attempt.totalMarks}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment, i) => {
          const Icon = assessmentIcons[assessment.type] || HelpCircle
          const colors = assessmentColors[assessment.type] || assessmentColors.APTITUDE
          const bestAttempt = getBestAttempt(assessment.id)
          return (
            <motion.div key={assessment.id} initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className={cn("rounded-2xl bg-gradient-to-br border p-6 backdrop-blur-xl hover:shadow-lg transition-all duration-300 h-full flex flex-col",
                colors.bg, colors.border)}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", colors.icon)}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-white text-lg">{assessment.title}</h3>
                <p className="text-sm text-gray-400 mt-2 flex-1">{assessment.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="border-[#334155] text-gray-400 bg-[#1E293B]/50">
                    <Clock className="w-3 h-3 mr-1" /> {assessment.duration} min
                  </Badge>
                  <Badge variant="outline" className="border-[#334155] text-gray-400 bg-[#1E293B]/50">
                    <HelpCircle className="w-3 h-3 mr-1" /> {assessment._count?.questions || assessment.totalQuestions} Q
                  </Badge>
                  <Badge variant="outline" className="border-[#334155] text-gray-400 bg-[#1E293B]/50">
                    <Award className="w-3 h-3 mr-1" /> {assessment.passingMarks} pass
                  </Badge>
                  {(() => {
                    const mockData = MOCK_ASSESSMENTS.find(m => m.id === assessment.id)
                    if (mockData) {
                      return (
                        <Badge variant="outline" className="border-cyan-500/20 text-cyan-400 bg-cyan-500/5">
                          <Database className="w-3 h-3 mr-1" /> {mockData.questions.length} pool
                        </Badge>
                      )
                    }
                    return null
                  })()}
                </div>
                {(() => {
                  const mockData = MOCK_ASSESSMENTS.find(m => m.id === assessment.id)
                  if (mockData?.companies && mockData.companies.length > 0) {
                    return (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {mockData.companies.slice(0, 5).map((c: string) => (
                          <Badge key={c} variant="outline" className="text-[10px] border-[#334155]/50 text-gray-500 bg-[#1E293B]/30">
                            {c}
                          </Badge>
                        ))}
                        {mockData.companies.length > 5 && (
                          <Badge variant="outline" className="text-[10px] border-[#334155]/50 text-gray-500 bg-[#1E293B]/30">
                            +{mockData.companies.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )
                  }
                  return null
                })()}
                {bestAttempt && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-gray-400">Best: </span>
                    <span className="font-medium text-emerald-400">{bestAttempt.accuracy}%</span>
                    <span className="text-gray-500">| {bestAttempt.score}/{bestAttempt.totalMarks}</span>
                  </div>
                )}
                <Button
                  className={cn("w-full mt-4 bg-gradient-to-r text-white border-0 shadow-lg", colors.gradient)}
                  onClick={() => navigate(`/assessment/${assessment.id}`)}
                >
                  {bestAttempt ? 'Retake Assessment' : 'Start Assessment'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
