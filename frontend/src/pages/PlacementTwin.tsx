import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Brain, Code2, FileText, Mic, Target, TrendingUp, Rocket,
  Lightbulb, ChevronUp, ChevronDown, Zap, Award, CheckCircle, ArrowRight,
  Server, MessageSquare
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mockStudents, mockSimulationScenarios } from '@/data/mockData'
import {
  getCurrentProfile,
  getPlacementProbability,
  applyScenario,
  getProbabilityAfterScenario,
  getRecommendations,
  type PlacementProfile,
} from '@/lib/placementTwinEngine'

const student = mockStudents[3]

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
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
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

function ScoreCard({ label, value, icon: Icon, color, trend }: { label: string; value: number; icon: React.ElementType; color: string; trend?: 'up' | 'down' }) {
  const barColor = value > 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = value > 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-rose-400'

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

export default function PlacementTwin() {
  const [profile, setProfile] = useState<PlacementProfile>(getCurrentProfile())
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([])

  const probability = useMemo(() => getPlacementProbability(profile), [profile])
  const recommendations = useMemo(() => getRecommendations(profile), [profile])

  const handleApplyScenario = (scenarioId: string) => {
    const scenario = mockSimulationScenarios.find(s => s.id === scenarioId)
    if (!scenario) return

    setProfile(prev => applyScenario(prev, scenario))
    setAppliedScenarios(prev => prev.includes(scenarioId) ? prev : [...prev, scenarioId])
    setActiveScenario(scenarioId)
  }

  const handleReset = () => {
    setProfile(getCurrentProfile())
    setAppliedScenarios([])
    setActiveScenario(null)
  }

  const projectedProbability = activeScenario
    ? getProbabilityAfterScenario(profile, mockSimulationScenarios.find(s => s.id === activeScenario)!)
    : null

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Placement Twin</h1>
              <p className="text-sm text-gray-400">AI-powered scenario simulation & prediction engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
              <Zap className="w-3 h-3 mr-1" /> Live Simulation
            </Badge>
            {appliedScenarios.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="border-[#334155] text-gray-300 hover:text-white"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Current Placement Profile</h2>
              <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
                {student.name}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center">
                <CircularGauge value={profile.readinessScore} />
                <p className="text-sm text-gray-400 mt-3">Readiness Score</p>
              </div>
              <div className="space-y-3">
                <ScoreCard label="DSA Score" value={profile.dsaScore} icon={Code2} color="bg-emerald-500/20 text-emerald-400" trend={profile.dsaScore >= 70 ? 'up' : 'down'} />
                <ScoreCard label="Resume Score" value={profile.resumeScore} icon={FileText} color="bg-blue-500/20 text-blue-400" trend={profile.resumeScore >= 70 ? 'up' : 'down'} />
                <ScoreCard label="Interview Score" value={profile.interviewScore} icon={Mic} color="bg-amber-500/20 text-amber-400" />
                <ScoreCard label="Aptitude Score" value={profile.aptitudeScore} icon={Target} color="bg-cyan-500/20 text-cyan-400" />
                <ScoreCard label="Projects Score" value={profile.projectsScore} icon={Rocket} color="bg-violet-500/20 text-violet-400" />
                <ScoreCard label="Communication Score" value={profile.communicationScore} icon={MessageSquare} color="bg-rose-500/20 text-rose-400" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 h-full">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Placement Probability</h2>
            </div>
            <div className="space-y-4">
              <ProbabilityBar label="Service Companies" value={probability.service} color="text-emerald-400" />
              <ProbabilityBar label="Mid-Level Product" value={probability.midProduct} color="text-blue-400" />
              <ProbabilityBar label="Top Product Companies" value={probability.topProduct} color="text-amber-400" />
              <ProbabilityBar label="FAANG-Level" value={probability.faang} color="text-rose-400" />
            </div>

            {projectedProbability && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-[#334155]/50"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Projected Impact</span>
                </div>
                <div className="space-y-3">
                  <ProjectedRow label="Service" before={probability.service} after={projectedProbability.service} />
                  <ProjectedRow label="Mid Product" before={probability.midProduct} after={projectedProbability.midProduct} />
                  <ProjectedRow label="Top Product" before={probability.topProduct} after={projectedProbability.topProduct} />
                  <ProjectedRow label="FAANG" before={probability.faang} after={projectedProbability.faang} />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Rocket className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Scenario Simulation</h2>
            <Badge className="ml-auto bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">Apply scenarios to see impact</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockSimulationScenarios.map((scenario, i) => {
              const isApplied = appliedScenarios.includes(scenario.id)
              const iconMap: Record<string, React.ElementType> = {
                Code2, Brain, FileText, Server, Mic, Rocket, MessageSquare
              }
              const ScenarioIcon = iconMap[scenario.icon] || Target
              const impactPct = Math.round(scenario.impact.readiness.to - scenario.impact.readiness.from)

              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    isApplied
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-[#1E293B]/50 border-[#334155]/50 hover:border-indigo-500/30'
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      isApplied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                    )}>
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
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="text-gray-400">{scenario.impact.readiness.from}%</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                    <span className="font-bold text-emerald-400">{scenario.impact.readiness.to}%</span>
                    <span className={cn(
                      'ml-auto font-medium',
                      impactPct > 0 ? 'text-emerald-400' : 'text-amber-400'
                    )}>
                      +{impactPct}%
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={isApplied ? 'outline' : 'default'}
                    onClick={() => handleApplyScenario(scenario.id)}
                    disabled={isApplied}
                    className={cn(
                      'w-full text-xs',
                      isApplied
                        ? 'border-emerald-500/30 text-emerald-400'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    )}
                  >
                    {isApplied ? 'Applied' : 'Apply Scenario'}
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
            <span className="ml-auto text-xs text-gray-400">Ranked by impact</span>
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const priorityColor = rec.priority === 'high'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : rec.priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'

              const iconMap: Record<string, React.ElementType> = {
                DSA: Code2, Resume: FileText, Interview: Mic, Communication: MessageSquare,
                Aptitude: Target, Projects: Rocket, 'System Design': Server
              }
              const RecIcon = iconMap[rec.category] || Lightbulb

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    rec.priority === 'high' ? 'bg-rose-500/20' : rec.priority === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  )}>
                    <RecIcon className={cn(
                      "w-5 h-5",
                      rec.priority === 'high' ? 'text-rose-400' : rec.priority === 'medium' ? 'text-amber-400' : 'text-blue-400'
                    )} />
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
    </div>
  )
}

function ProjectedRow({ label, before, after }: { label: string; before: number; after: number }) {
  const diff = after - before
  const color = diff > 0 ? 'text-emerald-400' : 'text-amber-400'
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{before}%</span>
        <ArrowRight className="w-3 h-3 text-gray-600" />
        <span className="font-medium text-white">{after}%</span>
        <span className={cn('font-medium', color)}>{diff > 0 ? `+${diff}` : diff}%</span>
      </div>
    </div>
  )
}
