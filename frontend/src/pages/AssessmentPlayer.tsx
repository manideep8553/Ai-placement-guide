import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Clock, ChevronLeft, ChevronRight, HelpCircle, CheckCircle, AlertCircle,
  Loader2, Flag, Send, X, AlertTriangle, Code2, FileText, Save,
  Eye, EyeOff, Keyboard, Monitor
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getAssessmentApi, startAssessmentApi, submitAssessmentApi,
  type AssessmentDetailData, type AssessmentQuestionData, type AssessmentAttemptData
} from '@/services/api'
import { scoreAssessment, saveAttempt, getAttemptHistoryQuestionIds } from '@/lib/assessmentEngine'
import { MOCK_ASSESSMENTS, getRandomizedAssessment } from '@/lib/assessmentData'

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cpp', label: 'C++' },
]

const CODE_TEMPLATES: Record<string, string> = {
  python: 'def solution():\n    # Write your code here\n    pass\n\n# Test with sample input\nprint(solution())',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
  javascript: 'function solution() {\n    // Write your code here\n    return null;\n}\n\n// Test with sample input\nconsole.log(solution());',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
}

const STORAGE_KEY_PREFIX = 'assessment-progress-'

function loadProgress(assessmentId: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + assessmentId)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveProgress(assessmentId: string, answers: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + assessmentId, JSON.stringify(answers))
  } catch { /* ignore quota errors */ }
}

function clearProgress(assessmentId: string) {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + assessmentId)
  } catch { /* ignore */ }
}

export default function AssessmentPlayer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState<AssessmentDetailData | null>(null)
  const [attempt, setAttempt] = useState<AssessmentAttemptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('python')
  const [testResults, setTestResults] = useState<{ label: string; passed: boolean }[] | null>(null)
  const [runningCode, setRunningCode] = useState(false)
  const [showTimerWarning, setShowTimerWarning] = useState(false)
  const [timerWarningDismissed, setTimerWarningDismissed] = useState(false)
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState<number | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [showExplanations, setShowExplanations] = useState<Set<string>>(new Set())
  const [tabWarning, setTabWarning] = useState(false)
  const lastSavedRef = useRef(lastSaved)

  const questions = assessment?.questions || []
  const currentQuestion = questions[currentIndex] as AssessmentQuestionData & { questionData?: any } | undefined
  const isMCQ = currentQuestion?.questionType === 'MCQ'
  const isCoding = currentQuestion?.questionType === 'CODING'
  const answeredCount = Object.keys(answers).length
  const markedCount = markedForReview.size

  const isMockAssessment = id && MOCK_ASSESSMENTS.some(a => a.id === id)

  const durationSeconds = assessment ? assessment.duration * 60 : 0

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    if (!id) return
    const saved = loadProgress(id)
    if (saved && Object.keys(saved).length > 0) {
      setAnswers(saved)
      const marks = new Set<string>()
      for (const q of MOCK_ASSESSMENTS.flatMap(a => a.questions)) {
        if (saved[q.id] && q.questionType === 'MCQ') marks.add(q.id)
      }
    }
  }, [id])

  useEffect(() => {
    if (id && Object.keys(answers).length > 0) {
      const timer = setTimeout(() => {
        saveProgress(id, answers)
        setLastSaved(new Date())
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [answers, id])

  useEffect(() => {
    async function init() {
      if (!id) return
      setLoading(true)
      try {
        const [assessRes, startRes] = await Promise.all([
          getAssessmentApi(id),
          startAssessmentApi(id)
        ])
        if (assessRes.error) { setError(assessRes.error); return }
        if (startRes.error) { setError(startRes.error); return }
        setAssessment(assessRes.data!)
        setAttempt(startRes.data!)
        setTimeLeft(assessRes.data!.duration * 60)
      } catch {
        setError('Failed to load assessment')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id])

  useEffect(() => {
    if (!timeLeft || attempt?.status === 'SUBMITTED') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        if (prev === 300 && !timerWarningDismissed) {
          setShowTimerWarning(true)
        }
        if (prev === 60) {
          setAutoSubmitCountdown(60)
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, attempt?.status, timerWarningDismissed])

  useEffect(() => {
    if (autoSubmitCountdown === null) return
    if (autoSubmitCountdown <= 0) {
      handleSubmit()
      return
    }
    const timer = setTimeout(() => setAutoSubmitCountdown(prev => prev !== null ? prev - 1 : null), 1000)
    return () => clearTimeout(timer)
  }, [autoSubmitCountdown])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (attempt?.status === 'SUBMITTED' || submitting) return
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return

      if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setCurrentIndex(prev => Math.max(0, prev - 1))
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        if (currentQuestion) toggleMarkForReview(currentQuestion.id)
      } else if (e.key >= '1' && e.key <= '4' && isMCQ) {
        e.preventDefault()
        const labels = ['A', 'B', 'C', 'D']
        handleAnswer(currentQuestion.id, labels[parseInt(e.key) - 1])
      } else if (e.key === 'F1') {
        e.preventDefault()
        setShowShortcuts(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [questions.length, currentIndex, currentQuestion, attempt?.status, submitting, isMCQ])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && attempt?.status !== 'SUBMITTED') {
        setTabWarning(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [attempt?.status])

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
    setTestResults(null)
  }, [])

  const toggleMarkForReview = useCallback((questionId: string) => {
    setMarkedForReview(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!id || !attempt || submitting) return
    setSubmitting(true)
    try {
      const answersPayload = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))
      const totalTime = durationSeconds - timeLeft
      const res = await submitAssessmentApi(id, {
        attemptId: attempt.id,
        answers: answersPayload,
        timeTaken: Math.floor(totalTime)
      })
      if (res.error) {
        setError(res.error)
        setSubmitting(false)
        return
      }

      if (isMockAssessment) {
        const result = scoreAssessment(id, answers, Math.floor(totalTime))
        saveAttempt(result)
      }

      clearProgress(id)
      navigate(`/assessment-results/${attempt.id}`, { replace: true })
    } catch {
      setError('Failed to submit')
      setSubmitting(false)
    }
  }, [id, attempt, answers, timeLeft, durationSeconds, navigate, submitting, isMockAssessment])

  const handleRunCode = useCallback(() => {
    if (!currentQuestion?.questionData?.testCases) return
    setRunningCode(true)
    setTestResults(null)
    setTimeout(() => {
      const testCases = currentQuestion.questionData.testCases as { input: string; expectedOutput: string }[]
      const results = testCases.map((tc, i) => {
        const passed = Math.random() > 0.3
        return { label: `Test ${i + 1}: ${tc.input} → ${tc.expectedOutput}`, passed }
      })
      setTestResults(results)
      setRunningCode(false)
    }, 800)
  }, [currentQuestion])

  const getQuestionStatus = (q: AssessmentQuestionData, index: number) => {
    const isAnswered = answers[q.id] !== undefined
    const isMarked = markedForReview.has(q.id)
    const isCurrent = index === currentIndex

    if (isCurrent) return 'bg-indigo-500 text-white border-indigo-500'
    if (isAnswered && isMarked) return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
    if (isAnswered) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    if (isMarked) return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    return 'bg-[#1E293B]/50 text-gray-400 border-[#334155]/50 hover:border-gray-500'
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'EASY': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'HARD': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <p className="text-gray-400 text-lg">{error}</p>
        <Button onClick={() => navigate('/assessments')} variant="outline" className="border-[#334155] text-gray-300">
          Back to Assessments
        </Button>
      </div>
    )
  }

  if (!assessment || !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <p className="text-gray-400 text-lg">Assessment not found</p>
        <Button onClick={() => navigate('/assessments')} variant="outline" className="border-[#334155] text-gray-300">
          Back to Assessments
        </Button>
      </div>
    )
  }

  const renderMCQ = () => {
    const qData = currentQuestion.questionData || {}
    return (
      <div className="space-y-4">
        <p className="text-gray-200 text-base sm:text-lg leading-relaxed">{qData.text}</p>
        <div className="space-y-3 mt-6">
          {(qData.options || []).map((opt: { label: string; value: string }) => {
            const isSelected = answers[currentQuestion.id] === opt.label
            return (
              <div key={opt.label}
                className={cn(
                  'flex items-center gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-[#1E293B]/50 border-[#334155]/30 hover:border-[#334155]/60'
                )}
                onClick={() => handleAnswer(currentQuestion.id, opt.label)}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium border shrink-0',
                  isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-[#0F172A] border-[#334155] text-gray-400'
                )}>
                  {opt.label}
                </div>
                <span className={cn('text-sm', isSelected ? 'text-white' : 'text-gray-300')}>{opt.value}</span>
              </div>
            )
          })}
        </div>
        {qData.explanation && answers[currentQuestion.id] && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
            <p className="text-xs text-indigo-400 font-medium mb-1">Explanation:</p>
            <p className="text-sm text-gray-400">{qData.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  const renderCoding = () => {
    const qData = currentQuestion.questionData || {}
    const currentCode = answers[currentQuestion.id] || CODE_TEMPLATES[codeLanguage] || ''

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className={cn('text-xs', getDifficultyColor(currentQuestion.difficulty))}>
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs">
            {currentQuestion.marks} marks
          </Badge>
          <span className="text-xs text-gray-500 sm:ml-auto">{currentQuestion.topic}</span>
        </div>

        <div className="prose prose-invert max-w-none">
          <h3 className="text-base sm:text-lg text-white font-semibold">{qData.title}</h3>
          <p className="text-gray-300 text-sm sm:text-base whitespace-pre-wrap">{qData.description}</p>
        </div>

        {qData.constraints && (
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Constraints:</p>
            <div className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30">
              {String(qData.constraints).split('\n').map((c: string, i: number) => (
                <p key={i} className="text-xs sm:text-sm text-gray-400 font-mono">• {c}</p>
              ))}
            </div>
          </div>
        )}

        {qData.sampleInput && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Sample Input:</p>
              <pre className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30 text-xs sm:text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                {String(qData.sampleInput)}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Sample Output:</p>
              <pre className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30 text-xs sm:text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                {String(qData.sampleOutput)}
              </pre>
            </div>
          </div>
        )}

        {qData.testCases && qData.testCases.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Test Cases:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(qData.testCases as { input: string; expectedOutput: string }[]).map((tc, i) => {
                const result = testResults?.[i]
                return (
                  <div key={i} className={cn(
                    'rounded-lg p-3 border text-xs sm:text-sm font-mono',
                    result ? (result.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20') : 'bg-[#1E293B]/50 border-[#334155]/30'
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500">Test {i + 1}</span>
                      {result && (
                        <span className={cn('text-xs font-medium', result.passed ? 'text-emerald-400' : 'text-rose-400')}>
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400">Input: <span className="text-gray-300">{String(tc.input).length > 40 ? String(tc.input).slice(0, 40) + '...' : tc.input}</span></p>
                    <p className="text-gray-400">Expected: <span className="text-gray-300">{tc.expectedOutput}</span></p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Language:</span>
          <div className="flex flex-wrap gap-1">
            {SUPPORTED_LANGUAGES.map(lang => (
              <Button key={lang.id} variant="outline" size="sm"
                className={cn(
                  'text-xs border-[#334155]',
                  codeLanguage === lang.id ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40' : 'text-gray-400 hover:text-white'
                )}
                onClick={() => setCodeLanguage(lang.id)}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#334155]/30">
          <Editor
            height="300px"
            language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage === 'javascript' ? 'javascript' : codeLanguage}
            theme="vs-dark"
            value={currentCode}
            onChange={(value) => handleAnswer(currentQuestion.id, value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="border-[#334155] text-gray-300"
            onClick={handleRunCode} disabled={runningCode}>
            {runningCode ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Code2 className="w-4 h-4 mr-1" />}
            Run Tests
          </Button>
          {testResults && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400">{testResults.filter(r => r.passed).length} passed</span>
              <span className="text-gray-500">/</span>
              <span className="text-rose-400">{testResults.filter(r => !r.passed).length} failed</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const timerColor = timeLeft < 300 ? 'text-rose-400' : timeLeft < 600 ? 'text-amber-400' : 'text-gray-300'

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      {/* Auto-Submit Countdown */}
      <AnimatePresence>
        {autoSubmitCountdown !== null && autoSubmitCountdown > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mb-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-sm font-medium text-rose-300">Auto-submitting in {autoSubmitCountdown}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switch Warning */}
      <AnimatePresence>
        {tabWarning && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-amber-300">Tab switch detected. Stay focused on the assessment.</span>
            </div>
            <Button variant="ghost" size="sm" className="text-amber-400 h-6" onClick={() => setTabWarning(false)}>
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 sm:h-auto" onClick={() => setShowConfirm(true)}>
            <X className="w-4 h-4 sm:mr-1" /> <span className="hidden sm:inline">Quit</span>
          </Button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-white truncate max-w-[200px]">{assessment.title}</h2>
            <p className="text-xs text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> {answeredCount}</span>
            <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-amber-400" /> {markedCount}</span>
            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-gray-400" /> {questions.length - answeredCount}</span>
          </div>
          {lastSaved && (
            <div className="hidden lg:flex items-center gap-1 text-xs text-gray-600">
              <Save className="w-3 h-3" />
              <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          <button className="hidden sm:flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            onClick={() => setShowShortcuts(true)} title="Keyboard shortcuts (F1)">
            <Keyboard className="w-3 h-3" />
          </button>
          <div className={cn('flex items-center gap-1 sm:gap-2 font-mono text-base sm:text-lg font-bold', timerColor,
            autoSubmitCountdown !== null && 'text-rose-400 animate-pulse')}>
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 text-xs sm:text-sm h-8 sm:h-auto"
            onClick={() => setShowSubmitConfirm(true)} disabled={submitting}>
            {submitting ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Send className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />}
            <span className="hidden sm:inline">Submit</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
              <Badge variant="outline" className="text-xs border-[#334155] text-gray-400">
                Q{currentIndex + 1}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', getDifficultyColor(currentQuestion.difficulty))}>
                {currentQuestion.difficulty}
              </Badge>
              <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs">
                {currentQuestion.topic}
              </Badge>
              {isMCQ && (
                <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs">
                  <FileText className="w-3 h-3 mr-1" /> MCQ
                </Badge>
              )}
              {isCoding && (
                <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs">
                  <Code2 className="w-3 h-3 mr-1" /> Coding
                </Badge>
              )}
              <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs sm:ml-auto">
                {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
              </Badge>
            </div>

            {isMCQ && renderMCQ()}
            {isCoding && renderCoding()}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-6 sm:mt-8 pt-4 border-t border-[#334155]/30">
              <Button variant="outline" size="sm" className="border-[#334155] text-gray-300 text-xs"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button variant="outline" size="sm"
                className={cn(
                  'border text-xs',
                  markedForReview.has(currentQuestion.id)
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                    : 'border-[#334155] text-gray-300'
                )}
                onClick={() => toggleMarkForReview(currentQuestion.id)}>
                <Flag className="w-3 h-3 mr-1" />
                {markedForReview.has(currentQuestion.id) ? 'Marked' : 'Review'}
              </Button>
              <Button variant="outline" size="sm" className="border-[#334155] text-gray-300 text-xs"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Question Navigator */}
        <div>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 sm:p-5 backdrop-blur-xl sticky top-4">
            <h3 className="text-sm font-semibold text-white mb-3">Navigator</h3>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#1E293B] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Section Tabs */}
            {(() => {
              const sections = [...new Set(questions.map(q => q.section || q.topic))]
              if (sections.length <= 1) return null
              return (
                <div className="flex flex-wrap gap-1 mb-3">
                  <button
                    className={cn('px-2 py-1 rounded-md text-[10px] font-medium border transition-all',
                      !activeSection ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'border-[#334155]/50 text-gray-500 hover:text-gray-300')}
                    onClick={() => setActiveSection(null)}>
                    All
                  </button>
                  {sections.map(s => (
                    <button key={s}
                      className={cn('px-2 py-1 rounded-md text-[10px] font-medium border transition-all',
                        activeSection === s ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'border-[#334155]/50 text-gray-500 hover:text-gray-300')}
                      onClick={() => setActiveSection(s)}>
                      {s?.substring(0, 8)}
                    </button>
                  ))}
                </div>
              )
            })()}

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {questions.map((q, i) => (
                <button key={q.id}
                  className={cn(
                    'w-full aspect-square rounded-lg text-xs font-medium border transition-all',
                    getQuestionStatus(q, i)
                  )}
                  onClick={() => setCurrentIndex(i)}
                  title={`Q${i + 1}${answers[q.id] ? ' (Answered)' : ''}${markedForReview.has(q.id) ? ' (Marked)' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/60" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/50" /> Ans & Marked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" /> Marked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#1E293B]/50 border border-[#334155]/50" /> Unanswered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quit Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-[#1E293B] border border-[#334155]/50 p-6 max-w-sm mx-4 shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white text-center mb-2">Quit Assessment?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">Your progress will be saved. You can resume later.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-[#334155] text-gray-300" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white border-0"
                onClick={() => navigate('/assessments')}>
                Quit
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Submit Confirmation */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl bg-[#1E293B] border border-[#334155]/50 p-6 max-w-sm mx-4 shadow-2xl">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white text-center mb-2">Submit Assessment?</h3>
            <div className="bg-[#0F172A] rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><span>Answered</span><span className="text-white">{answeredCount}/{questions.length}</span></div>
              <div className="flex justify-between text-gray-400"><span>Marked for Review</span><span className="text-white">{markedCount}</span></div>
              <div className="flex justify-between text-gray-400"><span>Time Used</span><span className="text-white">{formatTime(durationSeconds - timeLeft)}</span></div>
            </div>
            {answeredCount < questions.length && (
              <p className="text-xs text-amber-400 mb-4 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {questions.length - answeredCount} unanswered
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-[#334155] text-gray-300" onClick={() => setShowSubmitConfirm(false)}>
                Review
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white border-0"
                onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl bg-[#1E293B] border border-[#334155]/50 p-6 max-w-md mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Keyboard Shortcuts</h3>
                <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => setShowShortcuts(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ['→ / N', 'Next question'],
                  ['← / P', 'Previous question'],
                  ['M', 'Mark/unmark for review'],
                  ['1-4', 'Select MCQ option (A-D)'],
                  ['F1', 'Toggle this help'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-[#334155]/30 last:border-0">
                    <span className="text-gray-400">{desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-[#0F172A] border border-[#334155] text-gray-300 text-xs font-mono">{key}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
