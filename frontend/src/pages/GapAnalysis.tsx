import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { mockGapAnalysisResult } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { Upload, Search, GitBranch, AlertTriangle, CheckCircle, XCircle, Download, ArrowRight, Loader2, FileText, Code2, BookOpen } from 'lucide-react'
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

const INITIAL_LEETCODE_DATA: LeetCodeData = {
  solved: 124,
  total: 200,
  rating: 1689,
  weakTopics: ['Dynamic Programming', 'Graphs', 'Trees'],
}

const INITIAL_GITHUB_DATA: GitHubData = {
  repos: 24,
  contributions: 587,
  languages: [
    { name: 'TypeScript', percentage: 40, color: '#3178C6' },
    { name: 'Python', percentage: 25, color: '#3572A5' },
    { name: 'JavaScript', percentage: 20, color: '#F7DF1E' },
    { name: 'Java', percentage: 10, color: '#B07219' },
    { name: 'Go', percentage: 5, color: '#00ADD8' },
  ],
}

const STEPS = ['Analyzing Resume', 'Evaluating Skills', 'Generating Report']

export default function GapAnalysis() {
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [parsedSkills, setParsedSkills] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [leetcodeUsername, setLeetcodeUsername] = useState('')
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeData | null>(null)
  const [leetcodeLoading, setLeetcodeLoading] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [githubData, setGithubData] = useState<GitHubData | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setParsedSkills(['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Git', 'REST APIs', 'HTML/CSS', 'MongoDB', 'Express'])
    setResumeUploaded(true)
  }

  const handleLeetcodeFetch = () => {
    if (!leetcodeUsername.trim()) return
    setLeetcodeLoading(true)
    setTimeout(() => {
      setLeetcodeData(INITIAL_LEETCODE_DATA)
      setLeetcodeLoading(false)
    }, 1200)
  }

  const handleGithubFetch = () => {
    if (!githubUsername.trim()) return
    setGithubLoading(true)
    setTimeout(() => {
      setGithubData(INITIAL_GITHUB_DATA)
      setGithubLoading(false)
    }, 1200)
  }

  const handleAnalyze = () => {
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

    setTimeout(() => {
      clearInterval(interval)
      setCurrentStep(STEPS.length)
      setAnalyzing(false)
      setShowResults(true)
    }, 2000)
  }

  const solvedPercentage = leetcodeData
    ? Math.round((leetcodeData.solved / leetcodeData.total) * 100)
    : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gap Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Identify skill gaps between your profile and industry expectations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Resume Upload</CardTitle>
                <CardDescription>Upload your resume to parse skills</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!resumeUploaded ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">Drop PDF here</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Resume uploaded successfully</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">LeetCode Username</CardTitle>
                <CardDescription>Fetch your coding stats</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. johndoe"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLeetcodeFetch()}
              />
              <Button size="sm" onClick={handleLeetcodeFetch} disabled={leetcodeLoading}>
                {leetcodeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {leetcodeData && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Solved</p>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <span className="text-lg font-bold">{leetcodeData.solved}</span>
                      <span className="text-xs text-muted-foreground">/{leetcodeData.total}</span>
                    </div>
                    <Progress value={solvedPercentage} className="mt-2 h-1.5" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Rating</p>
                    <p className="text-lg font-bold">{leetcodeData.rating}</p>
                    <p className="text-xs text-muted-foreground mt-1">contest</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Weak Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {leetcodeData.weakTopics.map((topic) => (
                      <Badge key={topic} variant="warning" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">GitHub Username</CardTitle>
                <CardDescription>Fetch your coding activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. johndoe"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGithubFetch()}
              />
              <Button size="sm" onClick={handleGithubFetch} disabled={githubLoading}>
                {githubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            {githubData && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Repositories</p>
                    <p className="text-lg font-bold">{githubData.repos}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Contributions</p>
                    <p className="text-lg font-bold">{githubData.contributions}</p>
                    <p className="text-xs text-muted-foreground mt-1">this year</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Top Languages</p>
                  <div className="space-y-1.5">
                    {githubData.languages.map((lang) => (
                      <div key={lang.name} className="flex items-center gap-2">
                        <span className="text-xs w-20 truncate">{lang.name}</span>
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={analyzing || !resumeUploaded}
          className="min-w-[200px] h-12 text-base gap-2"
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
        </Button>

        {analyzing && (
          <div className="w-full max-w-md space-y-3">
            {STEPS.map((step, index) => {
              const isActive = currentStep === index
              const isComplete = currentStep > index
              return (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-all duration-300 shrink-0",
                      isComplete
                        ? "border-success bg-success text-white"
                        : isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 text-muted-foreground/50"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      isComplete
                        ? "text-success font-medium"
                        : isActive
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/50"
                    )}
                  >
                    {step}
                  </span>
                  {isActive && (
                    <div className="flex-1 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary animate-pulse" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full space-y-6"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-red-200/50 dark:border-red-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-base">Missing Skills</CardTitle>
                  </div>
                  <CardDescription>Skills you should acquire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockGapAnalysisResult.missingSkills.map((skill) => (
                      <div key={skill} className="group relative">
                        <Badge variant="destructive" className="text-xs pr-1.5">
                          {skill}
                          <div className="ml-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="cursor-pointer rounded-full hover:bg-destructive/20 p-0.5" title="Add to Roadmap">
                              <BookOpen className="h-3 w-3" />
                            </span>
                            <span className="cursor-pointer rounded-full hover:bg-destructive/20 p-0.5" title="Find Resources">
                              <Search className="h-3 w-3" />
                            </span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Add to Roadmap
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <Search className="h-3.5 w-3.5" />
                      Find Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200/50 dark:border-amber-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    <CardTitle className="text-base">Weak Areas</CardTitle>
                  </div>
                  <CardDescription>Topics needing improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockGapAnalysisResult.weakAreas.map((area) => (
                      <div key={area} className="group relative">
                        <Badge variant="warning" className="text-xs pr-1.5">
                          {area}
                          <div className="ml-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="cursor-pointer rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 p-0.5" title="Add to Roadmap">
                              <BookOpen className="h-3 w-3" />
                            </span>
                            <span className="cursor-pointer rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 p-0.5" title="Find Resources">
                              <Search className="h-3 w-3" />
                            </span>
                          </div>
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      Add to Roadmap
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <Search className="h-3.5 w-3.5" />
                      Find Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200/50 dark:border-emerald-900/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <CardTitle className="text-base">Strengths</CardTitle>
                  </div>
                  <CardDescription>Your strong skill areas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mockGapAnalysisResult.strengths.map((skill) => (
                      <Badge key={skill} variant="success" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Overall Match:</span>
                <span className="font-bold text-foreground">{mockGapAnalysisResult.overallMatch}%</span>
                <Progress value={mockGapAnalysisResult.overallMatch} className="w-24 h-2" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
