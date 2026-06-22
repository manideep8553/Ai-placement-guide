import { useState, useEffect, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getProblemsApi, getProblemApi, submitProblemApi, getSubmissionsApi, getProblemTopicsApi, startCodingSessionApi, endCodingSessionApi, chatWithAiApi, type CodingProblemData, type CodingSubmissionData } from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Play, CheckCircle2, XCircle, Lightbulb, Bot, ChevronLeft, ChevronRight,
  Code2, Clock, Cpu, BarChart3, MessageSquare, Sparkles, Send, Menu, Loader2,
  Timer, Target, AlertTriangle, History, Search, BookOpen, FileCode, Terminal, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const LANGUAGES = [
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'java', label: 'Java', ext: 'java' },
  { id: 'cpp', label: 'C++', ext: 'cpp' },
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'c', label: 'C', ext: 'c' },
] as const

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

const MONACO_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
  ],
  colors: {
    'editor.background': '#0B1121',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#1E293B50',
    'editor.selectionBackground': '#264F7840',
    'editor.inactiveSelectionBackground': '#3A3D4140',
    'editorCursor.foreground': '#569CD6',
    'editorLineNumber.foreground': '#475569',
    'editorLineNumber.activeForeground': '#94A3B8',
    'editor.selectionHighlightBackground': '#add6ff26',
    'editorBracketMatch.background': '#0d3a58',
    'editorBracketMatch.border': '#569CD6',
    'editorGutter.background': '#0B1121',
    'editorWidget.background': '#0F172A',
    'editorWidget.border': '#334155',
  },
}

function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onExpire()
      return
    }
    const timer = setInterval(() => setRemaining(r => r - 1), 1000)
    return () => clearInterval(timer)
  }, [remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isLow = remaining < 60

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-medium",
      isLow ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#1E293B]/50 text-gray-300 border border-[#334155]/30"
    )}>
      <Timer className={cn("h-3.5 w-3.5", isLow && "animate-pulse")} />
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  )
}

function CircularGauge({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(Math.min(100, Math.max(0, value))), 300)
    return () => clearTimeout(timer)
  }, [value])

  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E293B" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{Math.round(animated)}</span>
    </div>
  )
}

type TabType = 'problem' | 'submissions'

export default function CodingInterview() {
  const [problems, setProblems] = useState<CodingProblemData[]>([])
  const [problem, setProblem] = useState<CodingProblemData | null>(null)
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [testResults, setTestResults] = useState<{ passed: boolean; isHidden: boolean; index: number; error?: string | null }[] | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [topicFilter, setTopicFilter] = useState<string>('All')
  const [companyFilter, setCompanyFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<CodingSubmissionData['aiFeedback'] | null>(null)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>('problem')
  const [session, setSession] = useState<any>(null)
  const [sessionTimer, setSessionTimer] = useState(0)
  const [showCompanyRounds, setShowCompanyRounds] = useState(false)
  const [aiChatLoading, setAiChatLoading] = useState(false)
  const [topics, setTopics] = useState<string[]>([])
  const [passedCount, setPassedCount] = useState(0)
  const [totalTests, setTotalTests] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const companyList = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Adobe', 'TCS', 'Infosys', 'Wipro']

  useEffect(() => {
    async function init() {
      const [problemsRes, topicsRes] = await Promise.all([
        getProblemsApi({ limit: '50' }),
        getProblemTopicsApi().catch(() => ({ data: [] })),
      ])
      if (problemsRes.data) {
        setProblems(problemsRes.data.problems)
        if (problemsRes.data.problems.length > 0) {
          loadProblem(problemsRes.data.problems[0].id)
        }
      }
      if (topicsRes.data) setTopics(topicsRes.data)
      setLoading(false)
    }
    init()
  }, [])

  async function loadProblem(id: string) {
    const res = await getProblemApi(id)
    if (res.data) {
      setProblem(res.data)
      const starter = res.data.starterCode?.[language as keyof typeof res.data.starterCode]
      setCode(starter || '')
      setTestResults(null)
      setShowResults(false)
      setShowHint(false)
      setShowAiChat(false)
      setAiMessages([])
      setFeedback(null)
      setSubmissionResult(null)
      setSubmissionStatus(null)
    }
  }

  useEffect(() => {
    if (problem) {
      const starter = problem.starterCode?.[language as keyof typeof problem.starterCode]
      setCode(starter || '')
    }
  }, [language])

  const filteredProblems = problems.filter(p => {
    if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false
    if (topicFilter !== 'All' && p.topic !== topicFilter) return false
    if (companyFilter !== 'All' && !p.companyTags.includes(companyFilter)) return false
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    monaco.editor.defineTheme('coding-dark', MONACO_THEME as any)
    monaco.editor.setTheme('coding-dark')
  }

  async function handleSubmit() {
    if (!problem || submitting) return
    setSubmitting(true)
    setSubmissionStatus('RUNNING')

    const result = await submitProblemApi(problem.id, {
      code,
      language,
      sessionId: session?.id,
    })

    setSubmitting(false)
    if (result.data) {
      setTestResults(result.data.testResults)
      setPassedCount(result.data.passedCount)
      setTotalTests(result.data.totalCount)
      setFeedback(result.data.feedback)
      setSubmissionResult(result.data)
      setSubmissionStatus(result.data.status)
      setExecutionTime(result.data.executionTime)
      setShowResults(true)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      if (session && session.type === 'TIMED' && result.data?.status === 'ACCEPTED' && problems.filter(p => p.difficulty === difficultyFilter || difficultyFilter === 'All').length > 1) {
        const nextProblem = problems.find(p => p.id !== problem.id && (difficultyFilter === 'All' || p.difficulty === difficultyFilter))
        if (nextProblem) setTimeout(() => loadProblem(nextProblem.id), 1500)
      }
    } else {
      setSubmissionStatus('ERROR')
      setShowResults(true)
    }
  }

  const handleRun = handleSubmit

  async function handleStartSession(type: string, duration?: number) {
    const res = await startCodingSessionApi({ type, duration: duration || undefined })
    if (res.data) {
      setSession(res.data)
      if (duration) setSessionTimer(duration * 60)
    }
  }

  async function handleEndSession() {
    if (!session) return
    await endCodingSessionApi(session.id)
    setSession(null)
    setSessionTimer(0)
  }

  function handleTimerExpire() {
    if (session) {
      handleSubmit()
      handleEndSession()
    }
  }

  function startCompanyRound(company: string) {
    setCompanyFilter(company)
    setShowCompanyRounds(false)
  }

  function handleEditorChange(value: string | undefined) {
    if (value !== undefined) setCode(value)
  }

  async function handleAiSend() {
    if (!aiInput.trim() || !problem || aiChatLoading) return
    const msg = aiInput
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', text: msg }])
    setAiChatLoading(true)
    const result = await chatWithAiApi(problem.id, msg)
    setAiChatLoading(false)
    if (result.data) {
      setAiMessages(prev => [...prev, { role: 'assistant', text: result.data!.reply }])
    } else {
      setAiMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh] bg-[#0F172A]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (!problem && problems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh] bg-[#0F172A]">
        <p className="text-gray-400">No problems available</p>
      </div>
    )
  }

  return (
    <div className="relative -m-3 flex min-h-[calc(100dvh-3.5rem)] bg-[#0F172A] sm:-m-4 lg:-m-6 lg:h-[calc(100dvh-4rem)] lg:min-h-0">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 overflow-hidden border-r border-[#334155]/50 bg-[#0F172A] z-50 fixed lg:static inset-y-0 left-0 lg:inset-auto shadow-2xl lg:shadow-none"
          >
            <div className="w-[280px] h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[#334155]/50">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-semibold text-sm text-white">Problems</h3>
                </div>
                <span className="text-xs text-gray-400 bg-[#1E293B]/50 px-2 py-0.5 rounded">{filteredProblems.length}</span>
              </div>

              {/* Filters */}
              <div className="p-3 border-b border-[#334155]/50 space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search problems..."
                    className="w-full h-8 pl-8 pr-2 rounded-lg bg-[#1E293B]/50 border border-[#334155]/30 text-xs text-gray-200 outline-none focus:border-indigo-500/50 placeholder-gray-500"
                  />
                </div>

                {/* Difficulty filter */}
                <div className="flex gap-1">
                  {['All', 'Easy', 'Medium', 'Hard'].map(f => (
                    <button
                      key={f}
                      onClick={() => setDifficultyFilter(f)}
                      className={cn(
                        "flex-1 px-2 py-1 text-[10px] rounded-lg transition-colors font-medium",
                        difficultyFilter === f
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "text-gray-500 hover:text-gray-200 hover:bg-[#1E293B]/50 border border-transparent"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Topic filter */}
                <select
                  value={topicFilter}
                  onChange={e => setTopicFilter(e.target.value)}
                  className="w-full h-7 text-[10px] rounded-lg bg-[#1E293B]/50 border border-[#334155]/30 text-gray-400 px-2 outline-none focus:border-indigo-500/50"
                >
                  <option value="All">All Topics</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                {/* Company filter */}
                <select
                  value={companyFilter}
                  onChange={e => setCompanyFilter(e.target.value)}
                  className="w-full h-7 text-[10px] rounded-lg bg-[#1E293B]/50 border border-[#334155]/30 text-gray-400 px-2 outline-none focus:border-indigo-500/50"
                >
                  <option value="All">All Companies</option>
                  {companyList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Problem list */}
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                  {filteredProblems.length === 0 && (
                    <p className="text-center text-gray-500 text-xs py-8">No problems match your filters</p>
                  )}
                  {filteredProblems.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { loadProblem(p.id); setSidebarOpen(false) }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3",
                        problem?.id === p.id
                          ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                          : "text-gray-400 hover:text-gray-200 hover:bg-[#1E293B]/50 border border-transparent"
                      )}
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        p.difficulty === 'Easy' ? 'bg-emerald-400' : p.difficulty === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className="truncate block text-xs">{p.title}</span>
                        <span className="text-[10px] text-gray-500">{p.topic} · {p.companyTags.slice(0, 2).join(', ')}{p.companyTags.length > 2 ? '...' : ''}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>

              {/* Company rounds */}
              <div className="p-3 border-t border-[#334155]/50">
                <button
                  onClick={() => setShowCompanyRounds(!showCompanyRounds)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[#1E293B]/50 transition-colors border border-[#334155]/30"
                >
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  Company-Specific Rounds
                  <ChevronRight className={cn("h-3 w-3 ml-auto transition-transform", showCompanyRounds && "rotate-90")} />
                </button>
                {showCompanyRounds && (
                  <div className="mt-2 space-y-1">
                    {companyList.map(c => (
                      <button
                        key={c}
                        onClick={() => startCompanyRound(c)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors",
                          companyFilter === c ? "bg-indigo-500/10 text-indigo-300" : "text-gray-400 hover:text-gray-200 hover:bg-[#1E293B]/50"
                        )}
                      >
                        {c} Round
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden flex-shrink-0 w-8 border-r border-[#334155]/50 lg:flex items-center justify-center hover:bg-[#1E293B]/50 transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4 text-gray-400" /> : <Menu className="h-4 w-4 text-gray-400" />}
      </button>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto px-3 py-2.5 sm:px-4 lg:px-6 lg:py-3 border-b border-[#334155]/50 bg-[#0F172A]/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-[#1E293B] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Code2 className="h-5 w-5 text-indigo-400 shrink-0" />
          <h1 className="font-semibold text-sm truncate text-white">{problem?.title || 'Coding Interview'}</h1>
          {problem && (
            <>
              <span className={cn("shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium border", DIFFICULTY_COLORS[problem.difficulty] || '')}>
                {problem.difficulty}
              </span>
              <span className="hidden sm:inline-flex shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20">
                {problem.topic}
              </span>
              <span className="text-[10px] text-gray-500 hidden md:inline">{problem.totalTestCaseCount} test cases · {problem.hiddenTestCaseCount} hidden</span>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            {session && (
              <CountdownTimer seconds={sessionTimer} onExpire={handleTimerExpire} />
            )}
            {!session ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleStartSession('TIMED', 30)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 transition-colors"
                >
                  <Timer className="h-3.5 w-3.5" />
                  30m
                </button>
                <button
                  onClick={() => handleStartSession('PRACTICE')}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  Start
                </button>
              </div>
            ) : (
              <button
                onClick={handleEndSession}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
              >
                End Session
              </button>
            )}
            <button
              onClick={() => setActiveTab(activeTab === 'submissions' ? 'problem' : 'submissions')}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[#1E293B]/50 border border-[#334155]/30 transition-colors"
            >
              <History className="h-3.5 w-3.5" />
              History
            </button>
          </div>
        </div>

        {activeTab === 'submissions' ? (
          <SubmissionHistoryView problemId={problem?.id} />
        ) : (
          <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
            {/* Left: Problem */}
            <div className="flex max-h-[40dvh] w-full flex-shrink-0 flex-col border-b border-[#334155]/50 lg:max-h-none lg:w-[40%] lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#334155]/30 bg-[#0F172A]/50">
                <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-400">Problem</span>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 sm:p-5 space-y-4">
                  <p className="text-sm leading-relaxed text-gray-300">{problem?.description}</p>

                  {problem && problem.examples && problem.examples.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Examples</h4>
                      <div className="space-y-2">
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 overflow-hidden">
                            <div className="p-3 space-y-2">
                              <div>
                                <span className="text-[10px] font-semibold uppercase text-gray-400">Input:</span>
                                <pre className="mt-0.5 text-xs bg-[#0B1121] rounded-lg p-2 overflow-x-auto text-gray-300 border border-[#334155]/20">{ex.input}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] font-semibold uppercase text-gray-400">Output:</span>
                                <pre className="mt-0.5 text-xs bg-[#0B1121] rounded-lg p-2 overflow-x-auto text-gray-300 border border-[#334155]/20">{ex.output}</pre>
                              </div>
                              {ex.explanation && <p className="text-xs text-gray-400">{ex.explanation}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {problem && problem.constraints && problem.constraints.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Constraints</h4>
                      <ul className="space-y-1.5">
                        {problem.constraints.map((c, i) => (
                          <li key={i} className="text-xs text-gray-400 flex items-start gap-2.5">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {problem && problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        Sample Test Cases
                        <span className="ml-2 text-[10px] text-gray-500 font-normal">({problem.hiddenTestCaseCount} hidden)</span>
                      </h4>
                      <div className="space-y-1.5">
                        {problem.visibleTestCases.map((tc, i) => (
                          <div key={tc.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E293B]/30 border border-[#334155]/20 text-xs">
                            <span className="text-gray-500">#{i + 1}:</span>
                            <span className="text-gray-400 font-mono">{tc.input.replace(/\n/g, ' ').substring(0, 40)}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-emerald-400 font-mono">{tc.expectedOutput.replace(/\n/g, '').substring(0, 20)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex items-center gap-2 overflow-x-auto p-3 border-t border-[#334155]/50 bg-[#0F172A]/80">
                <button
                  onClick={handleRun}
                  disabled={submitting}
                  className="inline-flex shrink-0 items-center justify-center h-9 px-4 rounded-xl text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                  Run & Submit
                </button>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="inline-flex shrink-0 items-center justify-center h-9 px-3 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setShowAiChat(!showAiChat)}
                  className="inline-flex shrink-0 items-center justify-center h-9 px-3 rounded-xl text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                >
                  <Bot className="h-3.5 w-3.5" />
                </button>
                {problem && (
                  <span className="ml-auto text-[10px] text-gray-500">
                    <Target className="h-3 w-3 inline mr-1" />
                    {problem.totalTestCaseCount} tests
                  </span>
                )}
              </div>
            </div>

            {/* Right: Editor */}
            <div className="flex flex-1 flex-col min-w-0 min-h-[24rem] bg-[#0B1121] lg:min-h-0">
              {/* Editor tabs */}
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#0F172A]/80 border-b border-[#334155]/50">
                <div className="flex items-center gap-1">
                  <FileCode className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-400 font-mono">solution.{LANGUAGES.find(l => l.id === language)?.ext}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="h-7 text-xs rounded-lg bg-[#1E293B]/50 border border-[#334155]/50 text-gray-300 px-2 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500/50"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 relative">
                {problem && (
                  <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    theme="coding-dark"
                    options={{
                      fontSize: 13,
                      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      padding: { top: 12 },
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: 'off',
                      bracketPairColorization: { enabled: true },
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      folding: true,
                      codeLens: true,
                      formatOnPaste: true,
                      formatOnType: true,
                      renderWhitespace: 'selection',
                    }}
                  />
                )}
              </div>

              {/* Submission status bar */}
              {submissionStatus && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 border-t border-[#334155]/30 text-xs",
                  submissionStatus === 'ACCEPTED' ? "bg-emerald-500/5 text-emerald-400" :
                  submissionStatus === 'WRONG_ANSWER' ? "bg-red-500/5 text-red-400" :
                  submissionStatus === 'ERROR' ? "bg-red-500/5 text-red-400" :
                  "bg-amber-500/5 text-amber-400"
                )}>
                  {submissionStatus === 'ACCEPTED' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                   submissionStatus === 'ERROR' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                   <XCircle className="h-3.5 w-3.5" />}
                  <span className="font-medium">
                    {submissionStatus === 'ACCEPTED' ? 'All tests passed!' :
                     submissionStatus === 'WRONG_ANSWER' ? `${passedCount}/${totalTests} tests passed` :
                     submissionStatus === 'ERROR' ? 'Error during execution' :
                     'Running tests...'}
                  </span>
                  <span className="ml-auto flex items-center gap-3">
                    {executionTime && <span className="text-gray-500">{executionTime.toFixed(1)}ms</span>}
                    {submissionResult?.memoryUsage && <span className="text-gray-500">{(submissionResult.memoryUsage / 1024).toFixed(1)}MB</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint Panel */}
      <AnimatePresence>
        {showHint && problem && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 inset-y-0 lg:static border-l border-[#334155]/50 bg-[#0F172A] z-50 shadow-2xl lg:shadow-none"
          >
            <div className="w-[300px] h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[#334155]/50">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h3 className="font-semibold text-sm text-white">Hint</h3>
                </div>
                <button onClick={() => setShowHint(false)} className="text-gray-400 hover:text-gray-200">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    {problem.solutionApproach || 'Think about using an efficient data structure to solve this problem optimally.'}
                  </p>
                </div>
                {problem.optimalComplexity && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-400">Expected Complexity</h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">Time: {problem.optimalComplexity.time}</span>
                      <span className="px-2 py-1 rounded text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">Space: {problem.optimalComplexity.space}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showAiChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 inset-y-0 lg:static border-l border-[#334155]/50 bg-[#0F172A] z-50 shadow-2xl lg:shadow-none"
          >
            <div className="w-[320px] h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[#334155]/50">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-purple-400" />
                  <h3 className="font-semibold text-sm text-white">AI Assistant</h3>
                </div>
                <button onClick={() => setShowAiChat(false)} className="text-gray-400 hover:text-gray-200">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {aiMessages.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                      <p className="text-xs text-gray-400">Ask me anything about this problem</p>
                    </div>
                  )}
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={cn("max-w-[85%] rounded-xl px-3 py-2 text-sm", msg.role === 'user'
                        ? "bg-indigo-500/20 text-indigo-200 border border-indigo-500/20"
                        : "bg-[#1E293B]/50 text-gray-200 border border-[#334155]/30"
                      )}>{msg.text}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-[#334155]/50 flex gap-2">
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !aiChatLoading && handleAiSend()}
                  placeholder="Ask a question..."
                  className="flex-1 h-9 rounded-xl border border-[#334155]/50 bg-[#1E293B]/50 px-3 text-sm text-gray-200 outline-none focus:border-indigo-500/50 placeholder-gray-500"
                  disabled={aiChatLoading}
                />
                <button onClick={handleAiSend} disabled={aiChatLoading} className="h-9 w-9 flex-shrink-0 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center hover:bg-indigo-500/30 transition-colors disabled:opacity-50">
                  {aiChatLoading ? <Loader2 className="h-4 w-4 text-indigo-300 animate-spin" /> : <Send className="h-4 w-4 text-indigo-300" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowResults(false)}>
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0F172A] border border-[#334155]/50 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-white">Submission Results</h2>
                  <div className="flex items-center gap-2">
                    {submissionStatus === 'ACCEPTED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 inline mr-1" />All Tests Passed
                      </span>
                    )}
                    {submissionStatus === 'WRONG_ANSWER' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium border text-rose-400 bg-rose-500/10 border-rose-500/20">
                        <XCircle className="h-3 w-3 inline mr-1" />{passedCount}/{totalTests} Passed
                      </span>
                    )}
                    {submissionStatus === 'ERROR' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium border text-rose-400 bg-rose-500/10 border-rose-500/20">
                        <AlertTriangle className="h-3 w-3 inline mr-1" />Execution Error
                      </span>
                    )}
                    <span className="text-xs text-gray-500 font-mono">Score: {submissionResult?.score ?? 0}%</span>
                  </div>
                </div>

                {/* Test results */}
                {testResults && testResults.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Test Cases</h4>
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(5, testResults.length)}, minmax(0, 1fr))` }}>
                      {testResults.map((r, i) => (
                        <div key={i} className={cn(
                          "flex items-center gap-1.5 rounded-lg border p-2.5 text-xs",
                          r.passed ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10"
                        )}>
                          {r.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <XCircle className="h-3.5 w-3.5 text-red-400" />}
                          <span className="text-gray-300">Test {i + 1}</span>
                          {r.isHidden && <span className="text-[8px] text-gray-500 ml-auto">H</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {submissionResult?.error && (
                  <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-sm font-medium text-red-300">Execution Error</h5>
                        <pre className="mt-1 text-xs text-red-200/80 whitespace-pre-wrap font-mono">{submissionResult.error}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complexity & Score */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-3 flex flex-col items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Time</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {feedback?.timeComplexity || problem?.optimalComplexity?.time || 'O(n)'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-3 flex flex-col items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Space</span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      {feedback?.spaceComplexity || problem?.optimalComplexity?.space || 'O(n)'}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-3 flex flex-col items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Quality</span>
                    <CircularGauge value={feedback?.codeQuality || 0} size={48} strokeWidth={5} />
                  </div>
                  <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-3 flex flex-col items-center gap-1.5">
                    <Cpu className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Memory</span>
                    <span className="text-sm font-bold text-blue-400">{submissionResult?.memoryUsage ? `${(submissionResult.memoryUsage / 1024).toFixed(1)}MB` : 'N/A'}</span>
                  </div>
                  <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-3 flex flex-col items-center gap-1.5">
                    <Terminal className="h-4 w-4 text-gray-400" />
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Score</span>
                    <span className={cn(
                      "text-lg font-bold",
                      (submissionResult?.score ?? 0) >= 70 ? "text-emerald-400" :
                      (submissionResult?.score ?? 0) >= 40 ? "text-amber-400" : "text-rose-400"
                    )}>{submissionResult?.score ?? 0}%</span>
                  </div>
                </div>

                {/* AI Feedback */}
                {feedback && (
                  <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-400" />
                      <h3 className="text-sm font-medium text-purple-300">AI Reviewer</h3>
                    </div>
                    {feedback.suggestions.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Suggestions</h4>
                        {feedback.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <Sparkles className="h-3.5 w-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {feedback.optimizedApproach && (
                      <div className="flex items-start gap-2 text-xs">
                        <Lightbulb className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feedback.optimizedApproach}</span>
                      </div>
                    )}
                    {feedback.edgeCasesMissed.length > 0 && (
                      <div className="space-y-1.5">
                        <h4 className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Edge Cases to Consider</h4>
                        {feedback.edgeCasesMissed.map((e, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{e}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SubmissionHistoryView({ problemId }: { problemId?: string }) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const res = await getSubmissionsApi({ problemId, limit: '20' })
      if (res.data) setSubmissions(res.data.submissions)
      setLoading(false)
    }
    fetch()
  }, [problemId])

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="text-sm font-semibold text-white mb-4">Submission History</h3>
      {submissions.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No submissions yet. Solve a problem to see history.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map(s => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1E293B]/30 border border-[#334155]/30 hover:bg-[#1E293B]/50 transition-colors">
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                s.status === 'ACCEPTED' ? 'bg-emerald-400' : s.status === 'WRONG_ANSWER' ? 'bg-rose-400' : 'bg-amber-400'
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{s.problem?.title || 'Unknown Problem'}</p>
                <p className="text-xs text-gray-500">
                  {s.language} · {s.passedTestCases}/{s.totalTestCases} passed · Score: {s.score ?? '-'}%
                </p>
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium",
                s.status === 'ACCEPTED' ? "text-emerald-400 bg-emerald-500/10" :
                s.status === 'WRONG_ANSWER' ? "text-rose-400 bg-rose-500/10" : "text-amber-400 bg-amber-500/10"
              )}>{s.status}</span>
              <span className="text-xs text-gray-500">{new Date(s.submittedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
