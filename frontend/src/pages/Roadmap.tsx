import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  getCompaniesApi,
  generateRoadmapApi,
  getActiveRoadmapApi,
  completeWeekApi,
  getRoadmapConversationsApi,
  getRoadmapConversationApi,
  createRoadmapConversationApi,
  streamRoadmapMessageApi,
  type CompanyData,
  type RoadmapConversationData,
  type RoadmapData,
  type RoadmapMessageData,
} from '@/services/api'
import { mockRoadmap, mockCompanies } from '@/data/mockData'
import { cn } from '@/lib/utils'
import {
  Calendar, Clock, BookOpen, CheckCircle, Target, RefreshCw, BarChart3,
  Sparkles, Map, Loader2, Bot, Send, Plus, AlertCircle, History,
} from 'lucide-react'
import { motion } from 'framer-motion'

const levels = ['Beginner', 'Intermediate', 'Advanced'] as const

const phaseConfig: Record<string, { label: string; color: string; bar: string; border: string }> = {
  Foundation: {
    label: 'Foundation',
    color: 'text-blue-400',
    bar: 'bg-blue-500',
    border: 'border-blue-500/50',
  },
  'Core DSA': {
    label: 'Core DSA',
    color: 'text-purple-400',
    bar: 'bg-purple-500',
    border: 'border-purple-500/50',
  },
  Advanced: {
    label: 'Advanced',
    color: 'text-rose-400',
    bar: 'bg-rose-500',
    border: 'border-rose-500/50',
  },
  Mock: {
    label: 'Mock',
    color: 'text-emerald-400',
    bar: 'bg-emerald-500',
    border: 'border-emerald-500/50',
  },
}

type RoadmapWeek = RoadmapData['weeks'][number]

function WeekCard({ week, index, onToggle }: { week: RoadmapWeek; index: number; onToggle: (weekId: string, completed: boolean) => void }) {
  const phase = phaseConfig[week.phase]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <div className="relative flex gap-6">
        <div className="flex flex-col items-center">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2',
            week.completed
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
              : 'bg-[#1E293B]/50 border-[#334155]/50 text-gray-400'
          )}>
            {week.completed ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : week.weekNumber}
          </div>
          <div className="w-0.5 flex-1 bg-[#334155]/30 mt-2" />
        </div>

        <div className={cn(
          'flex-1 mb-6 rounded-2xl border-l-4 backdrop-blur-xl bg-[#1E293B]/50 border-[#334155]/50',
          phase.border
        )}>
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', phase.color, 'bg-[#0F172A]/60')}>
                    {week.phase}
                  </span>
                  <span className="text-xs text-gray-400">Week {week.weekNumber}</span>
                </div>
                <h4 className="font-medium text-sm text-white mt-1">{week.topic}</h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {week.resourceCount} resources</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {week.estimatedHours}h</span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={week.completed}
                  onChange={() => onToggle(week.id, week.completed)}
                  className="h-4 w-4 rounded border-gray-600 bg-[#1E293B]/50 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-400">{week.completed ? 'Done' : 'Todo'}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Roadmap() {
  const [level, setLevel] = useState<string>('Intermediate')
  const [company, setCompany] = useState<string>('Amazon')
  const [hours, setHours] = useState<number>(4)
  const [targetDate, setTargetDate] = useState<string>('2026-09-28')
  const [goal, setGoal] = useState('Prepare for a software engineering placement interview')
  const [skillsInput, setSkillsInput] = useState('')
  const [generated, setGenerated] = useState(false)
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversations, setConversations] = useState<RoadmapConversationData[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<RoadmapMessageData[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const [companyResult, active, conversationResult] = await Promise.all([
        getCompaniesApi(),
        getActiveRoadmapApi(),
        getRoadmapConversationsApi(),
      ])
      if (companyResult.data) setCompanies(companyResult.data)
      if (active.data) {
        setRoadmap(active.data)
        setGenerated(true)
        setCompany(active.data.targetCompany)
        setLevel(active.data.currentLevel)
        setHours(active.data.dailyHours)
        setTargetDate(active.data.endDate.slice(0, 10))
      }
      if (conversationResult.data) {
        setConversations(conversationResult.data)
        const latest = conversationResult.data[0]
        if (latest) {
          const detail = await getRoadmapConversationApi(latest.id)
          if (detail.data) {
            setConversationId(detail.data.id)
            setMessages(detail.data.messages)
            if (detail.data.goal) setGoal(detail.data.goal)
            if (detail.data.skills.length) setSkillsInput(detail.data.skills.join(', '))
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    const result = await generateRoadmapApi({
      target_company: company,
      current_level: level,
      daily_hours: hours,
      target_date: targetDate || undefined,
      goal,
      skills: skillsInput.split(',').map(skill => skill.trim()).filter(Boolean),
      conversation_id: conversationId || undefined,
    })
    if (result.data) {
      setRoadmap(result.data.roadmap)
      setGenerated(true)
      setConversationId(result.data.conversationId)
      const detail = await getRoadmapConversationApi(result.data.conversationId)
      if (detail.data) setMessages(detail.data.messages)
      const history = await getRoadmapConversationsApi()
      if (history.data) setConversations(history.data)
    } else {
      setError(result.error || 'Unable to generate your roadmap.')
    }
    setGenerating(false)
  }

  async function handleSelectConversation(id: string) {
    setChatError(null)
    const result = await getRoadmapConversationApi(id)
    if (result.data) {
      setConversationId(id)
      setMessages(result.data.messages)
      if (result.data.roadmap) {
        setRoadmap(result.data.roadmap)
        setGenerated(true)
      }
      if (result.data.goal) setGoal(result.data.goal)
      setSkillsInput(result.data.skills.join(', '))
    } else {
      setChatError(result.error || 'Unable to load this conversation.')
    }
  }

  async function handleNewConversation() {
    const result = await createRoadmapConversationApi({
      title: `${company} roadmap coaching`,
      roadmapId: roadmap?.id,
    })
    if (result.data) {
      setConversationId(result.data.id)
      setMessages([])
      setChatError(null)
      const history = await getRoadmapConversationsApi()
      if (history.data) setConversations(history.data)
    } else {
      setChatError(result.error || 'Unable to start a new conversation.')
    }
  }

  async function handleSendMessage() {
    const content = chatInput.trim()
    if (!content || chatLoading) return
    setChatError(null)

    let activeConversationId = conversationId
    if (!activeConversationId) {
      const created = await createRoadmapConversationApi({
        title: `${company} roadmap coaching`,
        roadmapId: roadmap?.id,
      })
      if (!created.data) {
        setChatError(created.error || 'Unable to start a conversation.')
        return
      }
      activeConversationId = created.data.id
      setConversationId(activeConversationId)
    }

    const timestamp = new Date().toISOString()
    const userMessage: RoadmapMessageData = {
      id: `user-${Date.now()}`,
      conversationId: activeConversationId,
      role: 'USER',
      content,
      createdAt: timestamp,
    }
    const assistantId = `assistant-${Date.now()}`
    const assistantMessage: RoadmapMessageData = {
      id: assistantId,
      conversationId: activeConversationId,
      role: 'ASSISTANT',
      content: '',
      createdAt: timestamp,
    }
    setMessages(previous => [...previous, userMessage, assistantMessage])
    setChatInput('')
    setChatLoading(true)

    try {
      await streamRoadmapMessageApi(activeConversationId, content, {
        onDelta: delta => {
          setMessages(previous => previous.map(message =>
            message.id === assistantId ? { ...message, content: message.content + delta } : message
          ))
        },
        onDone: message => {
          setMessages(previous => previous.map(item => item.id === assistantId ? message : item))
        },
        onError: message => setChatError(message),
      })
      const history = await getRoadmapConversationsApi()
      if (history.data) setConversations(history.data)
    } catch (streamError) {
      setChatError(streamError instanceof Error ? streamError.message : 'The AI response failed.')
      setMessages(previous => previous.filter(message => message.id !== assistantId || message.content))
    } finally {
      setChatLoading(false)
    }
  }

  async function handleToggleWeek(weekId: string, completed: boolean) {
    await completeWeekApi(weekId, !completed)
    if (roadmap) {
      setRoadmap({
        ...roadmap,
        weeks: roadmap.weeks.map(w =>
          w.id === weekId ? { ...w, completed: !completed } : w
        ),
      })
    }
  }

  const currentRoadmap = roadmap || mockRoadmap
  const totalWeeks = currentRoadmap.weeks.length
  const completedWeeks = currentRoadmap.weeks.filter((w) => w.completed).length
  const progress = totalWeeks ? Math.round((completedWeeks / totalWeeks) * 100) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#0F172A]/80 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Map className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Dynamic Roadmap</h1>
          <p className="text-sm text-gray-400">Personalized learning plan for your target company</p>
        </div>
      </div>

      {!generated && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="rounded-2xl backdrop-blur-xl bg-[#1E293B]/50 border border-[#334155]/50 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Build Your Roadmap</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">Tell us about your current level and target to generate a personalized plan</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Current Level</label>
                <div className="flex rounded-xl border border-[#334155]/50 p-1 bg-[#0F172A]/60">
                  {levels.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        level === l
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-200'
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Target Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-[#334155]/50 bg-[#0F172A]/60 text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all duration-200"
                >
                  {(companies.length ? companies : mockCompanies).map((c) => (
                    <option key={c.name} value={c.name} className="bg-[#0F172A] text-white">{c.logo} {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Hours / Day: <span className="text-indigo-400 font-semibold">{hours}h</span>
                </label>
                <div className="pt-1">
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#334155]/50 accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1h</span><span>8h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-[#334155]/50 bg-[#0F172A]/60 text-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all duration-200"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Goal</label>
                <Textarea
                  value={goal}
                  onChange={event => setGoal(event.target.value)}
                  placeholder="Example: Become interview-ready for an SDE role and improve dynamic programming"
                  className="min-h-24 bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Current Skills</label>
                <Textarea
                  value={skillsInput}
                  onChange={event => setSkillsInput(event.target.value)}
                  placeholder="Comma-separated: JavaScript, React, arrays, SQL"
                  className="min-h-24 bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">Existing assessment and gap-analysis signals are included automatically.</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleGenerate} disabled={generating || !goal.trim()} className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 sm:w-auto">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generating ? 'Generating...' : 'Generate Roadmap'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {generated && (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
              {currentRoadmap.weeks.map((w) => (
                <div key={w.weekNumber} className="flex flex-col items-center shrink-0">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                    w.completed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                      : 'bg-[#1E293B]/50 border-[#334155]/50 text-gray-400'
                  )}>
                    {w.weekNumber}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight max-w-16">{w.phase}</span>
                </div>
              ))}
            </div>

            <div className="pl-0">
              {currentRoadmap.weeks.map((week, i) => (
                <WeekCard key={week.weekNumber} week={week} index={i} onToggle={handleToggleWeek} />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex min-h-[34rem] max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-[#0F172A]/90 backdrop-blur-xl xl:sticky xl:top-4">
              <div className="border-b border-[#334155]/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20">
                    <Bot className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white">AI Roadmap Coach</h3>
                    <p className="truncate text-xs text-gray-400">Context-aware coaching with saved history</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewConversation}
                    className="ml-auto shrink-0 text-gray-400 hover:text-white"
                    title="New conversation"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {conversations.length > 0 && (
                  <div className="relative mt-3">
                    <History className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <select
                      value={conversationId || ''}
                      onChange={event => handleSelectConversation(event.target.value)}
                      className="h-10 w-full rounded-xl border border-[#334155]/50 bg-[#0F172A]/70 pl-9 pr-3 text-xs text-gray-300 outline-none focus:border-indigo-500/50"
                    >
                      {conversations.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} · {new Date(item.updatedAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
                    <Sparkles className="mb-3 h-8 w-8 text-indigo-400" />
                    <p className="text-sm font-medium text-white">Ask about your roadmap</p>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-400">
                      Get help prioritizing weeks, adapting around exams, filling skill gaps, or preparing for {company}.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {[
                        'What should I focus on this week?',
                        'How can I improve this plan?',
                        'Give me a daily schedule',
                      ].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => setChatInput(prompt)}
                          className="rounded-lg border border-[#334155]/50 bg-[#1E293B]/60 px-2.5 py-1.5 text-xs text-gray-300 hover:border-indigo-500/40 hover:text-indigo-300"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map(message => (
                  <div
                    key={message.id}
                    className={cn('flex', message.role === 'USER' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[88%] whitespace-pre-wrap rounded-xl px-3 py-2.5 text-sm leading-relaxed',
                      message.role === 'USER'
                        ? 'border border-indigo-500/20 bg-indigo-500/20 text-indigo-100'
                        : 'border border-[#334155]/50 bg-[#1E293B]/80 text-gray-200'
                    )}>
                      {message.content || (
                        <span className="flex items-center gap-2 text-gray-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Thinking…
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {chatError && (
                <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{chatError}</span>
                </div>
              )}

              <div className="border-t border-[#334155]/50 p-3">
                <div className="flex items-end gap-2">
                  <Input
                    value={chatInput}
                    onChange={event => setChatInput(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask your roadmap coach…"
                    disabled={chatLoading}
                    className="min-w-0 flex-1 bg-[#0F172A]/70 border-[#334155]/50 text-gray-200 placeholder:text-gray-600"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || chatLoading}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition-colors hover:bg-indigo-600 disabled:bg-[#1E293B] disabled:text-gray-600"
                    aria-label="Send message"
                  >
                    {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl backdrop-blur-xl bg-[#1E293B]/50 border border-[#334155]/50 p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-indigo-400" />
                This Week's Tasks
              </h3>
              {currentRoadmap.weeks.find((w) => !w.completed) ? (
                <div className="space-y-3">
                  {currentRoadmap.weeks
                    .filter((w) => !w.completed)
                    .slice(0, 1)
                    .map((w) => {
                      const phase = phaseConfig[w.phase]
                      return (
                        <div key={w.weekNumber} className="space-y-2">
                          <Badge className={cn('text-[10px] border-0', phase.color, 'bg-[#0F172A]/60')}>{w.phase}</Badge>
                          <p className="font-medium text-sm text-white">{w.topic}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {w.resourceCount} resources</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {w.estimatedHours}h</span>
                          </div>
                          {(w.resources || []).slice(0, 3).map((r, ri) => (
                            <div key={ri} className="flex items-center gap-2 text-xs text-gray-400">
                              <div className={cn(
                                'w-1.5 h-1.5 rounded-full shrink-0',
                                r.type === 'article' ? 'bg-blue-500' : r.type === 'video' ? 'bg-rose-500' : 'bg-emerald-500'
                              )} />
                              <span className="truncate">{r.title}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">All tasks completed!</p>
              )}
            </div>

            <div className="rounded-2xl backdrop-blur-xl bg-[#1E293B]/50 border border-[#334155]/50 p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                Overall Progress
              </h3>
              <div className="flex flex-col items-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg width={140} height={140} className="-rotate-90">
                    <circle
                      cx={70} cy={70} r={58}
                      fill="none"
                      stroke="#334155"
                      strokeWidth={10}
                    />
                    <circle
                      cx={70} cy={70} r={58}
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth={10}
                      strokeLinecap="round"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (progress / 100) * 364.4}
                      style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-white">{progress}%</span>
                    <span className="text-[10px] text-gray-400">{completedWeeks}/{totalWeeks} weeks</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-[#334155]/50 text-gray-300 hover:text-white hover:bg-[#1E293B]/80"
              onClick={() => {
                setGenerated(false)
                setError(null)
              }}
              disabled={generating}
            >
              <RefreshCw className={cn("h-4 w-4", generating && "animate-spin")} />
              {generating ? 'Generating...' : 'Regenerate Roadmap'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
