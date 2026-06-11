import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, FileText, Map, Code2, Brain, TrendingUp, Flame, Clock, ArrowRight, Zap } from 'lucide-react'
import { mockStudents } from '@/data/mockData'
import { cn } from '@/lib/utils'

const student = mockStudents[0]

const quickActions = [
  {
    title: 'Start Mock Interview',
    description: 'Practice with AI-powered mock interviews tailored to your target companies.',
    icon: Brain,
    path: '/mock-interview',
    color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400',
  },
  {
    title: 'Analyze Resume',
    description: 'Get ATS score and actionable suggestions to improve your resume.',
    icon: FileText,
    path: '/resume',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    title: 'View Roadmap',
    description: 'Follow a personalized learning roadmap for your dream company.',
    icon: Map,
    path: '/roadmap',
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    title: 'Coding Practice',
    description: 'Solve DSA problems commonly asked in your target company interviews.',
    icon: Code2,
    path: '/coding',
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
]

const activityIcons: Record<string, typeof Brain> = {
  'Aptitude Test': TrendingUp,
  'DSA Practice': Code2,
  'Mock Interview': Brain,
}

function CircularGauge({ value, size = 180 }: { value: number; size?: number }) {
  const [animated, setAnimated] = useState(0)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {Math.round(animated)}
        </span>
        <span className="text-xs text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  )
}

function ChanceBar({ company, chance }: { company: string; chance: number }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(chance), 400)
    return () => clearTimeout(timer)
  }, [chance])

  const barColor =
    chance > 70
      ? 'bg-emerald-500'
      : chance >= 40
        ? 'bg-amber-500'
        : 'bg-rose-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{company}</span>
        <span className={cn('font-semibold', chance > 70 ? 'text-emerald-600 dark:text-emerald-400' : chance >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400')}>
          {chance}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  )
}

function SubScoreRow({ label, value }: { label: string; value: number }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 500)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={animated} className={cn('h-2.5', value > 70 ? '[&>div]:bg-emerald-500' : value >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-rose-500')} />
    </div>
  )
}

function ScoreCard() {
  const { placementScore } = student
  const subScores: [string, number][] = [
    ['Aptitude', placementScore.aptitude],
    ['DSA', placementScore.dsa],
    ['Core Subjects', placementScore.coreSubjects],
    ['Communication', placementScore.communication],
    ['Resume', placementScore.resume],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Placement Readiness Score
          </CardTitle>
          <CardDescription>Your overall preparedness based on key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center">
              <CircularGauge value={placementScore.overall} />
              <Badge variant={placementScore.overall >= 70 ? 'success' : placementScore.overall >= 40 ? 'warning' : 'destructive'} className="mt-4">
                {placementScore.overall >= 80 ? 'Excellent' : placementScore.overall >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="space-y-4">
              {subScores.map(([label, value], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                >
                  <SubScoreRow label={label} value={value} />
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CompanyChancesCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Company Chances
          </CardTitle>
          <CardDescription>Estimated probability based on your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {student.companyChances.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
            >
              <ChanceBar company={c.company} chance={c.chance} />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StreakCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Practice Streak
          </CardTitle>
          <CardDescription>Keep the momentum going!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-5xl font-extrabold text-orange-500">{student.streak}</div>
          <div className="text-sm text-muted-foreground mt-2">days streak</div>
          <Button variant="outline" size="sm" className="mt-4 gap-1.5">
            <Zap className="h-4 w-4" />
            Practice Today
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickActionsGrid() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
    >
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
          >
            <Card
              className="cursor-pointer group hover:scale-[1.02] hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-5">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function RecentActivityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest practice sessions</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {student.recentActivity.map((activity, i) => {
              const Icon = activityIcons[activity.type] || Brain
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                  <Badge
                    variant={activity.score >= 80 ? 'success' : activity.score >= 60 ? 'warning' : 'destructive'}
                  >
                    {activity.score}%
                  </Badge>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {student.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s your placement readiness overview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ScoreCard />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <CompanyChancesCard />
          <StreakCard />
        </div>
      </div>

      <QuickActionsGrid />

      <RecentActivityCard />
    </div>
  )
}
