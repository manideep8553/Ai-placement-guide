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
      return { error: json.error || 'Request failed', code: json.code }
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
    recentSubmissions: Array<{ id: string; problemTitle: string; language: string; passedCases: number; totalCases: number; submittedAt: string }>
  }
  interviewAnalytics: {
    totalInterviews: number
    averageScore: number | null
    averageCommunication: number | null
    averageWpm: number | null
    totalFillerCount: number
    improvement: { score: number; communication: number }
    recentSessions: Array<{ id: string; type: string; company: string | null; overallScore: number | null; createdAt: string }>
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
  return request<DashboardData>('/dashboard', { method: 'GET' })
}
