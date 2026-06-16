import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { uploadResumeApi, analyzeResumeApi, rewriteBulletApi, type ResumeAnalysisData } from '@/services/api'
import { Upload, FileText, FileCheck, Sparkles, RefreshCw, CheckCircle, AlertTriangle, Lightbulb, Download, PenLine, Gauge, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const sectionLabels: Record<string, string> = {
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
}

const sectionBadgeColors: Record<string, string> = {
  summary: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  skills: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  experience: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  projects: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  education: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

const progressColors: Record<string, string> = {
  summary: 'bg-blue-500',
  skills: 'bg-purple-500',
  experience: 'bg-amber-500',
  projects: 'bg-rose-500',
  education: 'bg-emerald-500',
}

function AtsGauge({ value }: { value: number }) {
  const [animated, setAnimated] = useState(0)
  const size = 180
  const strokeWidth = 16
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E293B" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold" style={{ color }}>{Math.round(animated)}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  )
}

const tabs = ['Overview', 'Suggestions', 'Keywords', 'Rewrite'] as const
type Tab = typeof tabs[number]

export default function Resume() {
  const [file, setFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [bullet, setBullet] = useState('')
  const [rewritten, setRewritten] = useState<string | null>(null)
  const [rewriting, setRewriting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ResumeAnalysisData | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type === 'application/pdf') await handleUpload(f)
  }

  const handleClick = () => inputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) await handleUpload(f)
  }

  const handleUpload = async (f: File) => {
    setFile(f)
    setUploading(true)
    const result = await uploadResumeApi(f)
    if (result.data) {
      setResumeId(result.data.id)
    }
    setUploading(false)
  }

  const handleAnalyze = async () => {
    if (!resumeId) return
    setAnalyzing(true)
    const result = await analyzeResumeApi(resumeId)
    if (result.data) {
      setAnalysis(result.data)
      setAnalyzed(true)
      setActiveTab('Overview')
    }
    setAnalyzing(false)
  }

  const handleRewrite = async () => {
    if (!resumeId || !bullet.trim()) return
    setRewriting(true)
    const result = await rewriteBulletApi(resumeId, { bullet_text: bullet })
    if (result.data) {
      setRewritten(result.data.improved)
    }
    setRewriting(false)
  }

  const resetFile = () => {
    setFile(null)
    setResumeId(null)
    setAnalyzed(false)
    setAnalysis(null)
    setRewritten(null)
    setBullet('')
  }

  return (
    <div className="min-h-screen bg-[#0F172A]/80 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#1E293B]/50 border border-[#334155]/50">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Resume Analyzer</h1>
            <p className="text-sm text-gray-400">Get AI-powered insights to optimize your resume for ATS systems</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
          {/* Left Column - Upload Area */}
          <div className="space-y-4">
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={handleClick}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
                  'bg-[#1E293B]/50',
                  dragOver
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-[#334155]/50 hover:border-blue-500/50 hover:bg-[#1E293B]/80'
                )}
              >
                <input ref={inputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                <div className="flex flex-col items-center gap-4">
                  <div className="p-5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Upload className="h-10 w-10 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">Drop your resume here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                  </div>
                  <Badge variant="outline" className="border-[#334155]/50 text-gray-400 bg-[#1E293B]/50 text-[10px]">
                    PDF only
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1E293B]/50 border border-[#334155]/50">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">Uploaded successfully</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetFile} className="shrink-0 text-gray-400 hover:text-white">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Preview Placeholder */}
                <div className="rounded-2xl border border-[#334155]/50 bg-[#1E293B]/50 flex items-center justify-center h-56">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <FileText className="h-14 w-14" />
                    <span className="text-xs text-gray-400">Resume Preview</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
                  onClick={handleAnalyze}
                  disabled={analyzing || analyzed}
                >
                  {analyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                  ) : analyzed ? (
                    <><CheckCircle className="h-4 w-4" /> Analyzed</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Analyze Resume</>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - AI Feedback Panel */}
          <div>
            {!analyzed ? (
              <div className="rounded-2xl border border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-xl h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="p-5 rounded-full bg-[#1E293B]/80 border border-[#334155]/50 mb-4">
                  <Gauge className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-base font-medium text-gray-300">Upload a resume to see analysis</p>
                <p className="text-sm text-gray-500 mt-1">Get your ATS score, suggestions, and more</p>
              </div>
            ) : !analysis ? (
              <div className="rounded-2xl border border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-xl h-full flex flex-col items-center justify-center py-20 text-center">
                <div className="p-5 rounded-full bg-[#1E293B]/80 border border-[#334155]/50 mb-4">
                  <Gauge className="h-12 w-12 text-gray-500" />
                </div>
                <p className="text-base font-medium text-gray-300">Upload a resume to see analysis</p>
                <p className="text-sm text-gray-500 mt-1">Get your ATS score, suggestions, and more</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-xl overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-[#334155]/50">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'flex-1 py-3.5 px-4 text-sm font-medium transition-all duration-200 relative',
                        activeTab === tab
                          ? 'text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      )}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Overview Tab */}
                  {activeTab === 'Overview' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col items-center py-4">
                        <AtsGauge value={analysis.atsScore} />
                        <p className="text-sm font-medium text-white mt-3">ATS Score</p>
                        <p className="text-xs text-gray-400 mt-1">How well your resume ranks against ATS parsers</p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Section Scores</p>
                        {Object.entries(analysis.sectionScores).map(([key, val]) => (
                          <div key={key} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{sectionLabels[key] || key}</span>
                              <span className="font-medium text-white">{val}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${val}%` }}
                                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                                className={cn('h-full rounded-full', progressColors[key])}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions Tab */}
                  {activeTab === 'Suggestions' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar"
                    >
                      {analysis.specificSuggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="p-4 rounded-xl bg-[#0F172A]/60 border border-[#334155]/50"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-1.5 rounded-lg shrink-0 mt-0.5',
                              sectionBadgeColors[s.section]?.replace(/bg-.*?text-.*?border-.*?\s/, '').trim() || 'bg-[#1E293B]/50'
                            )}>
                              <Lightbulb className="h-4 w-4 text-gray-300" />
                            </div>
                            <div className="min-w-0 space-y-1.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] capitalize border px-2 py-0.5',
                                  sectionBadgeColors[s.section] || 'border-[#334155]/50 text-gray-400'
                                )}
                              >
                                {s.section}
                              </Badge>
                              <p className="text-sm text-gray-300">{s.bullet}</p>
                              <p className="text-xs text-gray-400">{s.suggestion}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Keywords Tab */}
                  {activeTab === 'Keywords' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Missing Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingKeywords.map((kw) => (
                            <Badge
                              key={kw}
                              variant="outline"
                              className="text-xs px-3 py-1.5 border-rose-500/40 text-rose-300 bg-rose-500/10"
                            >
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                          <div className="space-y-2 flex-1">
                            <p className="text-sm font-medium text-amber-300">Action Verb Strength</p>
                            <p className="text-xs text-amber-400/80">
                              {analysis.actionVerbScore !== undefined
                                ? `Your resume uses ${analysis.actionVerbScore}% strong action verbs`
                                : 'Your resume uses 60% strong action verbs'}
                            </p>
                            <div className="h-2 rounded-full bg-[#0F172A] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${analysis.actionVerbScore || 60}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Rewrite Tab */}
                  {activeTab === 'Rewrite' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-5"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Rewrite This Bullet</p>
                          <p className="text-xs text-gray-500 mb-3">Paste a bullet point from your resume to get an AI-enhanced version</p>
                        </div>
                        <Textarea
                          placeholder="e.g. Worked on improving API performance..."
                          value={bullet}
                          onChange={(e) => setBullet(e.target.value)}
                          className="min-h-[100px] text-sm bg-[#0F172A]/80 border-[#334155]/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 resize-none"
                        />
                        <Button
                          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0"
                          onClick={handleRewrite}
                          disabled={!bullet.trim() || rewriting}
                        >
                          {rewriting ? (
                            <><RefreshCw className="h-4 w-4 animate-spin" /> Rewriting...</>
                          ) : (
                            <><PenLine className="h-4 w-4" /> Rewrite with AI</>
                          )}
                        </Button>
                      </div>

                      {rewritten && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/20"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-semibold text-blue-300">AI Enhanced Version</span>
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed">{rewritten}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 gap-1.5 text-xs h-8 text-gray-400 hover:text-white hover:bg-[#1E293B]/80"
                            onClick={() => navigator.clipboard.writeText(rewritten)}
                          >
                            <Download className="h-3 w-3" />
                            Copy
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
