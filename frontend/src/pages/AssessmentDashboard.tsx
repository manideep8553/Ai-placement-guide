import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Award, Brain, Code2, Server, Building2,
  LayoutDashboard, ArrowRight, Target, Lightbulb, CheckCircle,
  AlertTriangle, History, BookOpen, Flame, Zap, Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getAllAttempts, calculateAnalytics, type AssessmentResult
} from '@/lib/assessmentEngine'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  APTITUDE: { icon: Brain, label: 'Aptitude', color: '#6366F1' },
  DSA: { icon: Code2, label: 'DSA', color: '#10B981' },
  CORE_CS: { icon: Server, label: 'Core CS', color: '#06B6D4' },
  COMPANY_SPECIFIC: { icon: Building2, label: 'Company Specific', color: '#F59E0B' },
  FULL_PLACEMENT: { icon: LayoutDashboard, label: 'Full Placement', color: '#F43F5E' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1E293B] border border-[#334155]/50 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-400">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'Accuracy' ? '%' : ''}</p>
        ))}
      </div>
    )
  }
  return null
}

function AttemptRow({ attempt, index }: { attempt: AssessmentResult; index: number }) {
  const navigate = useNavigate()
  const config = TYPE_CONFIG[attempt.assessmentType] || { icon: BookOpen, label: 'Unknown', color: '#6B7280' }
  const Icon = config.icon
  const accColor = attempt.accuracy >= 70 ? 'text-emerald-400' : attempt.accuracy >= 40 ? 'text-amber-400' : 'text-rose-400'

  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="flex flex-wrap items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 hover:border-indigo-500/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/assessment-results/${attempt.attemptId}`)}>
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.color}15` }}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{attempt.assessmentTitle}</p>
        <p className="text-xs text-gray-500">{new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <div className="text-center px-2 sm:px-3">
        <p className={cn('text-base sm:text-lg font-bold', accColor)}>{attempt.accuracy}%</p>
        <p className="text-xs text-gray-500">{attempt.score}/{attempt.totalMarks}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
    </motion.div>
  )
}

export default function AssessmentDashboard() {
  const navigate = useNavigate()

  const allAttempts = useMemo(() => getAllAttempts(), [])

  const analytics = useMemo(() => calculateAnalytics(), [allAttempts])

  const typeStats = useMemo(() => {
    const stats: Record<string, { count: number; totalScore: number; totalMarks: number; accuracySum: number }> = {}
    for (const a of allAttempts) {
      if (!stats[a.assessmentType]) stats[a.assessmentType] = { count: 0, totalScore: 0, totalMarks: 0, accuracySum: 0 }
      stats[a.assessmentType].count++
      stats[a.assessmentType].totalScore += a.score
      stats[a.assessmentType].totalMarks += a.totalMarks
      stats[a.assessmentType].accuracySum += a.accuracy
    }
    return Object.entries(stats)
      .map(([type, s]) => {
        const config = TYPE_CONFIG[type] || { icon: BookOpen, label: type, color: '#6B7280' }
        return {
          type,
          label: config.label,
          color: config.color,
          count: s.count,
          avgAccuracy: s.count > 0 ? Math.round(s.accuracySum / s.count) : 0,
          avgScore: s.count > 0 ? Math.round(s.totalScore / s.count) : 0,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [allAttempts])

  const typeChartData = typeStats.map(t => ({ name: t.label, Accuracy: t.avgAccuracy, 'Attempts': t.count }))

  const trendData = useMemo(() => {
    return allAttempts.slice(-10).map((a, i) => ({
      name: `#${i + 1}`,
      Accuracy: a.accuracy,
      date: new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  }, [allAttempts])

  const improvementPlan = analytics.improvementPlan

  const renderContent = () => {
    if (allAttempts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <BarChart3 className="w-16 h-16 text-gray-600" />
          <p className="text-gray-400 text-lg">No assessment attempts yet</p>
          <p className="text-sm text-gray-500">Complete an assessment to see your analytics here.</p>
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
            onClick={() => navigate('/assessments')}>
            Start an Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )
    }

    const accuracyColor = analytics.averageAccuracy >= 70 ? 'text-emerald-400' : analytics.averageAccuracy >= 40 ? 'text-amber-400' : 'text-rose-400'

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-gray-500">Readiness</span>
            </div>
            <p className={cn('text-2xl sm:text-3xl font-bold', analytics.readinessScore >= 60 ? 'text-emerald-400' : 'text-amber-400')}>
              {analytics.readinessScore}
            </p>
            <p className="text-xs text-gray-500 mt-1">Score</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-gray-500">Avg Accuracy</span>
            </div>
            <p className={cn('text-2xl sm:text-3xl font-bold', accuracyColor)}>
              {analytics.averageAccuracy}%
            </p>
            <div className="flex items-center gap-1 mt-1">
              {analytics.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
              {analytics.trend === 'down' && <TrendingUp className="w-3 h-3 text-rose-400 rotate-180" />}
              <span className={cn('text-xs', analytics.trend === 'up' ? 'text-emerald-400' : analytics.trend === 'down' ? 'text-rose-400' : 'text-gray-500')}>
                {analytics.trend === 'up' ? 'Improving' : analytics.trend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-500">Percentile</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-indigo-400">{analytics.percentile}th</p>
            <p className="text-xs text-gray-500 mt-1">Ranking</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-500">Attempts</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white">{analytics.totalAttempts}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalCorrect}/{analytics.totalQuestionsAnswered} correct
            </p>
          </motion.div>
        </div>

        {/* Streak & Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-500">Current Streak</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-orange-400">{analytics.streakDays || 0}</p>
            <p className="text-xs text-gray-500 mt-1">consecutive days</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-gray-500">Best Score</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-400">{analytics.bestAccuracy}%</p>
            <p className="text-xs text-gray-500 mt-1">all-time best accuracy</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-gray-500">Top Type</span>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white truncate">{typeStats[0]?.label || 'None'}</p>
            <p className="text-xs text-gray-500 mt-1">{typeStats[0]?.avgAccuracy || 0}% avg accuracy</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend */}
          {trendData.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Performance Trend
              </h3>
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Accuracy" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', r: 3 }}
                      activeDot={{ r: 5, fill: '#818CF8' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Type Breakdown */}
          {typeChartData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Type Performance
              </h3>
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Accuracy" radius={[4, 4, 0, 0]}>
                      {typeChartData.map((_, i) => (
                        <Cell key={i} fill={typeStats[i]?.color || '#6366F1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Skill Radar & Company Readiness */}
        {allAttempts.length > 0 && (() => {
          const radarData = typeStats.map(t => ({ subject: t.label, score: t.avgAccuracy, fullMark: 100 }))
          const companyStats: Record<string, { correct: number; total: number }> = {}
          allAttempts.forEach(a => {
            const answers = (a as any).answers || []
            answers.forEach((ans: any) => {
              const companies = ans.companyTags || []
              companies.forEach((c: string) => {
                if (!companyStats[c]) companyStats[c] = { correct: 0, total: 0 }
                companyStats[c].total++
                if (ans.isCorrect) companyStats[c].correct++
              })
            })
          })
          const companyList = Object.entries(companyStats)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, 8)
            .map(([name, data]) => ({
              name,
              readiness: Math.round((data.correct / data.total) * 100),
              questions: data.total
            }))

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Radar */}
              {radarData.length >= 3 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" /> Skill Radar
                  </h3>
                  <div className="h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                        <Radar name="Accuracy" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Company Readiness */}
              {companyList.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" /> Company Readiness
                  </h3>
                  <div className="space-y-3">
                    {companyList.map(c => (
                      <div key={c.name} className="flex items-center gap-3">
                        <span className="text-sm text-gray-300 w-24 shrink-0 truncate">{c.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#0F172A] overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-1000',
                            c.readiness >= 70 ? 'bg-emerald-500' : c.readiness >= 40 ? 'bg-amber-500' : 'bg-rose-500')}
                            style={{ width: `${c.readiness}%` }} />
                        </div>
                        <span className={cn('text-xs font-medium w-10 text-right',
                          c.readiness >= 70 ? 'text-emerald-400' : c.readiness >= 40 ? 'text-amber-400' : 'text-rose-400')}>
                          {c.readiness}%
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )
        })()}

        {/* Recommended Next Assessment */}
        {allAttempts.length > 0 && (() => {
          const weakest = typeStats.sort((a, b) => a.avgAccuracy - b.avgAccuracy)[0]
          if (!weakest || weakest.avgAccuracy >= 70) return null
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
              className="rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" /> Recommended Next
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Your weakest area is <span className="text-white font-medium">{weakest.label}</span> ({weakest.avgAccuracy}%). Focus on this to improve overall readiness.
                  </p>
                </div>
                <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white border-0 shrink-0"
                  onClick={() => navigate(`/assessment/${weakest.type.toLowerCase()}-assessment`)}>
                  Practice Now <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          )
        })()}

        {/* Strengths & Weaknesses + Improvement Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Strengths
            </h3>
            {analytics.strengthAreas.length > 0 ? (
              <div className="space-y-2">
                {analytics.strengthAreas.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Complete more assessments to identify strengths.</p>
            )}
          </motion.div>

          {/* Weaknesses */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Areas to Improve
            </h3>
            {analytics.weakAreas.length > 0 ? (
              <div className="space-y-2">
                {analytics.weakAreas.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Great job! No major weak areas detected.</p>
            )}
          </motion.div>

          {/* Improvement Plan */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Improvement Plan
            </h3>
            {improvementPlan.length > 0 ? (
              <div className="space-y-3">
                {improvementPlan.map((plan, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mt-2 shrink-0',
                      plan.priority === 'high' ? 'bg-rose-400' : 'bg-amber-400'
                    )} />
                    <div>
                      <p className="text-sm text-gray-300">{plan.topic}</p>
                      <p className="text-xs text-gray-500">{plan.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Take assessments to get personalized improvement suggestions.</p>
            )}
          </motion.div>
        </div>

        {/* Section Breakdown */}
        {analytics.sectionBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> All Sections Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.sectionBreakdown.map(s => {
                const barColor = s.averageScore >= 70 ? 'bg-emerald-500' : s.averageScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                return (
                  <div key={s.section} className="p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 truncate mr-2">{s.section}</span>
                      <span className={cn('font-semibold shrink-0 text-xs', s.averageScore >= 70 ? 'text-emerald-400' : s.averageScore >= 40 ? 'text-amber-400' : 'text-rose-400')}>
                        {s.averageScore}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#0F172A] overflow-hidden">
                      <div className={cn('h-full rounded-full', barColor)} style={{ width: `${s.averageScore}%` }} />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{s.attemptCount} attempt{s.attemptCount > 1 ? 's' : ''}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Attempts */}
        {allAttempts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" /> All Attempts
              </h3>
              <span className="text-xs text-gray-500">{allAttempts.length} total</span>
            </div>
            <div className="space-y-2">
              {allAttempts.slice().reverse().map((attempt, i) => (
                <AttemptRow key={attempt.attemptId} attempt={attempt} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex flex-wrap gap-3 sm:gap-4 pb-8">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
            onClick={() => navigate('/assessments')}>
            <Brain className="w-4 h-4 mr-2" /> Take Assessment
          </Button>
          <Button variant="outline" className="border-[#334155] text-gray-300"
            onClick={() => navigate('/gap-analysis')}>
            <Target className="w-4 h-4 mr-2" /> Gap Analysis
          </Button>
          <Button variant="outline" className="border-[#334155] text-gray-300"
            onClick={() => navigate('/placement-twin')}>
            Placement Twin
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Assessment Analytics</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Track your assessment performance, identify strengths and weaknesses, and get personalized improvement plans.
        </p>
      </motion.div>
      {renderContent()}
    </div>
  )
}
