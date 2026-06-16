import { prisma } from '../index'

interface DashboardResponse {
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
  companyChances: Array<{
    id: string
    companyName: string
    chancePercent: number
  }>
  streak: {
    current: number
    longest: number
  }
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
  roadmap: {
    hasRoadmap: boolean
    overallProgress: number
    totalWeeks: number
    completedWeeks: number
    currentWeek: number | null
  }
  todayTasks: Array<{
    label: string
    done: boolean
  }>
}

function computeProfileCompletion(user: {
  name: string
  college: string | null
  branch: string | null
  graduationYear: number | null
  avatarUrl: string | null
  profile: { currentLevel: string | null; targetCompany: string | null } | null
}): number {
  let filled = 1
  let total = 6
  if (user.college) filled++
  if (user.branch) filled++
  if (user.graduationYear) filled++
  if (user.avatarUrl) filled++
  if (user.profile?.targetCompany) filled++
  return Math.round((filled / total) * 100)
}

async function calculateStreak(userId: string): Promise<{ current: number; longest: number }> {
  try {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })

    if (activities.length === 0) return { current: 0, longest: 0 }

    const dates = [...new Set(activities.map(a => a.createdAt.toISOString().split('T')[0]))].sort().reverse()
    let current = 1
    let longest = 1
    let tempLongest = 1

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
      if (Math.abs(diff - 1) < 0.1) {
        tempLongest++
      } else {
        if (i === 1) current = tempLongest
        longest = Math.max(longest, tempLongest)
        tempLongest = 1
      }
    }
    longest = Math.max(longest, tempLongest)

    const today = new Date().toISOString().split('T')[0]
    const latestActivity = dates[0]
    const diffFromToday = Math.round((new Date(today).getTime() - new Date(latestActivity).getTime()) / (1000 * 60 * 60 * 24))
    if (diffFromToday > 1) current = 0

    return { current, longest }
  } catch {
    return { current: 0, longest: 0 }
  }
}

export async function getDashboard(userId: string): Promise<DashboardResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404, code: 'USER_NOT_FOUND' })
  }

  const profileCompletion = computeProfileCompletion(user)

  const [latestScore, codingSubmissions, interviewSessions, gapAnalysis, resume, roadmapData, userActivities] = await Promise.all([
    prisma.placementScore.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      include: { companyChances: true },
    }),
    prisma.codingSubmission.findMany({
      where: { userId },
      include: { problem: { select: { title: true, topic: true } } },
      orderBy: { submittedAt: 'desc' },
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.gapAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.resume.findFirst({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { weeks: true },
    }),
    prisma.userActivity.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const companyChances = latestScore?.companyChances.map(c => ({
    id: c.id,
    companyName: c.companyName,
    chancePercent: c.chancePercent,
  })) || []

  const streak = await calculateStreak(userId)

  const totalSubmissions = codingSubmissions.length
  const passedSubmissions = codingSubmissions.filter(s => s.passedCases === s.totalCases && s.totalCases > 0).length
  const successRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0
  const uniqueProblems = new Set(codingSubmissions.map(s => s.problemId)).size

  const topicMap: Record<string, { attempted: number; passed: number }> = {}
  for (const s of codingSubmissions) {
    const topic = s.problem.topic
    if (!topicMap[topic]) topicMap[topic] = { attempted: 0, passed: 0 }
    topicMap[topic].attempted++
    if (s.passedCases === s.totalCases && s.totalCases > 0) topicMap[topic].passed++
  }

  const recentSubmissions = codingSubmissions.slice(0, 5).map(s => ({
    id: s.id,
    problemTitle: s.problem.title,
    language: s.language,
    passedCases: s.passedCases,
    totalCases: s.totalCases,
    submittedAt: s.submittedAt.toISOString(),
  }))

  const totalInterviews = interviewSessions.length
  const scoredSessions = interviewSessions.filter(s => s.overallScore !== null)
  const scores = scoredSessions.map(s => s.overallScore!)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const totalFillerCount = interviewSessions.reduce((sum, s) => sum + s.fillerCount, 0)
  const sessionsWithWpm = interviewSessions.filter(s => s.wpm !== null)
  const avgWpm = sessionsWithWpm.length > 0
    ? Math.round(sessionsWithWpm.reduce((sum, s) => sum + (s.wpm || 0), 0) / sessionsWithWpm.length)
    : null

  let scoreImprovement = 0
  let commImprovement = 0
  if (interviewSessions.length >= 2) {
    const sorted = [...interviewSessions].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    const first = sorted[0].overallScore || 0
    const last = sorted[sorted.length - 1].overallScore || 0
    scoreImprovement = last - first
  }

  const roadmap = roadmapData
    ? {
        hasRoadmap: true,
        overallProgress: roadmapData.overallProgress,
        totalWeeks: roadmapData.weeks.length,
        completedWeeks: roadmapData.weeks.filter(w => w.completed).length,
        currentWeek: roadmapData.weeks.find(w => !w.completed)?.weekNumber ?? null,
      }
    : { hasRoadmap: false, overallProgress: 0, totalWeeks: 0, completedWeeks: 0, currentWeek: null }

  const weeklyActivity = buildWeeklyActivity(userActivities)
  const weeklyGrowth = computeWeeklyGrowth(weeklyActivity)

  const today = new Date().toISOString().split('T')[0]
  const todaySubmissions = codingSubmissions.filter(s => s.submittedAt.toISOString().split('T')[0] === today).length
  const todayInterviews = interviewSessions.filter(s => s.createdAt.toISOString().split('T')[0] === today).length
  const resumeUpdatedToday = resume?.uploadedAt ? resume.uploadedAt.toISOString().split('T')[0] === today : false

  const todayTasks = [
    { label: 'Solve 3 Coding Problems', done: todaySubmissions >= 3 },
    { label: 'Attend Mock Interview', done: todayInterviews >= 1 },
    { label: 'Update Resume', done: resumeUpdatedToday },
    { label: 'Complete a Quiz', done: false },
  ]

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      profileCompletion,
      avatarUrl: user.avatarUrl,
    },
    placementScore: latestScore ? {
      id: latestScore.id,
      overall: latestScore.overall,
      aptitude: latestScore.aptitude,
      dsa: latestScore.dsa,
      coreSubjects: latestScore.coreSubjects,
      communication: latestScore.communication,
      resumeScore: latestScore.resumeScore,
      calculatedAt: latestScore.calculatedAt.toISOString(),
    } : null,
    companyChances,
    streak,
    progress: {
      problemsSolved: uniqueProblems,
      mockInterviews: totalInterviews,
      roadmapCompletion: roadmap.overallProgress,
      resumeScore: resume?.atsScore ?? null,
      weeklyGrowth,
      weeklyActivity,
    },
    gapAnalysis: gapAnalysis ? {
      strengths: gapAnalysis.strengths,
      weakAreas: gapAnalysis.weakAreas,
      missingSkills: gapAnalysis.missingSkills,
      overallMatch: gapAnalysis.overallMatch,
    } : null,
    resume: resume ? {
      atsScore: resume.atsScore,
      actionVerbScore: resume.actionVerbScore,
      keywordsMissing: resume.keywordsMissing,
      fileName: resume.fileName,
      uploadedAt: resume.uploadedAt.toISOString(),
    } : null,
    codingAnalytics: {
      totalSubmissions,
      passedSubmissions,
      successRate,
      totalProblemsSolved: uniqueProblems,
      topicPerformance: topicMap,
      recentSubmissions,
    },
    interviewAnalytics: {
      totalInterviews,
      averageScore,
      averageCommunication: averageScore,
      averageWpm: avgWpm,
      totalFillerCount,
      improvement: { score: scoreImprovement, communication: commImprovement },
      recentSessions: interviewSessions.slice(0, 5).map(s => ({
        id: s.id,
        type: s.type,
        company: s.company,
        overallScore: s.overallScore,
        createdAt: s.createdAt.toISOString(),
      })),
    },
    roadmap,
    todayTasks,
  }
}

function buildWeeklyActivity(activities: { createdAt: Date }[]): number[] {
  const weekly: number[] = new Array(7).fill(0)
  const now = new Date()
  for (const a of activities) {
    const diff = Math.round((now.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 0 && diff < 7) {
      weekly[6 - diff]++
    }
  }
  return weekly
}

function computeWeeklyGrowth(weekly: number[]): number {
  const latest = weekly[weekly.length - 1] || 0
  const prevSum = weekly.slice(0, -1).reduce((a, b) => a + b, 0)
  const prevCount = Math.max(weekly.length - 1, 1)
  const prevAvg = prevSum / prevCount
  if (prevAvg === 0) return latest > 0 ? 100 : 0
  return Math.round(((latest - prevAvg) / prevAvg) * 100)
}
