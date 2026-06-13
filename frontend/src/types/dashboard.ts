export interface DashboardUser {
  id: string
  name: string
  email: string
  college: string | null
  branch: string | null
  graduationYear: number | null
  profileCompletion: number
  avatarUrl: string | null
}

export interface PlacementScore {
  id: string
  overall: number
  aptitude: number
  dsa: number
  coreSubjects: number
  communication: number
  resumeScore: number
  calculatedAt: string
}

export interface CompanyChance {
  id: string
  companyName: string
  chancePercent: number
}

export interface Streak {
  current: number
  longest: number
}

export interface Progress {
  problemsSolved: number
  mockInterviews: number
  roadmapCompletion: number
  resumeScore: number | null
  weeklyGrowth: number
  weeklyActivity: number[]
}

export interface GapAnalysis {
  strengths: string[]
  weakAreas: string[]
  missingSkills: string[]
  overallMatch: number | null
}

export interface ResumeInfo {
  atsScore: number | null
  actionVerbScore: number | null
  keywordsMissing: string[]
  fileName: string | null
  uploadedAt: string | null
}

export interface TopicPerformance {
  attempted: number
  passed: number
}

export interface RecentSubmission {
  id: string
  problemTitle: string
  language: string
  passedCases: number
  totalCases: number
  submittedAt: string
}

export interface CodingAnalytics {
  totalSubmissions: number
  passedSubmissions: number
  successRate: number
  totalProblemsSolved: number
  topicPerformance: Record<string, TopicPerformance>
  recentSubmissions: RecentSubmission[]
}

export interface InterviewAnalytics {
  totalInterviews: number
  averageScore: number | null
  averageCommunication: number | null
  averageWpm: number | null
  totalFillerCount: number
  improvement: {
    score: number
    communication: number
  }
  recentSessions: Array<{
    id: string
    type: string
    company: string | null
    overallScore: number | null
    createdAt: string
  }>
}

export interface RoadmapInfo {
  hasRoadmap: boolean
  overallProgress: number
  totalWeeks: number
  completedWeeks: number
  currentWeek: number | null
}

export interface TodayTask {
  label: string
  done: boolean
}

export interface DashboardResponse {
  user: DashboardUser
  placementScore: PlacementScore | null
  companyChances: CompanyChance[]
  streak: Streak
  progress: Progress
  gapAnalysis: GapAnalysis | null
  resume: ResumeInfo | null
  codingAnalytics: CodingAnalytics
  interviewAnalytics: InterviewAnalytics
  roadmap: RoadmapInfo
  todayTasks: TodayTask[]
}
