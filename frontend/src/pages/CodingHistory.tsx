import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSubmissionsApi, getCodingSessionsApi, getCodingStatsApi, type CodingSubmissionData, type CodingSessionData, type CodingStatsData } from '@/services/api'
import { cn } from '@/lib/utils'
import {
  Code2, CheckCircle2, Clock, Loader2, BarChart3, Target,
  TrendingUp, ChevronRight, Filter, Terminal, Brain, PieChart
} from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  ACCEPTED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  WRONG_ANSWER: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  ERROR: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  RUNNING: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function CodingHistory() {
  const [activeTab, setActiveTab] = useState<'stats' | 'submissions' | 'sessions'>('stats')
  const [stats, setStats] = useState<CodingStatsData | null>(null)
  const [submissions, setSubmissions] = useState<CodingSubmissionData[]>([])
  const [sessions, setSessions] = useState<CodingSessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchAll() {
      const [statsRes, submissionsRes, sessionsRes] = await Promise.all([
        getCodingStatsApi(),
        getSubmissionsApi({ page: '1', limit: '20' }),
        getCodingSessionsApi(),
      ])
      if (statsRes.data) setStats(statsRes.data)
      if (submissionsRes.data) {
        setSubmissions(submissionsRes.data.submissions)
        setTotalPages(Math.ceil(submissionsRes.data.total / 20))
      }
      if (sessionsRes.data) setSessions(sessionsRes.data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  async function fetchSubmissions(p: number) {
    setLoading(true)
    const params: any = { page: String(p), limit: '20' }
    if (statusFilter !== 'All') params.status = statusFilter
    const res = await getSubmissionsApi(params)
    if (res.data) {
      setSubmissions(res.data.submissions)
      setTotalPages(Math.ceil(res.data.total / 20))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSubmissions(page)
  }, [page, statusFilter])

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Coding History</h1>
          <p className="text-sm text-gray-400 mt-1">Track your coding progress and review past submissions</p>
        </div>
        <Link
          to="/coding-interview"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
        >
          <Code2 className="h-4 w-4" />
          Practice Now
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Terminal className="h-4 w-4" />
              <span className="text-xs font-medium">Total Submissions</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalSubmissions}</p>
          </div>
          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.acceptedSubmissions}</p>
          </div>
          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats.successRate}%</p>
          </div>
          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Brain className="h-4 w-4" />
              <span className="text-xs font-medium">Problems Solved</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">{stats.uniqueProblemsSolved}</p>
          </div>
        </div>
      )}

      {/* Topic & Difficulty breakdown */}
      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-400" />
              Performance by Topic
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.topicPerformance).map(([topic, data]) => (
                <div key={topic} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 w-28 shrink-0">{topic}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#0B1121] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${data.attempted > 0 ? (data.passed / data.attempted) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-16 text-right">{data.passed}/{data.attempted}</span>
                </div>
              ))}
              {Object.keys(stats.topicPerformance).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#1E293B]/50 border border-[#334155]/30 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-400" />
              Performance by Difficulty
            </h3>
            <div className="space-y-3">
              {['Easy', 'Medium', 'Hard'].map(diff => {
                const data = stats.difficultyBreakdown[diff]
                if (!data) return null
                return (
                  <div key={diff} className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs font-medium w-14 shrink-0",
                      diff === 'Easy' ? 'text-emerald-400' : diff === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    )}>{diff}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#0B1121] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", diff === 'Easy' ? 'bg-emerald-500' : diff === 'Medium' ? 'bg-amber-500' : 'bg-rose-500')}
                        style={{ width: `${data.attempted > 0 ? (data.passed / data.attempted) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-24 text-right">{data.passed}/{data.attempted} passed</span>
                  </div>
                )
              })}
              {Object.keys(stats.difficultyBreakdown).length === 0 && (
                <p className="text-xs text-gray-500 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#334155]/50">
        {([
          { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
          { id: 'submissions' as const, label: 'Submissions', icon: Code2 },
          { id: 'sessions' as const, label: 'Practice Sessions', icon: Clock },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1) }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "text-indigo-400 border-indigo-400"
                : "text-gray-400 border-transparent hover:text-gray-200"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {['All', 'ACCEPTED', 'WRONG_ANSWER', 'ERROR'].map(f => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setPage(1) }}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium transition-colors border",
                  statusFilter === f
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#1E293B]/50 border-[#334155]/30"
                )}
              >
                {f === 'All' ? 'All' : f === 'ACCEPTED' ? 'Accepted' : f === 'WRONG_ANSWER' ? 'Wrong' : 'Error'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
          ) : submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No submissions found</p>
          ) : (
            <div className="space-y-2">
              {submissions.map(s => (
                <SubmissionCard key={s.id} submission={s} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium border transition-colors",
                    page === i + 1
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      : "text-gray-400 border-[#334155]/30 hover:bg-[#1E293B]/50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No practice sessions yet</p>
          ) : (
            sessions.map(s => (
              <div key={s.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-[#1E293B]/30 border border-[#334155]/30 hover:bg-[#1E293B]/50 transition-colors">
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  s.status === 'COMPLETED' ? 'bg-emerald-400' : s.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-gray-500'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200">{s.title || `${s.type} Session`}</p>
                  <p className="text-xs text-gray-500">
                    {s.company && `${s.company} · `}{s.difficulty && `${s.difficulty} · `}
                    {s._count?.submissions ?? s.problemCount ?? 0} problems · Score: {s.score ?? '-'}%
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(s.startedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SubmissionCard({ submission }: { submission: CodingSubmissionData }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl bg-[#1E293B]/30 border border-[#334155]/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1E293B]/50 transition-colors text-left"
      >
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", submission.status === 'ACCEPTED' ? 'bg-emerald-400' : submission.status === 'WRONG_ANSWER' ? 'bg-rose-400' : 'bg-amber-400')} />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 truncate">{submission.problem?.title || 'Unknown Problem'}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{submission.language}</span>
            <span>·</span>
            <span>{submission.passedTestCases}/{submission.totalTestCases} passed</span>
            {submission.score !== null && <><span>·</span><span>Score: {submission.score}%</span></>}
            {submission.executionTime && <><span>·</span><span>{submission.executionTime.toFixed(1)}ms</span></>}
          </div>
        </div>
        <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium border", STATUS_STYLES[submission.status] || 'text-gray-400 bg-gray-500/10 border-gray-500/20')}>
          {submission.status}
        </span>
        <span className="text-xs text-gray-500 hidden sm:block">
          {new Date(submission.submittedAt).toLocaleDateString()}
        </span>
        <ChevronRight className={cn("h-4 w-4 text-gray-500 transition-transform", expanded && "rotate-90")} />
      </button>

      {expanded && submission.aiFeedback && (
        <div className="px-4 pb-4 pt-0 border-t border-[#334155]/30">
          <div className="mt-3 space-y-2">
            {submission.aiFeedback.suggestions?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Suggestions</p>
                {submission.aiFeedback.suggestions.map((s, i) => (
                  <p key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {s}
                  </p>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {submission.aiFeedback.timeComplexity && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Time: {submission.aiFeedback.timeComplexity}
                </span>
              )}
              {submission.aiFeedback.spaceComplexity && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Space: {submission.aiFeedback.spaceComplexity}
                </span>
              )}
              {submission.aiFeedback.codeQuality && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20">
                  Quality: {submission.aiFeedback.codeQuality}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
