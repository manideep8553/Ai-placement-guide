import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { getCompaniesApi, startInterviewApi, endInterviewApi, type CompanyData } from '@/services/api'

const mockQuestions = {
  HR: ["Tell me about yourself", "Why do you want to work here?", "What are your strengths and weaknesses?"],
  TECHNICAL: ["Explain REST API principles", "What is the difference between SQL and NoSQL?", "Explain OOP concepts"],
  MANAGER: ["How do you handle team conflicts?", "Describe your leadership style", "How do you prioritize tasks?"],
}

const mockTranscriptLines = [
  "umm, I think that my biggest strength is my ability to learn quickly and adapt to new situations.",
  "I have worked on ah several projects where I had to collaborate with cross-functional teams.",
  "like, I was responsible for leading the team through a major migration project.",
  "My approach to problem-solving is umm to first understand the root cause before jumping in.",
  "I believe that ah communication is key in any team environment, especially during conflicts.",
  "The biggest challenge was like coordinating between different stakeholders with conflicting priorities.",
  "We managed to umm deliver the project on time despite the tight deadlines.",
  "I would say my leadership style is ah collaborative and focused on empowering team members.",
]

const fillerWordTypes = ["umm", "ah", "like"] as const
const wpmSegments = [98, 132, 145, 118, 156, 142, 128, 150]
const keywordCoverageItems = ["teamwork", "leadership", "problem-solving", "communication", "technical skills"]

const interviewTypeConfig = {
  HR: { label: "HR Round", desc: "Behavioral & cultural fit questions", icon: "👤", gradient: "from-blue-600/20 to-indigo-600/20", border: "border-blue-500/50" },
  TECHNICAL: { label: "Technical Round", desc: "DSA, system design & core concepts", icon: "💻", gradient: "from-emerald-600/20 to-teal-600/20", border: "border-emerald-500/50" },
  MANAGER: { label: "Manager Round", desc: "Leadership, strategy & team management", icon: "🎯", gradient: "from-violet-600/20 to-purple-600/20", border: "border-violet-500/50" },
}

export default function MockInterview() {
  useAuthStore()
  const navigate = useNavigate()
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [interviewType, setInterviewType] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [fillerWords, setFillerWords] = useState({ umm: 0, ah: 0, like: 0 })
  const [wpm, setWpm] = useState(120)
  const [transcript, setTranscript] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [companies, setCompanies] = useState<CompanyData[]>([])


  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const result = await getCompaniesApi()
      if (result.data) setCompanies(result.data)
    }
    init()
  }, [])

  const questions = interviewType ? mockQuestions[interviewType as keyof typeof mockQuestions] : []
  const typeConfig = interviewType ? interviewTypeConfig[interviewType as keyof typeof interviewTypeConfig] : null

  const overallScore = 78
  const confidenceScore = 72
  const keywordCoverage = 65
  const avgWpm = Math.round(wpmSegments.reduce((a, b) => a + b, 0) / wpmSegments.length)

  useEffect(() => {
    if (!sessionActive) return
    const timer = setInterval(() => setElapsed(t => t + 1), 1000)
    return () => clearInterval(timer)
  }, [sessionActive])

  useEffect(() => {
    if (!sessionActive) return
    const interval = setInterval(() => {
      setTranscript(prev => [...prev, mockTranscriptLines[prev.length % mockTranscriptLines.length]])
      setWpm(prev => Math.max(80, Math.min(180, prev + (Math.random() > 0.5 ? 8 : -5))))
      setFillerWords(prev => {
        const type = fillerWordTypes[Math.floor(Math.random() * fillerWordTypes.length)]
        return { ...prev, [type]: prev[type] + 1 }
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [sessionActive])

  useEffect(() => {
    if (!sessionActive || !questions.length) return
    const qInterval = setInterval(() => {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))
    }, 8000)
    return () => clearInterval(qInterval)
  }, [sessionActive, questions.length])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStart = async () => {
    if (!interviewType || !selectedCompany) return
    const result = await startInterviewApi({ type: interviewType, company: selectedCompany })
    if (result.data) {
      setSessionId(result.data.sessionId)
    }
    setSessionActive(true)
    setElapsed(0)
    setTranscript([])
    setCurrentQuestionIndex(0)
    setFillerWords({ umm: 0, ah: 0, like: 0 })
    setWpm(120)
  }

  const handleEnd = async () => {
    if (sessionId) {
      await endInterviewApi(sessionId, { duration: elapsed })
    }
    setSessionActive(false)
    setShowFeedback(true)
  }

  const handleRestart = () => {
    setShowFeedback(false)
    setSessionActive(false)
    setInterviewType(null)
    setSelectedCompany("")
    setElapsed(0)
    setTranscript([])
    setFillerWords({ umm: 0, ah: 0, like: 0 })
    setWpm(120)
    setCurrentQuestionIndex(0)
  }

  const highlightFiller = (text: string) => {
    const regex = /\b(umm|ah|like)\b/gi
    const parts = text.split(regex)
    return parts.map((part, i) => {
      if (fillerWordTypes.includes(part.toLowerCase() as any)) {
        return <span key={i} className="bg-rose-500/30 text-rose-300 px-1 rounded font-medium">{part}</span>
      }
      return part
    })
  }

  if (showFeedback) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-white">Interview Complete</h1>
              <p className="text-gray-400 mt-1">{interviewType} Round · {selectedCompany} · Duration: {formatTime(elapsed)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/interview-replay', {
                  state: {
                    interviewType,
                    selectedCompany,
                    elapsed,
                    fillerWords,
                    wpm,
                    transcript,
                    questions: mockQuestions[interviewType as keyof typeof mockQuestions] || [],
                    overallScore,
                  }
                })}
                className="px-6 py-3 rounded-2xl bg-[#1E293B] border border-[#334155] text-gray-300 font-semibold hover:bg-white/5 transition-all"
              >
                View Replay
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all"
              >
                Start New Interview
              </button>
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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  confidenceScore >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {confidenceScore >= 70 ? 'Confident' : 'Nervous'}
                </span>
              </div>
              <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${confidenceScore}%` }} />
              </div>
              <p className="text-gray-400 text-xs mt-3">Voice tone &amp; pacing analysis</p>
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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  keywordCoverage >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {keywordCoverage >= 70 ? 'Great' : 'Average'}
                </span>
              </div>
              <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${keywordCoverage}%` }} />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {keywordCoverageItems.map(k => (
                  <span key={k} className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-rose-400 text-lg">⚠️</span>
              <h3 className="text-white font-semibold">Filler Word Heatmap</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">Words to avoid in your speech</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-sm bg-rose-500/20 text-rose-400 border border-rose-500/30">umm: {fillerWords.umm}</span>
              <span className="px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">ah: {fillerWords.ah}</span>
              <span className="px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">like: {fillerWords.like}</span>
            </div>
            <div className="bg-[#0F172A]/80 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
              {[
                "umm, I think that my biggest strength is...",
                "I have worked on ah several projects where...",
                "like, I was responsible for leading the team...",
                "My approach to problem-solving is umm to first...",
                "I believe that ah communication is key in...",
                "The biggest challenge was like coordinating...",
                "We managed to umm deliver the project on time...",
                "I would say my leadership style is ah collaborative...",
              ].map((line, i) => (
                <p key={i} className="text-sm text-gray-300 leading-relaxed">{highlightFiller(line)}</p>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-400 text-lg">📊</span>
                <h3 className="text-white font-semibold">Pace Analysis</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Speaking speed (WPM) over time</p>
              <div className="space-y-3">
                {wpmSegments.map((val, i) => {
                  const pct = (val / 180) * 100
                  const inRange = val >= 120 && val <= 150
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-8 shrink-0">T{i + 1}</span>
                      <div className="flex-1 h-5 bg-[#0F172A] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${inRange ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono w-10 text-right shrink-0 ${inRange ? 'text-emerald-400' : 'text-amber-400'}`}>{val}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#334155]/50 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Target (120-150)</span>
                <span>Avg: {avgWpm} WPM</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
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
                  "Structure answers using the STAR method (Situation, Task, Action, Result).",
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

  if (sessionActive) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl px-6 py-3"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⏱️</span>
              <span className="text-xl font-mono font-bold tabular-nums text-white">{formatTime(elapsed)}</span>
            </div>
            <div className="h-6 w-px bg-[#334155]/50" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {typeConfig?.label || interviewType} Round
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0F172A] text-gray-300 border border-[#334155]/50">
              {selectedCompany}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Recording
            </div>
            <button
              onClick={handleEnd}
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
              End Interview
            </button>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <div className="w-[70%] space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="relative flex items-center gap-5 p-6 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20">
                  <div className="relative shrink-0">
                    <motion.div
                      className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                      animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                      transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
                      style={{ filter: "blur(1px)" }}
                    />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#0F172A] border-2 border-[#334155]/50">
                      <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">AI Interviewer</h3>
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      {currentQuestionIndex < questions.length
                        ? `"${questions[currentQuestionIndex]}"`
                        : "That concludes the interview. Thank you!"}
                    </p>
                  </div>
                  <motion.div
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-emerald-400">Speaking</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 px-6 pt-4 pb-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <h3 className="text-sm font-medium text-white">Live Transcript</h3>
                <span className="text-xs text-gray-400 font-normal ml-auto">{transcript.length} lines</span>
              </div>
              <div className="px-6 pb-4">
                <div
                  ref={transcriptRef}
                  className="bg-[#0F172A]/80 rounded-xl p-4 h-64 overflow-y-auto space-y-2"
                >
                  {transcript.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      Waiting for speech...
                    </div>
                  ) : (
                    transcript.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm text-gray-300 leading-relaxed"
                      >
                        <span className="text-gray-400 mr-2 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                        {highlightFiller(line)}
                      </motion.p>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[30%] space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#0F172A] flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <p className="text-gray-500 text-sm">Camera Placeholder</p>
                  </div>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] bg-[#0F172A] text-gray-400 border border-[#334155]/50">
                    Disabled
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                  <span className="text-rose-400">⚠️</span> Filler Word Counter
                </h3>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30">umm: {fillerWords.umm}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">ah: {fillerWords.ah}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">like: {fillerWords.like}</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                  <span className="text-indigo-400">📈</span> Speaking Speed
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-white">{wpm}</span>
                  <span className="text-xs text-gray-400">WPM</span>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${
                    wpm >= 120 && wpm <= 150 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {wpm >= 120 && wpm <= 150 ? 'Optimal' : wpm > 150 ? 'Fast' : 'Slow'}
                  </span>
                </div>
                <div className="h-2.5 bg-[#0F172A] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wpm >= 120 && wpm <= 150 ? 'bg-emerald-500' : wpm > 150 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, (wpm / 150) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1.5">
                  <span>Slow</span>
                  <span className="text-emerald-400 font-medium">Target: 120-150</span>
                  <span>Fast</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-4">
                <h3 className="text-sm font-medium text-white flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  Current Question
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed min-h-[2.5rem]">
                  {currentQuestionIndex < questions.length
                    ? `Q${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`
                    : "All questions completed."}
                </p>
                <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#334155]/50">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i < currentQuestionIndex ? 'bg-indigo-500' : i === currentQuestionIndex ? 'bg-indigo-500/60' : 'bg-[#0F172A]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 mb-2">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </div>
        <h1 className="text-4xl font-bold text-white">Voice Mock Interview</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Practice with AI-powered voice interviews. Choose your round type and company to get started.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-indigo-400 text-lg">🧠</span>
            <h2 className="text-white font-semibold">Select Interview Round</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">Choose the type of interview round you want to practice</p>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(interviewTypeConfig).map(([type, config]) => {
              const isHR = type === "HR"
              return (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 bg-gradient-to-br ${config.gradient} ${
                    interviewType === type
                      ? isHR
                        ? 'border-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)] before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-blue-500 before:via-indigo-500 before:to-purple-500 before:-z-10 before:content-[""] before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]'
                        : `${config.border} shadow-lg ring-1 ring-white/10`
                      : 'border-[#334155]/50 hover:border-white/30'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{config.icon}</span>
                  <h3 className="font-semibold text-sm text-white">{config.label}</h3>
                  <p className="text-xs text-gray-400 mt-1">{config.desc}</p>
                </button>
              )
            })}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="bg-[#1E293B]/50 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-indigo-400 text-lg">🎯</span>
            <h2 className="text-white font-semibold">Select Company</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">Choose the company you want to interview for</p>
          <select
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
            className="w-full bg-[#0F172A]/80 border border-[#334155]/50 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a company...</option>
            {(companies.length ? companies : []).map(c => (
              <option key={c.name} value={c.name}>
                {c.logo} {c.name} - {c.difficulty}
              </option>
            ))}
          </select>
          {selectedCompany && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-gray-400 mt-3"
            >
              Preparing {interviewType || "selected"} round for {selectedCompany}
            </motion.p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          disabled={!interviewType || !selectedCompany}
          onClick={handleStart}
          className="h-14 px-10 text-base font-semibold rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          Start Interview
        </button>
      </motion.div>
    </div>
  )
}
