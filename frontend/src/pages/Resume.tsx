import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockResumeAnalysis } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { Upload, FileText, FileCheck, Sparkles, RefreshCw, CheckCircle, AlertTriangle, Lightbulb, Download, PenLine, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'

const sectionColors: Record<string, string> = {
  summary: 'bg-blue-500',
  skills: 'bg-purple-500',
  experience: 'bg-amber-500',
  projects: 'bg-rose-500',
  education: 'bg-emerald-500',
}

const sectionLabels: Record<string, string> = {
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
}

function AtsGauge({ value }: { value: number }) {
  const [animated, setAnimated] = useState(0)
  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 400)
    return () => clearTimeout(t)
  }, [value])

  const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{Math.round(animated)}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export default function Resume() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [bullet, setBullet] = useState('')
  const [rewritten, setRewritten] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const analysis = mockResumeAnalysis

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') setFile(f)
  }

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleRewrite = () => {
    setRewritten(
      "Developed and deployed a scalable microservices architecture using Node.js and Docker, " +
      "resulting in a 40% reduction in API response time and supporting 10x growth in user traffic."
    )
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Resume Analyzer</h1>
          <p className="text-sm text-muted-foreground">Get AI-powered insights to optimize your resume for ATS systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
        {/* Left Column - Upload */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                Upload Resume
              </CardTitle>
              <CardDescription>Upload your resume in PDF format</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={handleClick}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
                  )}
                >
                  <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Drop your resume here</p>
                      <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">PDF only</Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">2 pages</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => { setFile(null); setAnalyzed(false) }} className="shrink-0">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Preview Placeholder */}
                  <div className="rounded-2xl border bg-muted/30 flex items-center justify-center h-56">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-12 w-12" />
                      <span className="text-xs">Resume Preview</span>
                    </div>
                  </div>

                  <Button className="w-full gap-2" onClick={() => setAnalyzed(true)} disabled={analyzed}>
                    {analyzed ? (
                      <><CheckCircle className="h-4 w-4" /> Analyzed</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Analyze Resume</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Analysis */}
        <div className="space-y-4">
          {!analyzed ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted text-muted-foreground mb-4">
                  <Gauge className="h-10 w-10" />
                </div>
                <p className="text-sm font-medium">Upload a resume to see analysis</p>
                <p className="text-xs text-muted-foreground mt-1">Get your ATS score, suggestions, and more</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                  <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 text-xs">
                    Suggestions
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 text-xs">
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger value="rewrite" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-4 text-xs">
                    Rewrite
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="flex flex-col items-center py-4">
                    <AtsGauge value={analysis.atsScore} />
                    <p className="text-sm font-medium mt-2">ATS Score</p>
                    <p className="text-xs text-muted-foreground">How well your resume ranks against ATS parsers</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section Scores</p>
                    {Object.entries(analysis.sectionScores).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{sectionLabels[key] || key}</span>
                          <span className="font-medium">{val}%</span>
                        </div>
                        <Progress value={val} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Suggestions Tab */}
                <TabsContent value="suggestions" className="mt-4">
                  <ScrollArea className="h-[460px] pr-2">
                    <div className="space-y-3">
                      {analysis.suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="p-4 rounded-xl border bg-card"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', sectionColors[s.section]?.replace('bg-', 'bg-').replace('500', '100 dark:bg-opacity-20') || 'bg-muted')}>
                              <Lightbulb className={cn('h-4 w-4', sectionColors[s.section]?.replace('bg-', 'text-').replace('500', '600 dark:text-400') || 'text-muted-foreground')} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={s.section === 'summary' ? 'info' : s.section === 'skills' ? 'secondary' : s.section === 'experience' ? 'warning' : s.section === 'projects' ? 'default' : 'success'} className="text-[10px] capitalize">
                                  {s.section}
                                </Badge>
                              </div>
                              <p className="text-xs font-medium">{s.bullet}</p>
                              <p className="text-xs text-muted-foreground mt-1">{s.suggestion}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Missing Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((kw) => (
                          <Badge key={kw} variant="outline" className="text-xs px-3 py-1.5 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Action Verb Strength</p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Your resume uses 60% strong action verbs</p>
                          <Progress value={60} className="h-2 mt-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rewrite Tab */}
                <TabsContent value="rewrite" className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Rewrite This Bullet</p>
                    <p className="text-xs text-muted-foreground mb-3">Paste a bullet point from your resume to get an AI-enhanced version</p>
                    <Textarea
                      placeholder="e.g. Worked on improving API performance..."
                      value={bullet}
                      onChange={(e) => setBullet(e.target.value)}
                      className="min-h-[90px] text-sm"
                    />
                    <Button
                      className="mt-2 gap-2 w-full"
                      size="sm"
                      onClick={handleRewrite}
                      disabled={!bullet.trim()}
                    >
                      <PenLine className="h-4 w-4" />
                      Rewrite
                    </Button>
                  </div>

                  {rewritten && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-primary/30 bg-primary/5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">AI Enhanced Version</span>
                      </div>
                      <p className="text-sm">{rewritten}</p>
                      <Button variant="ghost" size="sm" className="mt-2 gap-1.5 text-xs h-8">
                        <Download className="h-3 w-3" />
                        Copy
                      </Button>
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
