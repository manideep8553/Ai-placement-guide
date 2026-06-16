import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Code2, FileText, Mic, Target, TrendingUp, Rocket,
  Lightbulb, ChevronUp, ChevronDown, Zap, Award, CheckCircle, ArrowRight,
  Server, MessageSquare, Clock, AlertCircle, Loader2, HelpCircle, BarChart3,
  Star
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPlacementTwinApi, type PlacementTwinResponse } from '@/services/api'
import {
  mockSimulationScenarios,
  applyScenarioProfile,
  getProjectedCompanyEligibility,
  type PlacementTwinData,
  type SimulationScenario,
} from '@/lib/placementTwinEngine'

function CircularGauge({ value, size = 140 }: { value: number; size?: number }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value > 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#F43F5E'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 drop-shadow-lg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          filter="url(#glowTwin)" />
        <defs>
          <filter id="glowTwin">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</span>
        <span className="text-[10px] text-gray-500">/100</span>
      </div>
    </div>
  )
}

function ScoreCard({ label, value, icon: Icon, color, trend, details }: {
  label: string; value: number; icon: React.ElementType; color: string;
  trend?: 'up' | 'down'; details?: { label: string; value: number; max: number }[]
}) {
  const barColor = value > 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = value > 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-rose-400'
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm text-gray-400">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn('text-lg font-bold', textColor)}>{value}</span>
          {trend === 'up' && <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'down' && <ChevronDown className="w-3.5 h-3.5 text-rose-400" />}
        </div>
      </div>
      <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${value}%` }} />
      </div>
      {details && details.length > 0 && (
        <>
          <button className="text-xs text-gray-500 hover:text-gray-300 mt-1" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <div className="space-y-1.5 pt-1">
              {details.map((d, i) => {
                const pct = d.max > 0 ? Math.round((d.value / d.max) * 100) : 0
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{d.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-[#0F172A] overflow-hidden">
                        <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-emerald-500/60' : pct >= 40 ? 'bg-amber-500/60' : 'bg-rose-500/60')}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 w-16 text-right">{d.value}/{d.max}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ProbabilityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm items-center">
        <span className="text-gray-400">{label}</span>
        <span className={cn('font-semibold', color)}>{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#0F172A] overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color.replace('text-', 'bg-'))}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function DummyCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl", className)}>
      {children}
    </div>
  )
}

function Skeleton() {
  return <div className="animate-pulse rounded-md bg-[#1E293B]/50" />
}

function SkeletonCard() {
  return <DummyCard><Skeleton className="h-24 w-full" /></DummyCard>
}

export default function PlacementTwin() {
  const [apiData, setApiData] = useState<PlacementTwinData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<PlacementTwinData | null>(null)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await getPlacementTwinApi()
        if (res.error) { setError(res.error); return }
        const data = res.data!
        const twinData: PlacementTwinData = {
          readinessScore: data.readinessScore,
          subScores: data.subScores,
          companyEligibility: data.companyEligibility,
          predictedPackage: data.predictedPackage,
          interviewReadiness: data.interviewReadiness,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          missingSkills: data.missingSkills,
          recommendations: data.recommendations,
          improvementRoadmap: data.improvementRoadmap,
          lastUpdated: data.lastUpdated,
        }
        setApiData(twinData)
        setProfile(twinData)
      } catch {
        setError('Failed to load placement twin')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleApplyScenario = (scenario: SimulationScenario) => {
    if (!profile) return
    const updated = applyScenarioProfile(profile, scenario)
    setProfile(updated)
    setAppliedScenarios(prev => prev.includes(scenario.id) ? prev : [...prev, scenario.id])
    setActiveScenario(scenario.id)
  }

  const handleReset = () => {
    if (!apiData) return
    setProfile({ ...apiData })
    setAppliedScenarios([])
    setActiveScenario(null)
  }

  const projectedCompanies = useMemo(() => {
    if (!profile || !activeScenario) return null
    const scenario = mockSimulationScenarios.find(s => s.id === activeScenario)
    if (!scenario) return null
    return getProjectedCompanyEligibility(profile, scenario)
  }, [profile, activeScenario])

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        <div className="animate-pulse"><div className="h-8 w-64 bg-[#1E293B]/50 rounded" /><div className="h-4 w-48 bg-[#1E293B]/50 rounded mt-2" /></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonCard /></div>
          <SkeletonCard />
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Brain className="w-12 h-12 text-gray-600" />
        <p className="text-gray-400 text-lg">No placement data available</p>
        <p className="text-sm text-gray-500">Complete assessments and interviews to generate your twin profile.</p>
      </div>
    )
  }

  const serviceCompanies = profile.companyEligibility.filter(c => c.category === 'Service')
  const productCompanies = profile.companyEligibility.filter(c => c.category === 'Product')

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Placement Twin</h1>
              <p className="text-sm text-gray-400">AI-powered readiness prediction & scenario simulation</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
              <Zap className="w-3 h-3 mr-1" /> Live Data
            </Badge>
            {appliedScenarios.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleReset}
                className="border-[#334155] text-gray-300 hover:text-white">
                Reset
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Row 1: Readiness + Package + Eligibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Card */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Placement Profile</h2>
              <Badge className={cn(
                'ml-auto text-xs px-3 py-1',
                profile.interviewReadiness.score >= 65 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                profile.interviewReadiness.score >= 40 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              )}>
                {profile.interviewReadiness.level}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center">
                <CircularGauge value={profile.readinessScore} />
                <p className="text-sm text-gray-400 mt-3">Readiness Score</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-[#334155] text-xs text-gray-400">
                    <Clock className="w-3 h-3 mr-1" /> Updated {new Date(profile.lastUpdated).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <ScoreCard label="DSA Score" value={profile.subScores.dsa.score} icon={Code2}
                  color="bg-emerald-500/20 text-emerald-400" trend={profile.subScores.dsa.score >= 70 ? 'up' : 'down'}
                  details={profile.subScores.dsa.details} />
                <ScoreCard label="Resume Score" value={profile.subScores.resume.score} icon={FileText}
                  color="bg-blue-500/20 text-blue-400" trend={profile.subScores.resume.score >= 70 ? 'up' : 'down'}
                  details={profile.subScores.resume.details} />
                <ScoreCard label="Interview Score" value={profile.subScores.interview.score} icon={Mic}
                  color="bg-amber-500/20 text-amber-400" details={profile.subScores.interview.details} />
                <ScoreCard label="Aptitude Score" value={profile.subScores.aptitude.score} icon={Target}
                  color="bg-cyan-500/20 text-cyan-400" details={profile.subScores.aptitude.details} />
                <ScoreCard label="Projects Score" value={profile.subScores.projects.score} icon={Rocket}
                  color="bg-violet-500/20 text-violet-400" details={profile.subScores.projects.details} />
                <ScoreCard label="Communication Score" value={profile.subScores.communication.score} icon={MessageSquare}
                  color="bg-rose-500/20 text-rose-400" details={profile.subScores.communication.details} />
                <ScoreCard label="Consistency Score" value={profile.subScores.consistency.score} icon={Clock}
                  color="bg-indigo-500/20 text-indigo-400" details={profile.subScores.consistency.details} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Package & Readiness */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Predicted Package</h2>
            </div>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <span className="text-5xl font-bold text-emerald-400">
                  {profile.predictedPackage.currency}{profile.predictedPackage.min} - {profile.predictedPackage.currency}{profile.predictedPackage.max}
                </span>
                <p className="text-sm text-gray-500 mt-2">Estimated Annual Package (LPA)</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Interview Readiness</span>
                  <span className={cn('font-semibold', profile.interviewReadiness.score >= 65 ? 'text-emerald-400' : 'text-amber-400')}>
                    {profile.interviewReadiness.level}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden">
                  <div className={cn('h-full rounded-full', profile.interviewReadiness.score >= 65 ? 'bg-emerald-500' : 'bg-amber-500')}
                    style={{ width: `${profile.interviewReadiness.score}%` }} />
                </div>
              </div>
            </div>

            {projectedCompanies && activeScenario && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-[#334155]/50">
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Projected Impact</span>
                </div>
                {projectedCompanies.slice(0, 4).map(c => {
                  const orig = profile.companyEligibility.find(o => o.companyName === c.companyName)
                  const diff = orig ? c.chancePercent - orig.chancePercent : 0
                  return (
                    <div key={c.companyName} className="flex items-center justify-between text-xs py-1.5">
                      <span className="text-gray-400 truncate max-w-[120px]">{c.companyName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">{orig?.chancePercent ?? 0}%</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="font-medium text-white">{c.chancePercent}%</span>
                        {diff > 0 && <span className="text-emerald-400">+{diff}%</span>}
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Company Eligibility */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Company Eligibility</h2>
            <Badge className="ml-auto bg-[#1E293B] text-gray-400 border-[#334155] text-xs">
              {serviceCompanies.length + productCompanies.length} companies
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Service Companies</h3>
              <div className="space-y-3">
                {serviceCompanies.map((c, i) => {
                  const color = c.chancePercent > 70 ? 'text-emerald-400' : c.chancePercent >= 40 ? 'text-amber-400' : 'text-rose-400'
                  return (
                    <motion.div key={c.companyName} initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-white">{c.companyName}</span>
                            <Badge variant="outline" className="text-[10px] border-[#334155] text-gray-500">{c.avgPackage}</Badge>
                          </div>
                          <span className={cn('font-bold', color)}>{c.chancePercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden mb-1.5">
                          <div className={cn('h-full rounded-full', color.replace('text-', 'bg-'))} style={{ width: `${c.chancePercent}%` }} />
                        </div>
                        {c.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.missingSkills.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Product Companies</h3>
              <div className="space-y-3">
                {productCompanies.map((c, i) => {
                  const color = c.chancePercent > 70 ? 'text-emerald-400' : c.chancePercent >= 40 ? 'text-amber-400' : 'text-rose-400'
                  return (
                    <motion.div key={c.companyName} initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="p-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-white">{c.companyName}</span>
                            <Badge variant="outline" className="text-[10px] border-[#334155] text-gray-500">{c.avgPackage}</Badge>
                          </div>
                          <span className={cn('font-bold', color)}>{c.chancePercent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden mb-1.5">
                          <div className={cn('h-full rounded-full', color.replace('text-', 'bg-'))} style={{ width: `${c.chancePercent}%` }} />
                        </div>
                        {c.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.missingSkills.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scenario Simulation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Scenario Simulation</h2>
            <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">Apply to see impact</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockSimulationScenarios.map((scenario, i) => {
              const isApplied = appliedScenarios.includes(scenario.id)
              const iconMap: Record<string, React.ElementType> = {
                Code2, Brain, FileText, Server, Mic, Rocket, MessageSquare, Target
              }
              const ScenarioIcon = iconMap[scenario.icon] || Target

              return (
                <motion.div key={scenario.id} initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    isApplied ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#1E293B]/50 border-[#334155]/50 hover:border-indigo-500/30'
                  )}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                      isApplied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400')}>
                      <ScenarioIcon className="w-4.5 h-4.5" />
                    </div>
                    {isApplied && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        <CheckCircle className="w-2.5 h-2.5 mr-1" /> Applied
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">{scenario.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{scenario.description}</p>
                  <Button size="sm" variant={isApplied ? 'outline' : 'default'}
                    onClick={() => handleApplyScenario(scenario)} disabled={isApplied}
                    className={cn('w-full text-xs', isApplied
                      ? 'border-emerald-500/30 text-emerald-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white')}>
                    {isApplied ? 'Applied' : 'Apply Scenario'}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile.strengths.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 h-full">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Strengths
              </h3>
              <div className="space-y-2">
                {profile.strengths.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <Star className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {profile.weaknesses.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 h-full">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Areas to Improve
              </h3>
              <div className="space-y-2">
                {profile.weaknesses.map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-sm text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
              {profile.missingSkills.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Missing Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.missingSkills.map(s => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Improvement Roadmap */}
      {profile.improvementRoadmap.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" /> Improvement Roadmap
            </h2>
            <div className="space-y-4">
              {profile.improvementRoadmap.map((phase, i) => (
                <motion.div key={phase.phase} initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="relative pl-8 pb-4 border-l-2 border-indigo-500/30 last:border-transparent last:pb-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-indigo-500/30 border-2 border-indigo-400" />
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white">{phase.title}</h3>
                    <Badge variant="outline" className="text-[10px] border-[#334155] text-gray-400">{phase.duration}</Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {phase.tasks.map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-indigo-400 mt-0.5">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {profile.recommendations.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
              <span className="ml-auto text-xs text-gray-400">Ranked by priority</span>
            </div>
            <div className="space-y-3">
              {profile.recommendations.map((rec, i) => {
                const priorityColor = rec.priority === 'high'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : rec.priority === 'medium'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                const iconMap: Record<string, React.ElementType> = {
                  DSA: Code2, Resume: FileText, Interview: Mic, Communication: MessageSquare,
                  Aptitude: Target, Projects: Rocket, 'System Design': Server, Consistency: Clock,
                }
                const RecIcon = iconMap[rec.category] || Lightbulb

                return (
                  <motion.div key={rec.id} initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      rec.priority === 'high' ? 'bg-rose-500/20' : rec.priority === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20')}>
                      <RecIcon className={cn("w-5 h-5",
                        rec.priority === 'high' ? 'text-rose-400' : rec.priority === 'medium' ? 'text-amber-400' : 'text-blue-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-white">{rec.title}</h3>
                        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', priorityColor)}>
                          {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{rec.description}</p>
                      <p className="text-xs font-medium text-emerald-400 mt-1">{rec.impact}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                      <span>#{i + 1}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
