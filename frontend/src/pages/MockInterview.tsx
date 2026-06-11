import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { mockCompanies } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { Mic, Camera, CameraOff, StopCircle, Play, Clock, MessageSquare, Brain, TrendingUp, Target, AlertTriangle, CheckCircle, BarChart3, Volume2 } from 'lucide-react'
import { motion } from 'framer-motion'

const mockQuestions = {
  HR: ["Tell me about yourself", "Why do you want to work here?", "What are your strengths and weaknesses?", "Where do you see yourself in 5 years?", "Tell me about a time you faced a challenge"],
  TECHNICAL: ["Explain REST API principles", "What is the difference between SQL and NoSQL?", "Explain OOP concepts", "Describe the OSI model", "What is a deadlock?"],
  MANAGER: ["How do you handle team conflicts?", "Describe your leadership style", "How do you prioritize tasks?", "Tell me about a project you managed", "How do you motivate team members?"],
}

const mockTranscriptLines = [
  "Hello! I'm your AI interviewer for today.",
  "Let's begin with the first question.",
  "That's an interesting perspective. Can you elaborate?",
  "Good. Now let's move to the next topic.",
  "Tell me more about your experience with that.",
  "How would you handle a situation where...",
  "Nice answer. Let me ask you something else.",
  "That covers it well. Moving on...",
]

const fillerWordTypes = ["umm", "ah", "like"] as const

const keywordCoverageItems = ["teamwork", "leadership", "problem-solving", "communication", "technical skills"]

const fillerHighlightedTranscript = [
  "umm, I think that my biggest strength is...",
  "I have worked on ah several projects where...",
  "like, I was responsible for leading the team...",
  "My approach to problem-solving is umm to first...",
  "I believe that ah communication is key in...",
  "The biggest challenge was like coordinating...",
  "We managed to umm deliver the project on time...",
  "I would say my leadership style is ah collaborative...",
]

const wpmSegments = [98, 132, 145, 118, 156, 142, 128, 150]

export default function MockInterview() {
  const [sessionActive, setSessionActive] = useState(false)
  const [interviewType, setInterviewType] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [fillerWords, setFillerWords] = useState({ umm: 0, ah: 0, like: 0 })
  const [wpm, setWpm] = useState(120)
  const [transcript, setTranscript] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [, setMockStep] = useState(0)
  const [confidenceScore] = useState(() => Math.floor(Math.random() * 30) + 60)
  const [overallScore] = useState(() => Math.floor(Math.random() * 25) + 65)
  const [keywordCoverage] = useState(() => Math.floor(Math.random() * 40) + 50)

  const transcriptRef = useRef<HTMLDivElement>(null)

  const questions = interviewType ? mockQuestions[interviewType as keyof typeof mockQuestions] : []

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
      setMockStep(s => s + 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [sessionActive])

  useEffect(() => {
    if (!sessionActive && !showFeedback) return
    if (!sessionActive) return
    const qInterval = setInterval(() => {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1))
    }, 8000)
    return () => clearInterval(qInterval)
  }, [sessionActive, showFeedback, questions.length])

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

  const handleStart = () => {
    if (!interviewType || !selectedCompany) return
    setSessionActive(true)
    setElapsed(0)
    setTranscript([])
    setCurrentQuestionIndex(0)
    setFillerWords({ umm: 0, ah: 0, like: 0 })
    setWpm(120)
    setMockStep(0)
  }

  const handleEnd = () => {
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
    setMockStep(0)
  }

  const wpmPercent = Math.min(100, Math.max(0, (wpm / 150) * 100))
  const wpmColor = wpm >= 120 && wpm <= 150 ? 'bg-emerald-500' : wpm > 150 ? 'bg-amber-500' : 'bg-red-500'

  const highlightFiller = (text: string) => {
    const regex = /\b(umm|ah|like)\b/gi
    const parts = text.split(regex)
    return parts.map((part, i) => {
      if (fillerWordTypes.includes(part.toLowerCase() as any)) {
        return <span key={i} className="bg-rose-200 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-1 rounded font-medium">{part}</span>
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
              <h1 className="text-3xl font-bold tracking-tight">Interview Complete</h1>
              <p className="text-muted-foreground mt-1">{interviewType} Round &middot; {selectedCompany} &middot; Duration: {formatTime(elapsed)}</p>
            </div>
            <Button onClick={handleRestart} size="lg">
              <Play className="mr-2 h-5 w-5" /> New Interview
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="text-center">
              <CardContent className="pt-8 pb-6">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeDasharray={`${overallScore * 2.64} 264`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <span className="text-4xl font-bold">{overallScore}</span>
                      <span className="text-muted-foreground block text-sm">/100</span>
                    </div>
                  </div>
                </div>
                <CardTitle className="mt-4">Overall Score</CardTitle>
                <CardDescription>Performance rating</CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Brain className="h-4 w-4 text-primary" /> Confidence Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold">{confidenceScore}%</span>
                  <Badge variant={confidenceScore >= 70 ? "success" : confidenceScore >= 50 ? "warning" : "destructive"}>
                    {confidenceScore >= 70 ? "Confident" : confidenceScore >= 50 ? "Nervous" : "Anxious"}
                  </Badge>
                </div>
                <Progress value={confidenceScore} className="h-2.5" />
                <p className="text-xs text-muted-foreground mt-3">Voice tone &amp; pacing analysis</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4 text-primary" /> Keyword Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl font-bold">{keywordCoverage}%</span>
                  <Badge variant={keywordCoverage >= 70 ? "success" : keywordCoverage >= 50 ? "warning" : "destructive"}>
                    {keywordCoverage >= 70 ? "Great" : keywordCoverage >= 50 ? "Average" : "Needs Work"}
                  </Badge>
                </div>
                <Progress value={keywordCoverage} className="h-2.5" />
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {keywordCoverageItems.map(k => (
                    <Badge key={k} variant={Math.random() > 0.4 ? "success" : "outline"} className="text-xs">{k}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-4 w-4 text-rose-500" /> Filler Word Heatmap</CardTitle>
              <CardDescription>Words to avoid in your speech</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="destructive" className="text-sm px-3 py-1">umm: {fillerWords.umm}</Badge>
                <Badge variant="warning" className="text-sm px-3 py-1">ah: {fillerWords.ah}</Badge>
                <Badge variant="warning" className="text-sm px-3 py-1">like: {fillerWords.like}</Badge>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
                {fillerHighlightedTranscript.map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed">{highlightFiller(line)}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-primary" /> Pace Analysis</CardTitle>
                <CardDescription>Speaking speed (WPM) over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wpmSegments.map((val, i) => {
                    const pct = (val / 180) * 100
                    const inRange = val >= 120 && val <= 150
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-8 shrink-0">T{i + 1}</span>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", inRange ? "bg-emerald-500" : "bg-amber-500")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-mono w-10 text-right shrink-0", inRange ? "text-emerald-500" : "text-amber-500")}>{val}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Target (120-150)</span>
                  <span>Avg: {Math.round(wpmSegments.reduce((a, b) => a + b, 0) / wpmSegments.length)} WPM</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><CheckCircle className="h-4 w-4 text-emerald-500" /> Suggested Improvements</CardTitle>
              </CardHeader>
              <CardContent>
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
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium mt-0.5">{i + 1}</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
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
          className="flex items-center justify-between bg-card border rounded-2xl px-6 py-3 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xl font-mono font-bold tabular-nums">{formatTime(elapsed)}</span>
            </div>
            <div className="h-6 w-px bg-border" />
            <Badge variant="secondary" className="text-xs">{interviewType} Round</Badge>
            <Badge variant="outline" className="text-xs">{selectedCompany}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Recording
            </div>
            <Button variant="destructive" onClick={handleEnd}>
              <StopCircle className="mr-2 h-4 w-4" /> End Interview
            </Button>
          </div>
        </motion.div>

        <div className="flex gap-6">
          <div className="w-[60%] space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative flex items-center gap-5 p-6 bg-gradient-to-br from-primary/5 via-background to-primary/5">
                    <div className="relative shrink-0">
                      <motion.div
                        className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ filter: "blur(1px)" }}
                      />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-background border-2 border-background">
                        <Brain className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">AI Interviewer</h3>
                        <motion.div
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Volume2 className="h-4 w-4 text-emerald-500" />
                        </motion.div>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
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
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Speaking</span>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-primary" /> Live Transcript
                  <span className="text-xs text-muted-foreground font-normal ml-auto">{transcript.length} lines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={transcriptRef}
                  className="bg-muted/50 rounded-xl p-4 h-64 overflow-y-auto space-y-2"
                >
                  {transcript.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      <Mic className="h-4 w-4 mr-2" /> Waiting for speech...
                    </div>
                  ) : (
                    transcript.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-sm leading-relaxed"
                      >
                        <span className="text-muted-foreground mr-2 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                        {line}
                      </motion.p>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-[40%] space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardContent className="p-0">
                  <div className={cn("relative aspect-[4/3] bg-zinc-900 dark:bg-zinc-950 rounded-t-2xl flex items-center justify-center overflow-hidden group", !cameraOn && "rounded-b-2xl")}>
                    {cameraOn ? (
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Camera Feed Active</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <CameraOff className="h-12 w-12 text-zinc-600 mx-auto mb-2" />
                        <p className="text-zinc-500 text-sm">Camera Off</p>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant={cameraOn ? "success" : "secondary"} className="text-[10px]">
                        {cameraOn ? "Live" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                  {cameraOn && (
                    <div className="px-4 pb-4 pt-2 bg-zinc-900 dark:bg-zinc-950 rounded-b-2xl">
                      <div className="flex items-center justify-between text-xs text-zinc-400">
                        <span>Webcam Feed</span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> REC
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-2 border-t">
                    <Button
                      variant={cameraOn ? "destructive" : "secondary"}
                      size="sm"
                      className="w-full rounded-xl"
                      onClick={() => setCameraOn(c => !c)}
                    >
                      {cameraOn ? <CameraOff className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
                      {cameraOn ? "Disable Camera" : "Enable Camera"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500" /> Filler Word Counter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Badge variant="destructive" className="text-xs px-3 py-1.5">umm: {fillerWords.umm}</Badge>
                    <Badge variant="warning" className="text-xs px-3 py-1.5">ah: {fillerWords.ah}</Badge>
                    <Badge variant="warning" className="text-xs px-3 py-1.5">like: {fillerWords.like}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Speaking Speed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold">{wpm}</span>
                    <span className="text-xs text-muted-foreground">WPM</span>
                    <Badge variant={wpm >= 120 && wpm <= 150 ? "success" : "warning"} className="ml-auto text-xs">
                      {wpm >= 120 && wpm <= 150 ? "Optimal" : wpm > 150 ? "Fast" : "Slow"}
                    </Badge>
                  </div>
                  <Progress value={wpmPercent} className={cn("h-2.5", wpmColor)} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>Slow</span>
                    <span className="text-emerald-500 font-medium">Target: 120-150</span>
                    <span>Fast</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Current Question
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed min-h-[2.5rem]">
                    {currentQuestionIndex < questions.length
                      ? `Q${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`
                      : "All questions completed."}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3 pt-2 border-t">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-colors",
                          i < currentQuestionIndex ? "bg-primary" : i === currentQuestionIndex ? "bg-primary/60" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
          <Mic className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Voice Mock Interview</h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Practice with AI-powered voice interviews. Choose your round type and company to get started.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> Select Interview Round
            </CardTitle>
            <CardDescription>Choose the type of interview round you want to practice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[
                { type: "HR", label: "HR Round", desc: "Behavioral & fit questions", icon: "👤", gradient: "from-blue-500/10 to-indigo-500/10" },
                { type: "TECHNICAL", label: "Technical Round", desc: "DSA & system design", icon: "💻", gradient: "from-emerald-500/10 to-teal-500/10" },
                { type: "MANAGER", label: "Manager Round", desc: "Leadership & strategy", icon: "🎯", gradient: "from-violet-500/10 to-purple-500/10" },
              ].map(({ type, label, desc, icon, gradient }) => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={cn(
                    "relative rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:shadow-md",
                    "bg-gradient-to-br",
                    gradient,
                    interviewType === type
                      ? "border-primary shadow-lg ring-1 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl mb-2 block">{icon}</span>
                  <h3 className="font-semibold text-sm">{label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Select Company
            </CardTitle>
            <CardDescription>Choose the company you want to interview for</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a company..." />
              </SelectTrigger>
              <SelectContent>
                {mockCompanies.map(c => (
                  <SelectItem key={c.name} value={c.name}>
                    <span className="flex items-center gap-2">
                      <span>{c.logo}</span>
                      <span>{c.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{c.difficulty}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCompany && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-xs text-muted-foreground mt-3"
              >
                Preparing {interviewType || "selected"} round for {selectedCompany}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <Button
          size="lg"
          disabled={!interviewType || !selectedCompany}
          onClick={handleStart}
          className="h-14 px-10 text-base gap-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          <Play className="h-6 w-6" />
          Start Interview
        </Button>
      </motion.div>
    </div>
  )
}
