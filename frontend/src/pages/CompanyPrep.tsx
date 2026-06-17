import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getCompaniesApi, getCompanyApi, type CompanyData, type CompanyDetailData } from '@/services/api'
import { cn } from '@/lib/utils'
import { X, Building2, Clock, ChevronDown, ChevronRight, CheckCircle, Circle, BarChart3, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const companyColors = [
  'bg-blue-500/20 text-blue-400',
  'bg-orange-500/20 text-orange-400',
  'bg-sky-500/20 text-sky-400',
  'bg-indigo-500/20 text-indigo-400',
  'bg-red-500/20 text-red-400',
  'bg-purple-500/20 text-purple-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-cyan-500/20 text-cyan-400',
  'bg-teal-500/20 text-teal-400',
]

const tabItems = ['Process', 'Questions', 'Topics', 'Roadmap'] as const
type Tab = typeof tabItems[number]

function getDifficultyBadge(difficulty: string) {
  switch (difficulty) {
    case 'Easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'Hard': return 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}

function getCategoryBadge(category: string) {
  switch (category) {
    case 'DSA': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    case 'System Design': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    case 'HR': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'Core Subject': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  }
}

function generateRoadmap(topics: { name: string }[]) {
  const weekSize = Math.max(2, Math.ceil(topics.length / 4))
  const weeks: { week: number; topic: string; resources: number; hours: number }[] = []
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

export default function CompanyPrep() {
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetailData | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('Process')
  const [topicCheckState, setTopicCheckState] = useState<Record<string, boolean>>({})
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    async function fetchCompanies() {
      const result = await getCompaniesApi()
      if (result.data) {
        setCompanies(result.data)
      }
      setLoading(false)
    }
    fetchCompanies()
  }, [])

  const roadmap = selectedCompany ? generateRoadmap(selectedCompany.topics) : []

  const completedTopics = selectedCompany
    ? selectedCompany.topics.filter(t => topicCheckState[t.name] ?? t.completed).length
    : 0
  const totalTopics = selectedCompany?.topics.length ?? 0

  async function handleCompanySelect(company: CompanyData) {
    setDetailLoading(true)
    const result = await getCompanyApi(company.slug)
    if (result.data) {
      setSelectedCompany(result.data)
      const initial: Record<string, boolean> = {}
      result.data.topics.forEach(t => { initial[t.name] = t.completed })
      setTopicCheckState(initial)
      setExpandedWeeks(new Set([1]))
      setActiveTab('Process')
    }
    setDetailLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Company Preparation</h1>
        <p className="text-sm text-gray-400 mt-1">Research and prepare for your target companies</p>
      </motion.div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company, idx) => (
          <motion.div
            key={company.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div
              className={cn(
                'rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-5 backdrop-blur-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
                selectedCompany?.slug === company.slug && 'ring-2 ring-indigo-500/50 border-indigo-500/30'
              )}
              onClick={() => handleCompanySelect(company)}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0',
                  companyColors[idx % companyColors.length]
                )}>
                  {company.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{company.name}</h3>
                  <p className="text-sm text-gray-300 font-medium">{company.avgPackage}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={cn('capitalize border text-xs px-2 py-0.5', getDifficultyBadge(company.difficulty))}>
                      {company.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {company.interviewRounds} round{company.interviewRounds > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Company Detail Overlay */}
      {selectedCompany && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedCompany(null) }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0F172A] border border-[#334155] shadow-2xl"
          >
            {detailLoading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            ) : (
            <>
            {/* Detail Header */}
            <div className="flex items-start justify-between p-6 pb-4 border-b border-[#334155]/50">
              <div className="flex items-center gap-4">
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0',
                  companyColors[companies.indexOf(selectedCompany as any) % companyColors.length]
                )}>
                  {selectedCompany.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-gray-300">{selectedCompany.avgPackage}</span>
                    <span className="text-gray-600">·</span>
                    <Badge className={cn('capitalize border text-xs px-2 py-0.5', getDifficultyBadge(selectedCompany.difficulty))}>
                      {selectedCompany.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {selectedCompany.interviewRounds} rounds
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCompany(null)}
                className="shrink-0 rounded-xl text-gray-400 hover:text-white hover:bg-[#1E293B]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Custom Tabs */}
            <div className="flex border-b border-[#334155]/50 px-6 pt-4">
              {tabItems.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
                    activeTab === tab
                      ? 'text-indigo-400 border-indigo-400'
                      : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Process Tab */}
              {activeTab === 'Process' && (
                <div className="relative">
                  {selectedCompany.rounds.map((round, idx) => (
                    <div key={idx} className="flex gap-4 pb-8 relative last:pb-0">
                      {idx < selectedCompany.rounds.length - 1 && (
                        <div className="absolute left-[17px] top-9 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500/30 to-transparent" />
                      )}
                      <div className={cn(
                        'w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 mt-0.5 text-sm font-semibold',
                        idx === 0
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-indigo-500/10 text-indigo-400'
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-white">{round.name}</h4>
                          <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            {round.duration}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{round.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'Questions' && (
                <div className="space-y-3">
                  {selectedCompany.topQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 transition-all duration-200 hover:border-indigo-500/20"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white leading-relaxed">{q.question}</p>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <Badge className={cn('border text-xs px-2 py-0.5', getCategoryBadge(q.category))}>
                              {q.category}
                            </Badge>
                            <Badge className={cn('capitalize border text-xs px-2 py-0.5', getDifficultyBadge(q.difficulty))}>
                              {q.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-400 bg-[#1E293B] px-2 py-0.5 rounded-md border border-[#334155]/30">
                              {q.topic}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics Tab */}
              {activeTab === 'Topics' && (
                <div>
                  <div className="mb-5 p-4 rounded-xl bg-[#1E293B]/50 border border-[#334155]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Preparation Progress</span>
                      <span className="text-sm text-gray-400 font-medium">{completedTopics} / {totalTopics}</span>
                    </div>
                    <Progress
                      value={totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0}
                      className="h-2.5 bg-[#0F172A] [&>div]:bg-gradient-to-r [&>div]:from-indigo-500 [&>div]:to-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    {selectedCompany.topics.map((topic) => {
                      const checked = topicCheckState[topic.name] ?? topic.completed
                      return (
                        <button
                          key={topic.name}
                          onClick={() => toggleTopic(topic.name)}
                          className="w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#1E293B]/50 transition-colors text-left group"
                        >
                          {checked ? (
                            <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0 transition-all duration-200" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-600 shrink-0 group-hover:text-gray-500 transition-colors" />
                          )}
                          <span className={cn(
                            'text-sm transition-all duration-200',
                            checked ? 'text-white font-medium' : 'text-gray-400'
                          )}>
                            {topic.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Roadmap Tab */}
              {activeTab === 'Roadmap' && (
                <div className="space-y-3">
                  {roadmap.map((week) => {
                    const isExpanded = expandedWeeks.has(week.week)
                    return (
                      <div key={week.week} className="rounded-xl border border-[#334155]/30 overflow-hidden transition-all duration-200 bg-[#1E293B]/30">
                        <button
                          onClick={() => toggleWeek(week.week)}
                          className="w-full flex items-center justify-between p-4 hover:bg-[#1E293B]/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors',
                              isExpanded ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-indigo-500/10 text-indigo-400'
                            )}>
                              {week.week}
                            </div>
                            <div>
                              <h4 className="font-medium text-sm text-white">Week {week.week}</h4>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{week.topic}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-gray-400 text-right hidden sm:block">
                              <p>{week.resources} resources</p>
                              <p className="text-indigo-400 font-medium">{week.hours}h</p>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 transition-transform" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-[#334155]/30 bg-[#0F172A]/50">
                            <div className="p-4 pt-3">
                              <div className="ml-12">
                                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                  Topics to cover
                                </h5>
                                <p className="text-sm text-gray-400 mb-3">{week.topic}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
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
              )}
            </div>
            </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
