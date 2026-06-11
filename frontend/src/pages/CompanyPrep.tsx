import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { mockCompanies, type Company } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { X, Building2, Clock, ChevronDown, ChevronRight, CheckCircle, Circle, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RoadmapWeek {
  week: number
  topic: string
  resources: number
  hours: number
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info"

function getDifficultyVariant(difficulty: string): BadgeVariant {
  switch (difficulty) {
    case "Easy": return "success"
    case "Medium": return "warning"
    case "Hard": return "destructive"
    default: return "default"
  }
}

function getCategoryVariant(category: string): BadgeVariant {
  switch (category) {
    case "DSA": return "info"
    case "System Design": return "default"
    case "HR": return "success"
    case "Core Subject": return "warning"
    default: return "default"
  }
}

function generateRoadmap(topics: Company['topics']): RoadmapWeek[] {
  const weekSize = Math.max(2, Math.ceil(topics.length / 4))
  const weeks: RoadmapWeek[] = []
  for (let i = 0; i < topics.length; i += weekSize) {
    const chunk = topics.slice(i, i + weekSize)
    weeks.push({
      week: weeks.length + 1,
      topic: chunk.map(t => t.name).join(', '),
      resources: Math.floor(Math.random() * 4) + 3,
      hours: chunk.length * 4 + 2,
    })
  }
  return weeks
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Easy": return "bg-emerald-500"
    case "Medium": return "bg-amber-500"
    case "Hard": return "bg-rose-500"
    default: return "bg-primary"
  }
}

export default function CompanyPrep() {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [topicCheckState, setTopicCheckState] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))

  const difficultyDistribution = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 }
    mockCompanies.forEach(c => counts[c.difficulty]++)
    const total = mockCompanies.length
    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
  }, [])

  const roadmap = useMemo(
    () => selectedCompany ? generateRoadmap(selectedCompany.topics) : [],
    [selectedCompany]
  )

  const completedTopics = selectedCompany
    ? selectedCompany.topics.filter(t => topicCheckState[t.name] ?? t.completed).length
    : 0
  const totalTopics = selectedCompany?.topics.length ?? 0

  function handleCompanySelect(company: Company) {
    setSelectedCompany(company)
    const initial: Record<string, boolean> = {}
    company.topics.forEach(t => { initial[t.name] = t.completed })
    setTopicCheckState(initial)
    setExpandedWeeks(new Set([1]))
  }

  function toggleWeek(week: number) {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(week)) next.delete(week)
      else next.add(week)
      return next
    })
  }

  function toggleTopic(name: string) {
    setTopicCheckState(prev => ({ ...prev, [name]: !(prev[name] ?? false) }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Company Preparation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Research and prepare for your target companies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCompanies.map((company) => (
          <motion.div
            key={company.slug}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30",
                selectedCompany?.slug === company.slug && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => handleCompanySelect(company)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl shrink-0 ring-1 ring-primary/10">
                    {company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{company.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{company.avgPackage}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant={getDifficultyVariant(company.difficulty)} className="capitalize">
                        {company.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {company.interviewRounds} round{company.interviewRounds > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4 text-primary" />
            Difficulty Distribution
          </CardTitle>
          <CardDescription>Breakdown of companies by difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {difficultyDistribution.map(({ label, count, percentage }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">{count}</span>
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", getDifficultyColor(label))}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedCompany && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Card className="overflow-hidden border-primary/10">
              <CardHeader className="flex flex-row items-start justify-between pb-4 border-b bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-2xl shrink-0 ring-1 ring-primary/10">
                    {selectedCompany.logo}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedCompany.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-foreground">{selectedCompany.avgPackage}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <Badge variant={getDifficultyVariant(selectedCompany.difficulty)}>
                        {selectedCompany.difficulty}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCompany(null)}
                  className="shrink-0 rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="process" className="w-full">
                  <div className="px-6 pt-4 pb-2 border-b bg-muted/20">
                    <TabsList className="w-full h-auto grid grid-cols-4 gap-1.5 bg-transparent p-0">
                      {["Process", "Questions", "Topics", "Roadmap"].map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab.toLowerCase()}
                          className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2 text-xs sm:text-sm"
                        >
                          {tab}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="process" className="p-6 pt-4">
                    <ScrollArea className="h-[420px] pr-4">
                      <div className="relative">
                        {selectedCompany.rounds.map((round, idx) => (
                          <div key={idx} className="flex gap-4 pb-8 relative last:pb-0">
                            {idx < selectedCompany.rounds.length - 1 && (
                              <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 to-transparent" />
                            )}
                            <div className={cn(
                              "w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold",
                              idx === 0
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-primary/10 text-primary"
                            )}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{round.name}</h4>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                                  <Clock className="w-3 h-3" />
                                  {round.duration}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{round.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="questions" className="p-6 pt-4">
                    <ScrollArea className="h-[420px] pr-4">
                      <div className="space-y-3">
                        {selectedCompany.topQuestions.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl bg-muted/30 border transition-all duration-200 hover:border-primary/20 hover:bg-muted/50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  <Badge variant={getCategoryVariant(q.category)}>
                                    {q.category}
                                  </Badge>
<Badge
                                  variant={getDifficultyVariant(q.difficulty)}
                                  className="capitalize"
                                >
                                    {q.difficulty}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                                    {q.topic}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="topics" className="p-6 pt-4">
                    <div className="mb-5 p-4 rounded-xl bg-muted/30 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Preparation Progress</span>
                        <span className="text-sm text-muted-foreground font-medium">{completedTopics} / {totalTopics}</span>
                      </div>
                      <Progress
                        value={totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}
                        className="h-2.5"
                      />
                    </div>
                    <ScrollArea className="h-[340px] pr-4">
                      <div className="space-y-1">
                        {selectedCompany.topics.map((topic) => {
                          const checked = topicCheckState[topic.name] ?? topic.completed
                          return (
                            <button
                              key={topic.name}
                              onClick={() => toggleTopic(topic.name)}
                              className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                            >
                              {checked ? (
                                <CheckCircle className="w-5 h-5 text-primary shrink-0 transition-all duration-200" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground/60 transition-colors" />
                              )}
                              <span className={cn(
                                "text-sm transition-all duration-200",
                                checked ? "text-foreground font-medium" : "text-muted-foreground"
                              )}>
                                {topic.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="roadmap" className="p-6 pt-4">
                    <ScrollArea className="h-[420px] pr-4">
                      <div className="space-y-3">
                        {roadmap.map((week) => {
                          const isExpanded = expandedWeeks.has(week.week)
                          return (
                            <div key={week.week} className="rounded-xl border overflow-hidden transition-all duration-200">
                              <button
                                onClick={() => toggleWeek(week.week)}
                                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors",
                                    isExpanded ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 text-primary"
                                  )}>
                                    {week.week}
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-sm">Week {week.week}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{week.topic}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-xs text-muted-foreground text-right hidden sm:block">
                                    <p>{week.resources} resources</p>
                                    <p className="text-primary font-medium">{week.hours}h</p>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />
                                  )}
                                </div>
                              </button>
                              {isExpanded && (
                                <div className="border-t bg-muted/20">
                                  <div className="p-4 pt-3">
                                    <div className="ml-12">
                                      <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Topics to cover
                                      </h5>
                                      <p className="text-sm text-muted-foreground mb-3">{week.topic}</p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5" />
                                          {week.hours} hours
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                          <BarChart3 className="w-3.5 h-3.5" />
                                          {week.resources} resources
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
