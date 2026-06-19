import { useState, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, FileText, BarChart3, MessageSquare,
  EyeOff, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { mockReplayQuestions } from '@/data/mockData'
import ReplayQuestionCard from '@/components/interview/ReplayQuestionCard'
import ReplaySidebar from '@/components/interview/ReplaySidebar'
import ReplayFilters, { type FilterType } from '@/components/interview/ReplayFilters'

interface SessionData {
  interviewType: string;
  selectedCompany: string;
  elapsed: number;
  fillerWords: { umm: number; ah: number; like: number };
  wpm: number;
  transcript: string[];
  questions: string[];
  overallScore: number;
}

function CircularGauge({ value, size = 100 }: { value: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = value > 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#F43F5E'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
    </div>
  )
}

export default function InterviewReplay() {
  const location = useLocation()
  const navigate = useNavigate()
  const sessionData = location.state as SessionData | null
  const contentRef = useRef<HTMLDivElement>(null)

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [activeIndex, setActiveIndex] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAggregate, setShowAggregate] = useState(false)

  const interviewType = sessionData?.interviewType || 'HR'
  const allQuestions = mockReplayQuestions[interviewType] || mockReplayQuestions.HR

  const confidenceScore = 72
  const keywordCoverage = 65
  const avgWpm = sessionData?.wpm || 130
  const overallScore = sessionData?.overallScore || 78
  const fillerWords = sessionData?.fillerWords || { umm: 8, ah: 5, like: 3 }

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.userAnswer.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' ||
        (filter === 'strong' && q.overallScore >= 75) ||
        (filter === 'average' && q.overallScore >= 50 && q.overallScore < 75) ||
        (filter === 'weak' && q.overallScore < 50)
      return matchesSearch && matchesFilter
    })
  }, [allQuestions, search, filter])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleExport = () => {
    const reportData = {
      interview: { type: interviewType, company: sessionData?.selectedCompany || 'N/A', duration: sessionData?.elapsed || 0 },
      overallScore,
      questions: allQuestions,
      fillerWords,
      wpm: avgWpm,
      date: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `interview-replay-${interviewType.toLowerCase()}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const strongCount = allQuestions.filter(q => q.overallScore >= 75).length
  const averageCount = allQuestions.filter(q => q.overallScore >= 50 && q.overallScore < 75).length
  const weakCount = allQuestions.filter(q => q.overallScore < 50).length

  if (showAggregate) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setShowAggregate(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-white">Final Report</h1>
              </div>
              <p className="text-gray-400 mt-1 ml-9">{interviewType} Round · {sessionData?.selectedCompany || 'N/A'} · Duration: {sessionData?.elapsed ? formatTime(sessionData.elapsed) : 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-8 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#818cf8" strokeWidth="8" strokeDasharray={`${overallScore * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <span className="text-4xl font-bold text-white">{overallScore}</span>
                    <span className="text-gray-400 block text-sm">/100</span>
                  </div>
                </div>
              </div>
              <h3 className="text-white font-semibold mt-4">Overall Score</h3>
              <p className="text-gray-400 text-sm">Performance rating</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-400 text-lg">🧠</span>
                <h3 className="text-white font-semibold">Confidence Score</h3>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-white">{confidenceScore}%</span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium",
                  confidenceScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                )}>
                  {confidenceScore >= 70 ? 'Confident' : 'Nervous'}
                </span>
              </div>
              <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${confidenceScore}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-3">Voice tone & pacing analysis</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-400 text-lg">🎯</span>
                <h3 className="text-white font-semibold">Keyword Coverage</h3>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-white">{keywordCoverage}%</span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium",
                  keywordCoverage >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                )}>
                  {keywordCoverage >= 70 ? 'Great' : 'Average'}
                </span>
              </div>
              <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${keywordCoverage}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {["teamwork", "leadership", "problem-solving", "communication", "technical skills"].map(k => (
                  <span key={k} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">{k}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-rose-400 text-lg">⚠️</span>
                <h3 className="text-white font-semibold">Filler Word Analysis</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Words to avoid in your speech</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm bg-rose-500/20 text-rose-400 border border-rose-500/30">umm: {fillerWords.umm}</span>
                <span className="px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">ah: {fillerWords.ah}</span>
                <span className="px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">like: {fillerWords.like}</span>
              </div>
              <div className="bg-[#0F172A]/80 rounded-xl p-4 space-y-2 max-h-36 overflow-y-auto">
                {(sessionData?.transcript || ["Sample transcript line 1", "Sample transcript line 2"]).slice(0, 6).map((line, i) => (
                  <p key={i} className="text-sm text-gray-300 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-emerald-400 text-lg">✅</span>
                <h3 className="text-white font-semibold">Suggested Improvements</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Reduce filler words like 'umm' and 'ah' — pause instead.",
                  "Maintain a steady pace between 120-150 WPM for clarity.",
                  "Use more concrete examples from past experiences.",
                  "Structure answers using the STAR method.",
                  "Maintain consistent eye contact with the camera.",
                  "Practice answering within 60-90 seconds per question.",
                  "Include relevant keywords from the job description.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium mt-0.5">{i + 1}</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mock-interview')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Interview Replay</h1>
              <p className="text-sm text-gray-400">
                {interviewType} Round · {sessionData?.selectedCompany || 'N/A'} · {formatTime(sessionData?.elapsed || 0)} duration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAggregate(true)}
              className="border-[#334155] text-gray-300 hover:text-white hover:bg-indigo-500/10"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Final Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-[#334155] text-gray-300 hover:text-white hover:bg-indigo-500/10"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 flex items-center gap-3">
          <CircularGauge value={overallScore} />
          <div>
            <p className="text-sm text-gray-400">Overall Score</p>
            <p className="text-xl font-bold text-white">{overallScore}%</p>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Strong</p>
            <p className="text-xl font-bold text-emerald-400">{strongCount}</p>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Average</p>
            <p className="text-xl font-bold text-amber-400">{averageCount}</p>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Weak</p>
            <p className="text-xl font-bold text-rose-400">{weakCount}</p>
          </div>
        </div>
      </div>

      <ReplayFilters search={search} onSearchChange={setSearch} filter={filter} onFilterChange={setFilter} />

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="flex-1 space-y-3" ref={contentRef}>
          {filteredQuestions.length === 0 ? (
            <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No questions found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredQuestions.map((q, i) => (
              <ReplayQuestionCard key={q.id} question={q} index={i} />
            ))
          )}
        </div>

        <div className="hidden lg:flex flex-col gap-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg bg-[#1E293B]/80 border border-[#334155]/50 text-gray-400 hover:text-white transition-colors self-end"
          >
            {sidebarCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <ReplaySidebar
            questions={filteredQuestions}
            activeIndex={activeIndex}
            onSelect={(i) => {
              setActiveIndex(i)
              const el = contentRef.current?.children[i] as HTMLElement
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            collapsed={sidebarCollapsed}
          />
        </div>
      </div>
    </div>
  )
}

