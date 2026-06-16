import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Clock, ChevronLeft, ChevronRight, HelpCircle, CheckCircle, AlertCircle,
  Loader2, Flag, Play, Send, X, AlertTriangle, BookOpen, Code2, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getAssessmentApi, startAssessmentApi, submitAssessmentApi,
  type AssessmentDetailData, type AssessmentQuestionData, type AssessmentAttemptData
} from '@/services/api'

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
  const initialLoadRef = useRef(false)

  const questions = assessment?.questions || []
  const currentQuestion = questions[currentIndex]
  const isMCQ = currentQuestion?.questionType === 'MCQ'
  const isCoding = currentQuestion?.questionType === 'CODING'
  const answeredCount = Object.keys(answers).length
  const markedCount = markedForReview.size

  const durationSeconds = assessment ? assessment.duration * 60 : 0

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  useEffect(() => {
    async function init() {
      if (!id || initialLoadRef.current) return
      initialLoadRef.current = true
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
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, attempt?.status])

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
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
      navigate(`/assessment-results/${attempt.id}`, { replace: true })
    } catch {
      setError('Failed to submit')
      setSubmitting(false)
    }
  }, [id, attempt, answers, timeLeft, durationSeconds, navigate, submitting])

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
    const qData = currentQuestion.questionData
    return (
      <div className="space-y-4">
        <p className="text-gray-200 text-lg leading-relaxed">{qData.text}</p>
        <div className="space-y-3 mt-6">
          {qData.options.map((opt: { label: string; value: string }) => {
            const isSelected = answers[currentQuestion.id] === opt.label
            return (
              <div key={opt.label}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'bg-[#1E293B]/50 border-[#334155]/30 hover:border-[#334155]/60'
                )}
                onClick={() => handleAnswer(currentQuestion.id, opt.label)}
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium border',
                  isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-[#0F172A] border-[#334155] text-gray-400'
                )}>
                  {opt.label}
                </div>
                <span className={cn('text-sm', isSelected ? 'text-white' : 'text-gray-300')}>{opt.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCoding = () => {
    const qData = currentQuestion.questionData
    const currentCode = answers[currentQuestion.id] || CODE_TEMPLATES[codeLanguage] || ''

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={cn('text-xs', getDifficultyColor(currentQuestion.difficulty))}>
            {currentQuestion.difficulty}
          </Badge>
          <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs">
            {currentQuestion.marks} marks
          </Badge>
          <span className="text-xs text-gray-500 ml-auto">{currentQuestion.topic}</span>
        </div>

        <div className="prose prose-invert max-w-none">
          <h3 className="text-lg text-white font-semibold">{qData.title}</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{qData.description}</p>
        </div>

        {qData.constraints && (
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Constraints:</p>
            <div className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30">
              {qData.constraints.split('\n').map((c: string, i: number) => (
                <p key={i} className="text-sm text-gray-400 font-mono">• {c}</p>
              ))}
            </div>
          </div>
        )}

        {qData.sampleInput && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Sample Input:</p>
              <pre className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {qData.sampleInput}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Sample Output:</p>
              <pre className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#334155]/30 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {qData.sampleOutput}
              </pre>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Language:</span>
          <div className="flex gap-1">
            {SUPPORTED_LANGUAGES.map(lang => (
              <Button key={lang.id} variant="outline" size="sm"
                className={cn(
                  'text-xs border-[#334155]',
                  codeLanguage === lang.id ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40' : 'text-gray-400 hover:text-white'
                )}
                onClick={() => {
                  setCodeLanguage(lang.id)
                }}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#334155]/30">
          <Editor
            height="350px"
            language={codeLanguage === 'cpp' ? 'cpp' : codeLanguage === 'javascript' ? 'javascript' : codeLanguage}
            theme="vs-dark"
            value={currentCode}
            onChange={(value) => handleAnswer(currentQuestion.id, value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        </div>
      </div>
    )
  }

  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const timerColor = timeLeft < 300 ? 'text-rose-400' : timeLeft < 600 ? 'text-amber-400' : 'text-gray-300'

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 bg-[#1E293B]/80 backdrop-blur-xl border border-[#334155]/50 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setShowConfirm(true)}>
            <X className="w-4 h-4 mr-1" /> Quit
          </Button>
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-white">{assessment.title}</h2>
            <p className="text-xs text-gray-500">Question {currentIndex + 1} of {questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" /> {answeredCount} Answered</span>
            <span className="flex items-center gap-1"><Flag className="w-3 h-3 text-amber-400" /> {markedCount} Review</span>
            <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-gray-400" /> {questions.length - answeredCount} Pending</span>
          </div>
          <div className={cn('flex items-center gap-2 font-mono text-lg font-bold', timerColor)}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
            onClick={() => setShowSubmitConfirm(true)} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            Submit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
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
              <Badge variant="outline" className="border-[#334155] text-gray-400 text-xs ml-auto">
                {currentQuestion.marks} mark{currentQuestion.marks > 1 ? 's' : ''}
              </Badge>
            </div>

            {isMCQ && renderMCQ()}
            {isCoding && renderCoding()}

            <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#334155]/30">
              <Button variant="outline" size="sm" className="border-[#334155] text-gray-300"
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
                {markedForReview.has(currentQuestion.id) ? 'Marked for Review' : 'Mark for Review'}
              </Button>
              <Button variant="outline" size="sm" className="border-[#334155] text-gray-300"
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Question Navigator */}
        <div>
          <div className="rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-5 backdrop-blur-xl sticky top-4">
            <h3 className="text-sm font-semibold text-white mb-3">Question Navigator</h3>

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
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500/30 border border-purple-500/50" /> Answered & Marked</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" /> Marked for Review</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#1E293B]/50 border border-[#334155]/50" /> Not Answered</div>
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
            <p className="text-sm text-gray-400 text-center mb-6">Your progress will be lost. Are you sure?</p>
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
              <div className="flex justify-between text-gray-400"><span>Questions Answered</span><span className="text-white">{answeredCount}/{questions.length}</span></div>
              <div className="flex justify-between text-gray-400"><span>Marked for Review</span><span className="text-white">{markedCount}</span></div>
              <div className="flex justify-between text-gray-400"><span>Time Used</span><span className="text-white">{formatTime(durationSeconds - timeLeft)}</span></div>
            </div>
            {answeredCount < questions.length && (
              <p className="text-xs text-amber-400 mb-4 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> You have {questions.length - answeredCount} unanswered questions
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
    </div>
  )
}
