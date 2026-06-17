import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { uploadResumeApi, startGapAnalysisApi } from '@/services/api'
import { Upload, Search, Loader2, AlertTriangle, CheckCircle, XCircle, Download, ArrowRight, FileText, Code2, GitBranch } from 'lucide-react'
import { motion } from 'framer-motion'

interface LeetCodeData {
  solved: number
  total: number
  rating: number
  weakTopics: string[]
}

interface GitHubData {
  repos: number
  contributions: number
  languages: { name: string; percentage: number; color: string }[]
}

export default function GapAnalysis() {
  useAuthStore()
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [parsedSkills, setParsedSkills] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [leetcodeUsername, setLeetcodeUsername] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    missingSkills: string[]
    weakAreas: string[]
    strengths: string[]
    overallMatch: number
  } | null>(null)

  const [leetcodeData, setLeetcodeData] = useState<LeetCodeData | null>(null)
  const [leetcodeLoading, setLeetcodeLoading] = useState(false)
  const [githubData, setGithubData] = useState<GitHubData | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)

  const handleLeetcodeFetch = async () => {
    if (!leetcodeUsername.trim()) return
    setLeetcodeLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLeetcodeData({
      solved: 87,
      total: 150,
      rating: 1624,
      weakTopics: ['Dynamic Programming', 'Graphs', 'Segment Trees'],
    })
    setLeetcodeLoading(false)
  }

  const handleGithubFetch = async () => {
    if (!githubUsername.trim()) return
    setGithubLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setGithubData({
      repos: 24,
      contributions: 876,
      languages: [
        { name: 'Python', percentage: 40, color: '#3572A5' },
        { name: 'JavaScript', percentage: 30, color: '#F7DF1E' },
        { name: 'TypeScript', percentage: 20, color: '#3178C6' },
        { name: 'Java', percentage: 10, color: '#b07219' },
      ],
    })
    setGithubLoading(false)
  }

  const STEPS = ['Analyzing Resume', 'Evaluating Skills', 'Generating Report']

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) await handleUploadFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleUploadFile(file)
  }

  const handleUploadFile = async (file: File) => {
    setUploading(true)
    const result = await uploadResumeApi(file)
    if (result.data) {
      setResumeId(result.data.id)
      setParsedSkills(['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Git', 'REST APIs', 'HTML/CSS', 'MongoDB', 'Express'])
      setResumeUploaded(true)
    }
    setUploading(false)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setShowResults(false)
    setCurrentStep(0)

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 600)

    const result = await startGapAnalysisApi({
      resume_id: resumeId || undefined,
      leetcode_username: leetcodeUsername || undefined,
      github_username: githubUsername || undefined,
      target_role: 'SDE',
    })

    clearInterval(interval)
    setCurrentStep(STEPS.length)
    setAnalyzing(false)

    if (result.data) {
      setAnalysisResult({
        missingSkills: result.data.missingSkills,
        weakAreas: result.data.weakAreas,
        strengths: result.data.strengths,
        overallMatch: result.data.overallMatch,
      })
    }
    setShowResults(true)
  }

  const solvedPercentage = leetcodeData
    ? Math.round((leetcodeData.solved / leetcodeData.total) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Gap Analysis</h1>
          <p className="text-gray-400 mt-1">
            Identify skill gaps between your profile and industry expectations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0F172A]/80 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#1E293B]/50">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Resume Upload</h3>
              <p className="text-sm text-gray-400">Upload your resume to parse skills</p>
            </div>
          </div>
          {!resumeUploaded ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-[#334155] bg-[#1E293B]/50 rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragOver ? 'border-indigo-500 bg-indigo-500/10' : 'hover:border-indigo-500/50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileSelect} className="hidden" />
              {uploading ? (
                <Loader2 className="h-8 w-8 mx-auto text-indigo-400 mb-3 animate-spin" />
              ) : (
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-3" />
              )}
              <p className="text-sm font-medium text-gray-300 mb-1">{uploading ? 'Uploading...' : 'Drop PDF here'}</p>
              <p className="text-xs text-gray-500">or click to browse</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Resume uploaded successfully</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {parsedSkills.map((skill) => (
                  <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#0F172A]/80 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#1E293B]/50">
              <Code2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">LeetCode Username</h3>
              <p className="text-sm text-gray-400">Fetch your coding stats</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                placeholder="e.g. johndoe"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLeetcodeFetch()}
                className="flex-1 h-10 px-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              <button
                onClick={handleLeetcodeFetch}
                disabled={leetcodeLoading}
                className="h-10 px-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
              >
                {leetcodeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
            {leetcodeData && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1E293B]/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Solved</p>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-lg font-bold text-white">{leetcodeData.solved}</span>
                      <span className="text-xs text-gray-400">/{leetcodeData.total}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${solvedPercentage}%`, background: solvedPercentage > 60 ? 'linear-gradient(to right, #22c55e, #16a34a)' : solvedPercentage > 30 ? 'linear-gradient(to right, #eab308, #ca8a04)' : 'linear-gradient(to right, #ef4444, #dc2626)' }}
                      />
                    </div>
                  </div>
                  <div className="bg-[#1E293B]/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Rating</p>
                    <p className="text-lg font-bold text-white">{leetcodeData.rating}</p>
                    <p className="text-xs text-gray-500 mt-1">contest</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Weak Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {leetcodeData.weakTopics.map((topic) => (
                      <span key={topic} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0F172A]/80 border border-[#334155]/50 rounded-2xl backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[#1E293B]/50">
              <GitBranch className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">GitHub Username</h3>
              <p className="text-sm text-gray-400">Fetch your coding activity</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                placeholder="e.g. johndoe"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGithubFetch()}
                className="flex-1 h-10 px-3 rounded-xl bg-[#1E293B]/50 border border-[#334155]/50 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
              />
              <button
                onClick={handleGithubFetch}
                disabled={githubLoading}
                className="h-10 px-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
              >
                {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </button>
            </div>
            {githubData && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1E293B]/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Repositories</p>
                    <p className="text-lg font-bold text-white">{githubData.repos}</p>
                  </div>
                  <div className="bg-[#1E293B]/50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">Contributions</p>
                    <p className="text-lg font-bold text-white">{githubData.contributions}</p>
                    <p className="text-xs text-gray-500 mt-1">this year</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1.5">Top Languages</p>
                  <div className="space-y-1.5">
                    {githubData.languages.map((lang) => (
                      <div key={lang.name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-300 w-20 truncate">{lang.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-[#1E293B] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !resumeUploaded}
          className="min-w-[200px] h-12 text-base gap-2 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg shadow-indigo-500/25"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze Now
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {analyzing && (
          <div className="w-full max-w-md space-y-3">
            {STEPS.map((step, index) => {
              const isActive = currentStep === index
              const isComplete = currentStep > index
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-all duration-300 shrink-0 ${
                      isComplete
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                        : isActive
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                          : 'border-gray-600 text-gray-500'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isComplete
                        ? 'text-emerald-400 font-medium'
                        : isActive
                          ? 'text-white font-medium'
                          : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                  {isActive && (
                    <div className="flex-1 h-1 rounded-full bg-[#1E293B] overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {showResults && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-[#334155]/50" />
              <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
              <div className="h-px flex-1 bg-[#334155]/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0F172A]/80 border border-rose-500/30 rounded-2xl backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="h-5 w-5 text-rose-400" />
                  <h3 className="text-base font-semibold text-white">Missing Skills</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Skills you should acquire</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills.map((skill) => (
                    <div key={skill} className="group relative">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="h-3 w-3" />
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A]/80 border border-amber-500/30 rounded-2xl backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-semibold text-white">Weak Areas</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Topics needing improvement</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.weakAreas.map((area) => (
                    <div key={area} className="group relative">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="h-3 w-3" />
                        {area}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0F172A]/80 border border-emerald-500/30 rounded-2xl backdrop-blur-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">Strengths</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">Your strong skill areas</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.strengths.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Overall Match:</span>
                <span className="font-bold text-white">{analysisResult.overallMatch}%</span>
                <div className="w-24 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${analysisResult.overallMatch}%` }}
                  />
                </div>
              </div>
              <button className="h-9 px-4 rounded-xl text-sm font-medium text-gray-300 bg-[#1E293B]/50 border border-[#334155]/50 hover:bg-[#1E293B] transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
