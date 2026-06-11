import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockRoadmap, mockCompanies } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { Calendar, Clock, BookOpen, CheckCircle, Target, RefreshCw, BarChart3, Sparkles, Map } from 'lucide-react'
import { motion } from 'framer-motion'

const levels = ['Beginner', 'Intermediate', 'Advanced'] as const

const phaseConfig: Record<string, { label: string; color: string; bar: string; bg: string; border: string }> = {
  Foundation: {
    label: 'Foundation',
    color: 'text-blue-600 dark:text-blue-400',
    bar: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'Core DSA': {
    label: 'Core DSA',
    color: 'text-purple-600 dark:text-purple-400',
    bar: 'bg-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
  },
  Advanced: {
    label: 'Advanced',
    color: 'text-rose-600 dark:text-rose-400',
    bar: 'bg-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
  Mock: {
    label: 'Mock',
    color: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
}

function WeekCard({ week, index }: { week: typeof mockRoadmap.weeks[0]; index: number }) {
  const phase = phaseConfig[week.phase]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <div className="relative flex gap-6">
        {/* Timeline line */}
        <div className="flex flex-col items-center">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2', week.completed ? 'bg-success border-success text-white' : 'bg-background border-muted-foreground/30 text-muted-foreground')}>
            {week.completed ? <CheckCircle className="h-4 w-4" /> : week.weekNumber}
          </div>
          <div className="w-0.5 flex-1 bg-border mt-2" />
        </div>

        {/* Card */}
        <Card className={cn('flex-1 mb-6 border-l-4', phase.bg, phase.border, phase.bar.replace('bg-', 'border-l-'))}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', phase.color, 'bg-background/80')}>
                    {week.phase}
                  </span>
                  <span className="text-xs text-muted-foreground">Week {week.weekNumber}</span>
                </div>
                <h4 className="font-medium text-sm mt-1">{week.topic}</h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {week.resourceCount} resources</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {week.estimatedHours}h</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  defaultChecked={week.completed}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">{week.completed ? 'Done' : 'Todo'}</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

export default function Roadmap() {
  const [level, setLevel] = useState<string>('Intermediate')
  const [company, setCompany] = useState<string>('Amazon')
  const [hours, setHours] = useState<number>(4)
  const [targetDate, setTargetDate] = useState<string>('2026-09-28')
  const [generated, setGenerated] = useState(false)

  const roadmap = mockRoadmap
  const totalWeeks = roadmap.weeks.length
  const completedWeeks = roadmap.weeks.filter((w) => w.completed).length
  const progress = Math.round((completedWeeks / totalWeeks) * 100)

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dynamic Roadmap</h1>
          <p className="text-sm text-muted-foreground">Personalized learning plan for your target company</p>
        </div>
      </div>

      {/* Input Form */}
      {!generated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Build Your Roadmap
              </CardTitle>
              <CardDescription>Tell us about your current level and target to generate a personalized plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Level</label>
                  <div className="flex rounded-xl border border-input p-0.5 bg-muted/50">
                    {levels.map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={cn(
                          'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                          level === l
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Company</label>
                  <Select value={company} onValueChange={setCompany}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCompanies.map((c) => (
                        <SelectItem key={c.name} value={c.name}>{c.logo} {c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hours */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hours / Day: <span className="text-primary font-semibold">{hours}h</span></label>
                  <div className="pt-1">
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1h</span><span>8h</span>
                    </div>
                  </div>
                </div>

                {/* Target Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setGenerated(true)} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Roadmap
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Generated Roadmap */}
      {generated && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Timeline */}
          <div>
            {/* Week markers */}
            <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
              {roadmap.weeks.map((w) => (
                <div key={w.weekNumber} className="flex flex-col items-center shrink-0">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    w.completed
                      ? 'bg-success border-success text-white shadow-sm'
                      : 'bg-card border-border text-muted-foreground'
                  )}>
                    {w.weekNumber}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight max-w-16">{w.phase}</span>
                </div>
              ))}
            </div>

            {/* Week Cards */}
            <div className="pl-0">
              {roadmap.weeks.map((week, i) => (
                <WeekCard key={week.weekNumber} week={week} index={i} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* This Week's Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  This Week's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roadmap.weeks.find((w) => !w.completed) ? (
                  <div className="space-y-3">
                    {roadmap.weeks
                      .filter((w) => !w.completed)
                      .slice(0, 1)
                      .map((w) => (
                        <div key={w.weekNumber} className="space-y-2">
                          <Badge variant={w.phase === 'Foundation' ? 'info' : w.phase === 'Core DSA' ? 'secondary' : w.phase === 'Advanced' ? 'warning' : 'success'} className="text-[10px]">
                            {w.phase}
                          </Badge>
                          <p className="font-medium text-sm">{w.topic}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {w.resourceCount} resources</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {w.estimatedHours}h</span>
                          </div>
                          {w.resources.slice(0, 3).map((r, ri) => (
                            <div key={ri} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                r.type === 'article' ? 'bg-blue-500' : r.type === 'video' ? 'bg-rose-500' : 'bg-emerald-500'
                              )} />
                              <span className="truncate">{r.title}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All tasks completed!</p>
                )}
              </CardContent>
            </Card>

            {/* Progress Ring */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg width={140} height={140} className="-rotate-90">
                    <circle
                      cx={70} cy={70} r={58}
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={10}
                    />
                    <circle
                      cx={70} cy={70} r={58}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (progress / 100) * 364.4}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-primary">{progress}%</span>
                    <span className="text-[10px] text-muted-foreground">{completedWeeks}/{totalWeeks} weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regenerate */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setGenerated(false)}
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate Roadmap
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
