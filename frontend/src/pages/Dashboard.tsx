import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target, TrendingUp, Mic, FileText, Map, Code2, ArrowRight,
  Sparkles, CheckCircle, Clock, BarChart3, Flame, ChevronUp,
  ChevronDown, Lightbulb, Rocket, Award, AlertTriangle, XCircle, Check,
  Play, Upload, ExternalLink, Loader2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getPlacementScoreApi, getGapAnalysisResultApi } from '@/services/api'
import { mockStudents, mockGapAnalysisResult } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/hooks/useDashboard'

function CircularGauge({ value, size = 180 }: { value: number; size?: number }) {
  const [animated, setAnimated] = useState(0)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference
  useEffect(() => { const t = setTimeout(() => setAnimated(Math.min(value, 100)), 300); return () => clearTimeout(t) }, [value])
  const color = value > 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#F43F5E'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          filter="url(#glow)" />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight" style={{ color }}>{Math.round(animated)}</span>
        <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function SubScoreRow({ label, value, trend }: { label: string; value: number; trend?: 'up' | 'down' | 'stable' }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => { const t = setTimeout(() => setAnimated(Math.min(value, 100)), 500); return () => clearTimeout(t) }, [value])
  const barColor = value > 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = value > 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-rose-400'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm items-center">
        <span className="text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('font-semibold', textColor)}>{Math.round(value)}</span>
          {trend === 'up' && <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'down' && <ChevronDown className="w-3.5 h-3.5 text-rose-400" />}
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[#1E293B] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-1000 ease-out', barColor)}
          style={{ width: `${animated}%`, boxShadow: value > 70 ? '0 0 8px rgba(16,185,129,0.3)' : 'none' }} />
      </div>
    </div>
  )
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-[#1E293B]/50', className)} />
}

function SkeletonCard({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl", className)}>
      {children}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2"><Skeleton className="h-64 w-full" /></SkeletonCard>
        <SkeletonCard><Skeleton className="h-64 w-full" /></SkeletonCard>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonCard key={i}><Skeleton className="h-28 w-full" /></SkeletonCard>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2"><Skeleton className="h-48 w-full" /></SkeletonCard>
        <SkeletonCard><Skeleton className="h-48 w-full" /></SkeletonCard>
      </div>
    </div>
  )
}

function DashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <AlertCircle className="w-12 h-12 text-rose-400" />
      <p className="text-gray-400 text-lg">{message}</p>
      <Button onClick={onRetry} variant="outline" className="border-[#334155] text-gray-300">
        <Loader2 className="w-4 h-4 mr-2" /> Retry
      </Button>
    </div>
  )
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: { label: string; path: string } }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Award className="w-10 h-10 text-gray-600 mb-3" />
      <h3 className="text-gray-300 font-medium mb-1">{title}</h3>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      {action && (
        <Button variant="outline" size="sm" className="border-[#334155] text-gray-300" onClick={() => navigate(action.path)}>
          {action.label} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [placementScore, setPlacementScore] = useState(student.placementScore)
  const [companyChances, setCompanyChances] = useState(student.companyChances)
  const [streak, setStreak] = useState(student.streak)
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState(0)

  useEffect(() => {
    async function fetchData() {
      if (!user) { setLoading(false); return }
      const result = await getPlacementScoreApi(user.id)
      if (result.data) {
        setPlacementScore({
          overall: result.data.overall,
          aptitude: result.data.aptitude,
          dsa: result.data.dsa,
          coreSubjects: result.data.coreSubjects,
          communication: result.data.communication,
          resume: result.data.resumeScore,
        })
        setCompanyChances(
          result.data.companyChances.map(c => ({
            company: c.companyName,
            chance: c.chancePercent,
          }))
        )
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const todayTasks = [
    { label: 'Solve 3 Array Problems', done: false },
    { label: 'Attend Mock Interview', done: false },
    { label: 'Update Resume', done: false },
    { label: 'Complete Aptitude Quiz', done: false },
  ]

  const readinessLabel = placementScore
    ? placementScore.overall >= 80 ? 'Excellent'
      : placementScore.overall >= 60 ? 'Good – Needs Focus'
      : 'Needs Improvement'
    : 'Not Calculated'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{greeting}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-gray-400 mt-1">
            {user.college && `${user.college}`}{user.branch && ` • ${user.branch}`}
            {user.graduationYear && ` • Class of ${user.graduationYear}`}
          </p>
        </div>
        <Badge className="gap-2 px-4 py-2 text-sm bg-[#1E293B] border-[#334155] text-gray-300">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="font-semibold">{streak.current} day streak</span>
        </Badge>
      </motion.div>

      {/* Row 1: Readiness + Chances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Placement Readiness Score */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl neon-glow">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Placement Readiness Score</h2>
              {placementScore && (
                <span className={cn(
                  'ml-auto text-xs font-medium px-3 py-1 rounded-full',
                  placementScore.overall > 70 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  placementScore.overall >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                )}>
                  {readinessLabel}
                </span>
              )}
            </div>
            {placementScore ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center py-4">
                  <CircularGauge value={placementScore.overall} />
                </div>
                <div className="space-y-3.5">
                  {([
                    ['Communication', placementScore.communication, 'up'],
                    ['DSA', placementScore.dsa, 'down'],
                    ['Core Subjects', placementScore.coreSubjects, 'up'],
                    ['Resume', placementScore.resumeScore, 'stable'],
                    ['Aptitude', placementScore.aptitude, 'up'],
                  ] as const).map(([label, value, trend], i) => (
                    <motion.div key={label} initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}>
                      <SubScoreRow label={label} value={value} trend={trend} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No score calculated yet"
                description="Complete assessments to get your placement readiness score."
                action={{ label: 'Take Assessment', path: '/placement-twin' }}
              />
            )}
          </div>
        </motion.div>

        {/* Section 2: Placement Chances */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl h-full">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Placement Chances</h2>
            </div>
            {companyChances.length > 0 ? (
              <div className="space-y-4">
                {companyChances.map((c, i) => {
                  const color = c.chancePercent > 70 ? 'text-emerald-400' : c.chancePercent >= 40 ? 'text-amber-400' : 'text-rose-400'
                  const barColor = c.chancePercent > 70 ? 'bg-emerald-500' : c.chancePercent >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  const glow = c.chancePercent > 70 ? '0 0 6px rgba(16,185,129,0.2)' : 'none'
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm items-center">
                          <span className="font-medium text-gray-300">{c.companyName}</span>
                          <span className={cn('font-semibold', color)}>{Math.round(c.chancePercent)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#1E293B] overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
                            style={{ width: `${c.chancePercent}%`, boxShadow: glow }} />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title="No company chances yet"
                description="Calculate your placement score to see chances."
              />
            )}
            <Button
              variant="outline"
              className="w-full mt-5 border-[#334155] text-gray-300 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/30"
              onClick={() => navigate('/placement-twin')}
            >
              View Detailed Analysis <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Section 3: Quick Action Modules */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Mic, title: 'Voice Mock Interview', desc: 'Practice HR and Technical Interviews', color: 'from-indigo-500/20 to-purple-500/10', border: 'border-indigo-500/20', iconBg: 'bg-indigo-500/20 text-indigo-400', path: '/mock-interview', btn: 'Start Interview' },
            { icon: FileText, title: 'Resume Analyzer', desc: 'Analyze ATS score and resume quality', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/20 text-emerald-400', path: '/resume', btn: 'Upload Resume' },
            { icon: Map, title: 'Dynamic Roadmap', desc: 'AI-generated personalized learning plan', color: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20', iconBg: 'bg-amber-500/20 text-amber-400', path: '/roadmap', btn: 'View Roadmap' },
            { icon: Code2, title: 'Coding Interview', desc: 'Practice coding interviews with AI', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/20', iconBg: 'bg-cyan-500/20 text-cyan-400', path: '/coding-interview', btn: 'Start Coding Round' },
          ].map((action, i) => (
            <motion.div key={action.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }}>
              <div className={cn("rounded-2xl bg-gradient-to-br border p-5 backdrop-blur-xl hover:shadow-lg transition-all duration-300 group cursor-pointer",
                action.color, action.border)}
                onClick={() => navigate(action.path)}>
                <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", action.iconBg)}>
                  <action.icon className="w-5.5 h-5.5" />
                </div>
                <h3 className="font-semibold text-sm text-white">{action.title}</h3>
                <p className="text-xs text-gray-400 mt-1.5 mb-4">{action.desc}</p>
                <div className="flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors">
                  {action.btn} <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Row 2: Gap Analysis + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 4: AI Gap Analysis */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">AI Gap Analysis</h2>
            </div>
            {gapAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" /> Strengths
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.strengths.slice(0, 4).map(s => (
                      <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-sm text-gray-300">{s}</span>
                      </div>
                    ))}
                    {gapAnalysis.strengths.length === 0 && (
                      <p className="text-sm text-gray-500">No strengths identified yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Weak Areas
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.weakAreas.slice(0, 3).map(s => (
                      <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-sm text-gray-300">{s}</span>
                      </div>
                    ))}
                    {gapAnalysis.weakAreas.length === 0 && (
                      <p className="text-sm text-gray-500">No weak areas identified</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" /> Missing Skills
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.missingSkills.slice(0, 3).map(s => (
                      <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/5 border border-rose-500/10">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-sm text-gray-300">{s}</span>
                      </div>
                    ))}
                    {gapAnalysis.missingSkills.length === 0 && (
                      <p className="text-sm text-gray-500">No missing skills</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No gap analysis yet"
                description="Run a gap analysis to discover strengths and areas for improvement."
                action={{ label: 'Run Analysis', path: '/gap-analysis' }}
              />
            )}
            <Button className="mt-5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
              onClick={() => navigate('/gap-analysis')}>
              Generate Improvement Plan <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Section 5: Progress Tracking */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl h-full">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Progress</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Problems Solved', value: String(progress.problemsSolved), icon: Code2, color: 'text-cyan-400 bg-cyan-500/10' },
                { label: 'Mock Interviews', value: String(progress.mockInterviews), icon: Mic, color: 'text-violet-400 bg-violet-500/10' },
                { label: 'Roadmap Completion', value: `${Math.round(progress.roadmapCompletion)}%`, icon: Map, color: 'text-emerald-400 bg-emerald-500/10' },
                { label: 'Resume Score', value: progress.resumeScore !== null ? `${Math.round(progress.resumeScore)}%` : '--', icon: FileText, color: 'text-amber-400 bg-amber-500/10' },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                  className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4 text-center">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2", m.color)}>
                    <m.icon className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Weekly Activity</span>
                <span className={cn(
                  'font-medium',
                  progress.weeklyGrowth > 0 ? 'text-emerald-400' : progress.weeklyGrowth < 0 ? 'text-rose-400' : 'text-gray-400'
                )}>
                  {progress.weeklyGrowth > 0 ? '+' : ''}{progress.weeklyGrowth}%
                </span>
              </div>
              <div className="flex items-end gap-1 h-16">
                {progress.weeklyActivity.map((h, i) => {
                  const maxVal = Math.max(...progress.weeklyActivity, 1)
                  const height = Math.max(4, (h / maxVal) * 100)
                  return (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo-500/40 to-indigo-400/20"
                      style={{ height: `${height}%`, transition: 'height 0.5s ease' }} />
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Row 3: Insights + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 6: AI Career Insights */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">AI Career Insights</h2>
              <Button variant="ghost" size="sm" className="ml-auto text-xs text-gray-400 hover:text-white"
                onClick={() => setInsights(i => i + 1)}>
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Regenerate
              </Button>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => (
                <motion.div key={`${insights}-${i}`} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                  <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">{insight}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section 7: Today's Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl h-full">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Today's Tasks</h2>
            </div>
            <div className="space-y-3">
              {todayTasks.map((task, i) => (
                <motion.div key={task.label} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 hover:border-indigo-500/20 transition-colors cursor-pointer">
                  <div className="w-5 h-5 rounded-md border-2 border-gray-600 flex items-center justify-center">
                    {task.done && <Check className="w-3 h-3 text-indigo-400" />}
                  </div>
                  <span className={cn("text-sm", task.done ? "text-gray-600 line-through" : "text-gray-300")}>{task.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <p className="text-xs text-gray-400">Progress</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${(todayTasks.filter(t => t.done).length / Math.max(todayTasks.length, 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {todayTasks.filter(t => t.done).length}/{todayTasks.length}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section 8: Placement Twin */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-[#0F172A]/80 border border-indigo-500/20 p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Digital Placement Twin</h2>
            <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">Simulation</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Current Readiness</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-amber-400">{placementScore ? Math.round(placementScore.overall) : 0}</span>
                <span className="text-2xl text-gray-500">%</span>
              </div>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                {gapAnalysis?.weakAreas?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-gray-400">{tag}</span>
                ))}
                {(!gapAnalysis?.weakAreas?.length) && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-gray-400">No data</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 w-24 rounded-full bg-[#1E293B] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 animate-pulse" style={{ width: '100%' }} />
                </div>
                <motion.div
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-indigo-400" />
                </motion.div>
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <span className="text-sm text-gray-500">{placementScore ? Math.round(placementScore.overall) : 0}%</span>
                <span className="text-sm text-gray-500">→</span>
                <span className="text-sm font-bold text-emerald-400">
                  {placementScore ? Math.min(100, Math.round(placementScore.overall * 1.2)) : 0}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Predicted Readiness</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-emerald-400">
                  {placementScore ? Math.min(100, Math.round(placementScore.overall * 1.2)) : 0}
                </span>
                <span className="text-2xl text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">After completing recommended modules</p>
            </div>
          </div>
          <Button
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
            onClick={() => navigate('/placement-twin')}
          >
            <Play className="w-4 h-4 mr-2" /> Start Simulation
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
