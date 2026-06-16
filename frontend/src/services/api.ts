import { useAuthStore } from '@/store/authStore'

const API_BASE = 'http://localhost:5000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    const json = await res.json()
    if (!res.ok) {
      if (res.status === 401 && token) {
        useAuthStore.getState().logout()
      }
      return { error: json.error || 'Request failed', code: json.code }
    }
    return { data: json }
  } catch {
    return { error: 'Network error', code: 'NETWORK_ERROR' }
  }
}

async function uploadRequest<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) {
      if (res.status === 401 && token) {
        useAuthStore.getState().logout()
      }
      return { error: json.error || 'Upload failed', code: json.code }
    }
    return { data: json }
  } catch {
    return { error: 'Network error', code: 'NETWORK_ERROR' }
  }
}

export interface AuthUser {
  id: string
  email: string
  name: string
  college?: string
  branch?: string
  graduationYear?: number
}

interface LoginResponse {
  user: AuthUser
  token: string
}

interface RegisterResponse {
  user: AuthUser
  token: string
}

export function loginApi(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function registerApi(name: string, email: string, password: string) {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export function logoutApi() {
  return request('/auth/logout', { method: 'POST' })
}

export function getProfileApi() {
  return request<{ user: AuthUser }>('/auth/me')
}

export function updateProfileApi(data: Partial<AuthUser>) {
  return request<{ user: AuthUser }>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function changePasswordApi(currentPassword: string, newPassword: string) {
  return request<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export interface PlacementScoreData {
  id: string
  overall: number
  aptitude: number
  dsa: number
  coreSubjects: number
  communication: number
  resumeScore: number
  companyChances: { id: string; companyName: string; chancePercent: number }[]
}

export function getPlacementScoreApi(userId: string) {
  return request<PlacementScoreData>(`/score/${userId}`)
}

export function calculateScoreApi(data: {
  aptitude_quiz_results?: { score: number }
  dsa_stats?: { score: number }
  core_quiz_results?: { score: number }
  communication_session_id?: string
  resume_id?: string
}) {
  return request<PlacementScoreData>('/score/calculate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface CompanyData {
  id: string
  name: string
  slug: string
  logo: string
  avgPackage: string
  difficulty: string
  interviewRounds: number
}

export interface CompanyDetailData extends CompanyData {
  rounds: { name: string; description: string; duration: string }[]
  topQuestions: { id: number; question: string; category: string; difficulty: string; topic: string }[]
  topics: { id: string; name: string; completed: boolean }[]
}

export function getCompaniesApi() {
  return request<CompanyData[]>('/companies')
}

export function getCompanyApi(slug: string) {
  return request<CompanyDetailData>(`/companies/${slug}`)
}

export function getCompanyQuestionsApi(slug: string, params?: { difficulty?: string; topic?: string; page?: string }) {
  const qs = new URLSearchParams()
  if (params?.difficulty) qs.set('difficulty', params.difficulty)
  if (params?.topic) qs.set('topic', params.topic)
  if (params?.page) qs.set('page', params.page)
  const query = qs.toString()
  return request<{ questions: CompanyDetailData['topQuestions']; total: number; page: number; perPage: number }>(
    `/companies/${slug}/questions${query ? `?${query}` : ''}`
  )
}

export interface GapAnalysisResponse {
  jobId: string
  id: string
  missingSkills: string[]
  weakAreas: string[]
  strengths: string[]
  overallMatch: number
  resumeSkills: string[]
  leetcodeStats: string
  githubStats: string
}

export function startGapAnalysisApi(data: {
  resume_id?: string
  leetcode_username?: string
  github_username?: string
  target_role?: string
}) {
  return request<GapAnalysisResponse>('/gap-analysis/start', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getGapAnalysisStatusApi(jobId: string) {
  return request<{ status: string; progress: number }>(`/gap-analysis/${jobId}/status`)
}

export function getGapAnalysisResultApi(id: string) {
  return request<GapAnalysisResponse>(`/gap-analysis/${id}/result`)
}

export interface InterviewSessionData {
  sessionId: string
  first_question: string
}

export function startInterviewApi(data: { type: string; company?: string }) {
  return request<InterviewSessionData>('/interview/session/start', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function endInterviewApi(id: string, data: { duration: number }) {
  return request<any>(`/interview/session/${id}/end`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getInterviewReportApi(id: string) {
  return request<any>(`/interview/session/${id}/report`)
}

export interface CodingProblemData {
  id: string
  title: string
  description: string
  difficulty: string
  topic: string
  companyTags: string[]
  constraints: string[]
  examples: { input: string; output: string; explanation?: string }[]
  solutionApproach: string
  optimalComplexity: { time: string; space: string }
  starterCode: { python: string; java: string; cpp: string; javascript: string }
  testCases: { input: string; expectedOutput: string }[]
}

export function getProblemsApi(params?: { topic?: string; difficulty?: string; company?: string; page?: string }) {
  const qs = new URLSearchParams()
  if (params?.topic) qs.set('topic', params.topic)
  if (params?.difficulty) qs.set('difficulty', params.difficulty)
  if (params?.company) qs.set('company', params.company)
  if (params?.page) qs.set('page', params.page)
  const query = qs.toString()
  return request<{ problems: CodingProblemData[]; total: number; page: number; perPage: number }>(
    `/problems${query ? `?${query}` : ''}`
  )
}

export function getProblemApi(id: string) {
  return request<CodingProblemData>(`/problems/${id}`)
}

export function submitProblemApi(id: string, data: { code: string; language: string; user_id?: string }) {
  return request<any>(`/problems/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface RoadmapData {
  id: string
  targetCompany: string
  currentLevel: string
  dailyHours: number
  startDate: string
  endDate: string
  weeks: {
    id: string
    weekNumber: number
    phase: string
    topic: string
    resourceCount: number
    estimatedHours: number
    completed: boolean
    resources?: { title: string; url: string; type: string }[]
  }[]
}

export function generateRoadmapApi(data: {
  target_company: string
  current_level: string
  daily_hours: number
  target_date?: string
}) {
  return request<RoadmapData>('/roadmap/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getActiveRoadmapApi(userId: string) {
  return request<RoadmapData>(`/roadmap/${userId}/active`)
}

export function completeWeekApi(weekId: string, completed: boolean = true) {
  return request<any>(`/roadmap/week/${weekId}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}

export interface ResumeUploadResponse {
  id: string
  fileName: string
}

export function uploadResumeApi(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadRequest<ResumeUploadResponse>('/resume/upload', formData)
}

export interface ResumeAnalysisData {
  atsScore: number
  sectionScores: Record<string, number>
  missingKeywords: string[]
  actionVerbScore?: number
  specificSuggestions: { section: string; bullet: string; suggestion: string }[]
}

export function analyzeResumeApi(id: string) {
  return request<ResumeAnalysisData>(`/resume/${id}/analyze`, { method: 'POST' })
}

export function getResumeFeedbackApi(id: string) {
  return request<any>(`/resume/${id}/feedback`)
}

export function rewriteBulletApi(id: string, data: { bullet_text: string; role?: string }) {
  return request<{ original: string; improved: string; role?: string }>(`/resume/${id}/rewrite-bullet`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    college: string | null
    branch: string | null
    graduationYear: number | null
    profileCompletion: number
    avatarUrl: string | null
  }
  placementScore: {
    id: string
    overall: number
    aptitude: number
    dsa: number
    coreSubjects: number
    communication: number
    resumeScore: number
    calculatedAt: string
  } | null
  companyChances: Array<{ id: string; companyName: string; chancePercent: number }>
  streak: { current: number; longest: number }
  progress: {
    problemsSolved: number
    mockInterviews: number
    roadmapCompletion: number
    resumeScore: number | null
    weeklyGrowth: number
    weeklyActivity: number[]
  }
  gapAnalysis: {
    strengths: string[]
    weakAreas: string[]
    missingSkills: string[]
    overallMatch: number | null
  } | null
  resume: {
    atsScore: number | null
    actionVerbScore: number | null
    keywordsMissing: string[]
    fileName: string | null
    uploadedAt: string | null
  } | null
  codingAnalytics: {
    totalSubmissions: number
    passedSubmissions: number
    successRate: number
    totalProblemsSolved: number
    topicPerformance: Record<string, { attempted: number; passed: number }>
    recentSubmissions: Array<{
      id: string
      problemTitle: string
      language: string
      passedCases: number
      totalCases: number
      submittedAt: string
    }>
  }
  interviewAnalytics: {
    totalInterviews: number
    averageScore: number | null
    averageCommunication: number | null
    averageWpm: number | null
    totalFillerCount: number
    improvement: { score: number; communication: number }
    recentSessions: Array<{
      id: string
      type: string
      company: string | null
      overallScore: number | null
      createdAt: string
    }>
  }
  roadmap: {
    hasRoadmap: boolean
    overallProgress: number
    totalWeeks: number
    completedWeeks: number
    currentWeek: number | null
  }
  todayTasks: Array<{ label: string; done: boolean }>
}

export function fetchDashboard() {
  return request<DashboardData>('/dashboard')
}

export interface AssessmentData {
  id: string
  title: string
  description: string
  type: string
  duration: number
  totalQuestions: number
  totalMarks: number
  passingMarks: number
  isActive: boolean
  createdAt: string
  _count?: { questions: number }
}

export interface AssessmentQuestionData {
  id: string
  assessmentId: string
  questionType: string
  questionData: any
  difficulty: string
  topic: string
  marks: number
  orderIndex: number
}

export interface AssessmentDetailData extends AssessmentData {
  questions: AssessmentQuestionData[]
}

export interface AssessmentAttemptData {
  id: string
  userId: string
  assessmentId: string
  status: string
  score: number | null
  totalMarks: number | null
  accuracy: number | null
  startedAt: string
  submittedAt: string | null
  timeTaken: number | null
  sectionScores: any | null
  strengths: string[]
  weaknesses: string[]
  suggestions: any | null
  assessment?: { id: string; title: string; type: string }
  answers?: AssessmentAnswerData[]
}

export interface AssessmentAnswerData {
  id: string
  attemptId: string
  questionId: string
  answer: string | null
  isCorrect: boolean | null
  marksObtained: number | null
  reviewed: boolean
  question?: AssessmentQuestionData
}

export function getAssessmentsApi() {
  return request<AssessmentData[]>('/assessments')
}

export function getAssessmentApi(id: string) {
  return request<AssessmentDetailData>(`/assessments/${id}`)
}

export function startAssessmentApi(id: string) {
  return request<AssessmentAttemptData>(`/assessments/${id}/start`, { method: 'POST' })
}

export function submitAssessmentApi(id: string, data: { attemptId: string; answers: { questionId: string; answer: string }[]; timeTaken: number }) {
  return request<AssessmentAttemptData>(`/assessments/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getAssessmentAttemptsApi(id: string) {
  return request<AssessmentAttemptData[]>(`/assessments/${id}/attempts`)
}

export function getAttemptApi(attemptId: string) {
  return request<AssessmentAttemptData>(`/assessments/attempt/${attemptId}`)
}

export function getAllAttemptsApi() {
  return request<AssessmentAttemptData[]>('/assessments/attempts/all')
}
