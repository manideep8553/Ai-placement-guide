import { prisma } from '../index'

interface SubScoreDetail {
  label: string
  value: number
  max: number
}

interface SubScore {
  score: number
  details: SubScoreDetail[]
}

interface CompanyEligibility {
  companyName: string
  chancePercent: number
  category: string
  missingSkills: string[]
  avgPackage: string
}

interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

interface RoadmapItem {
  phase: string
  title: string
  tasks: string[]
  duration: string
}

export interface PlacementTwinResponse {
  readinessScore: number
  subScores: {
    dsa: SubScore
    resume: SubScore
    interview: SubScore
    aptitude: SubScore
    projects: SubScore
    communication: SubScore
    consistency: SubScore
  }
  companyEligibility: CompanyEligibility[]
  predictedPackage: { min: number; max: number; currency: string }
  interviewReadiness: { level: string; score: number }
  strengths: string[]
  weaknesses: string[]
  missingSkills: string[]
  recommendations: Recommendation[]
  improvementRoadmap: RoadmapItem[]
  lastUpdated: string
}

const WEIGHTS = {
  dsa: 0.25,
  resume: 0.15,
  interview: 0.15,
  aptitude: 0.10,
  projects: 0.10,
  communication: 0.10,
  consistency: 0.15,
}

const DIFFICULTY_WEIGHTS: Record<string, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
}

const COMPANY_BENCHMARKS: Record<string, {
  category: string
  minReadiness: number
  minDsa: number
  minAptitude: number
  minCommunication: number
  avgPackage: string
  requiredSkills: string[]
}> = {
  TCS: { category: 'Service', minReadiness: 40, minDsa: 30, minAptitude: 35, minCommunication: 40, avgPackage: '₹3.5 - ₹7 LPA', requiredSkills: ['Java', 'SQL', 'Basic DSA', 'Communication'] },
  Infosys: { category: 'Service', minReadiness: 45, minDsa: 35, minAptitude: 40, minCommunication: 40, avgPackage: '₹3.5 - ₹8 LPA', requiredSkills: ['Java', 'Python', 'SQL', 'DSA'] },
  Wipro: { category: 'Service', minReadiness: 40, minDsa: 30, minAptitude: 35, minCommunication: 35, avgPackage: '₹3 - ₹6.5 LPA', requiredSkills: ['Any Language', 'SQL', 'Basic Aptitude'] },
  Accenture: { category: 'Service', minReadiness: 50, minDsa: 40, minAptitude: 45, minCommunication: 45, avgPackage: '₹4.5 - ₹9 LPA', requiredSkills: ['Java', 'Python', 'SQL', 'DSA', 'Communication'] },
  'HCL Technologies': { category: 'Service', minReadiness: 40, minDsa: 30, minAptitude: 35, minCommunication: 35, avgPackage: '₹3 - ₹6 LPA', requiredSkills: ['Any Language', 'Basic DSA'] },
  'Tech Mahindra': { category: 'Service', minReadiness: 45, minDsa: 35, minAptitude: 40, minCommunication: 40, avgPackage: '₹3.5 - ₹7 LPA', requiredSkills: ['Java', 'SQL', 'DSA'] },
  'Cognizant': { category: 'Service', minReadiness: 45, minDsa: 35, minAptitude: 40, minCommunication: 40, avgPackage: '₹4 - ₹8 LPA', requiredSkills: ['Java', 'Python', 'SQL', 'Communication'] },
  'Capgemini': { category: 'Service', minReadiness: 50, minDsa: 40, minAptitude: 40, minCommunication: 45, avgPackage: '₹4 - ₹8 LPA', requiredSkills: ['Java', 'SQL', 'DSA', 'Communication'] },
  'Amazon': { category: 'Product', minReadiness: 70, minDsa: 75, minAptitude: 60, minCommunication: 65, avgPackage: '₹20 - ₹40 LPA', requiredSkills: ['DSA', 'System Design', 'Java/Python', 'DBMS', 'OOP', 'Problem Solving'] },
  'Microsoft': { category: 'Product', minReadiness: 72, minDsa: 75, minAptitude: 65, minCommunication: 65, avgPackage: '₹22 - ₹45 LPA', requiredSkills: ['DSA', 'System Design', 'C++/Java', 'DBMS', 'OS', 'Problem Solving'] },
  'Google': { category: 'Product', minReadiness: 80, minDsa: 85, minAptitude: 70, minCommunication: 70, avgPackage: '₹30 - ₹55 LPA', requiredSkills: ['Advanced DSA', 'System Design', 'C++/Java/Python', 'OS', 'DBMS', 'Networking', 'Problem Solving'] },
  'Meta': { category: 'Product', minReadiness: 78, minDsa: 80, minAptitude: 65, minCommunication: 70, avgPackage: '₹28 - ₹50 LPA', requiredSkills: ['Advanced DSA', 'System Design', 'React', 'Java/Python', 'Problem Solving'] },
  'Adobe': { category: 'Product', minReadiness: 70, minDsa: 72, minAptitude: 60, minCommunication: 65, avgPackage: '₹18 - ₹35 LPA', requiredSkills: ['DSA', 'System Design', 'Java/Python', 'OOP', 'DBMS'] },
  'Virtusa': { category: 'Service', minReadiness: 45, minDsa: 35, minAptitude: 40, minCommunication: 40, avgPackage: '₹3.5 - ₹7 LPA', requiredSkills: ['Java', 'SQL', 'DSA', 'Communication'] },
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function weightedScore(details: SubScoreDetail[], weights?: number[]): number {
  const w = weights || details.map(() => 1)
  const totalWeight = w.reduce((a, b) => a + b, 0)
  if (totalWeight === 0) return 0
  let score = 0
  for (let i = 0; i < details.length; i++) {
    const pct = details[i].max > 0 ? details[i].value / details[i].max : 0
    score += pct * (w[i] || 1)
  }
  return Math.round((score / totalWeight) * 100)
}

async function computeDsaScore(userId: string): Promise<SubScore> {
  const submissions = await prisma.codingSubmission.findMany({
    where: { userId },
    include: { problem: { select: { difficulty: true, topic: true } } },
    orderBy: { submittedAt: 'desc' },
  })

  const uniqueProblems = new Map<string, { difficulty: string; topic: string; passed: boolean }>()
  for (const s of submissions) {
    if (!uniqueProblems.has(s.problemId)) {
      uniqueProblems.set(s.problemId, {
        difficulty: s.problem.difficulty,
        topic: s.problem.topic,
        passed: s.passedCases === s.totalCases && s.totalCases > 0,
      })
    }
  }

  const problems = Array.from(uniqueProblems.values())
  const totalSolved = problems.length
  const easySolved = problems.filter(p => p.difficulty === 'EASY').length
  const mediumSolved = problems.filter(p => p.difficulty === 'MEDIUM').length
  const hardSolved = problems.filter(p => p.difficulty === 'HARD').length

  const difficultyScore = (easySolved * DIFFICULTY_WEIGHTS.EASY +
    mediumSolved * DIFFICULTY_WEIGHTS.MEDIUM +
    hardSolved * DIFFICULTY_WEIGHTS.HARD)

  const totalAttempts = submissions.length
  const passedAttempts = submissions.filter(s => s.passedCases === s.totalCases && s.totalCases > 0).length
  const accuracy = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0

  const passedUnique = problems.filter(p => p.passed).length
  const passRate = totalSolved > 0 ? Math.round((passedUnique / totalSolved) * 100) : 0

  const topicData = new Map<string, { attempted: number; passed: number }>()
  for (const p of problems) {
    if (!topicData.has(p.topic)) topicData.set(p.topic, { attempted: 0, passed: 0 })
    const t = topicData.get(p.topic)!
    t.attempted++
    if (p.passed) t.passed++
  }
  const topicCoverage = topicData.size
  const topicScore = topicCoverage > 0 ? Math.min(100, topicCoverage * 12) : 0

  const solvedScore = Math.min(100, totalSolved * 2.5)
  const details = [
    { label: 'Problems Solved', value: totalSolved, max: 40 },
    { label: 'Problem-Solving Accuracy', value: passRate, max: 100 },
    { label: 'Difficulty Weighted Score', value: difficultyScore, max: 80 },
    { label: 'Submission Accuracy', value: accuracy, max: 100 },
    { label: 'Topic Coverage', value: topicCoverage, max: 8 },
  ]

  const score = Math.round(
    clamp(solvedScore * 0.2 + passRate * 0.25 + Math.min(100, difficultyScore) * 0.25 + accuracy * 0.15 + topicScore * 0.15, 0, 100)
  )

  return { score, details }
}

async function computeResumeScore(userId: string): Promise<SubScore> {
  const resume = await prisma.resume.findFirst({
    where: { userId },
    orderBy: { uploadedAt: 'desc' },
  })

  if (!resume) {
    return { score: 0, details: [] }
  }

  const atsScore = resume.atsScore ?? 0
  const actionVerbScore = resume.actionVerbScore ?? 0
  const keywordCoverage = resume.keywordsMissing.length > 0
    ? Math.max(0, 100 - resume.keywordsMissing.length * 8)
    : 100

  const sectionScores = (resume.sectionScores as any) || {}
  const projectQuality = sectionScores.projects ?? 0

  const score = Math.round(
    clamp(atsScore * 0.35 + actionVerbScore * 0.25 + keywordCoverage * 0.25 + projectQuality * 0.15, 0, 100)
  )

  return {
    score,
    details: [
      { label: 'ATS Score', value: Math.round(atsScore), max: 100 },
      { label: 'Action Verb Usage', value: Math.round(actionVerbScore), max: 100 },
      { label: 'Keyword Coverage', value: Math.round(keywordCoverage), max: 100 },
      { label: 'Project Quality', value: Math.round(projectQuality), max: 100 },
    ],
  }
}

async function computeInterviewScore(userId: string): Promise<SubScore> {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  if (sessions.length === 0) {
    return { score: 0, details: [] }
  }

  const scoredSessions = sessions.filter(s => s.overallScore !== null)
  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((a, s) => a + (s.overallScore || 0), 0) / scoredSessions.length)
    : 0

  const avgWpm = sessions.filter(s => s.wpm !== null).length > 0
    ? Math.round(sessions.filter(s => s.wpm !== null).reduce((a, s) => a + (s.wpm || 0), 0) / sessions.filter(s => s.wpm !== null).length)
    : 0

  const fillerScore = sessions.length > 0
    ? clamp(100 - Math.round(sessions.reduce((a, s) => a + s.fillerCount, 0) / sessions.length * 5), 0, 100)
    : 0

  const totalSessions = sessions.length
  const sessionScore = Math.min(100, totalSessions * 12)

  const score = Math.round(
    clamp(avgScore * 0.35 + sessionScore * 0.25 + fillerScore * 0.20 + (avgWpm > 0 ? Math.min(100, Math.round(avgWpm / 1.5)) : 0) * 0.20, 0, 100)
  )

  return {
    score,
    details: [
      { label: 'Average Interview Score', value: avgScore, max: 100 },
      { label: 'Sessions Completed', value: totalSessions, max: 8 },
      { label: 'Filler Word Control', value: fillerScore, max: 100 },
      { label: 'Speaking Pace (WPM)', value: avgWpm, max: 150 },
    ],
  }
}

async function computeAptitudeScore(userId: string): Promise<SubScore> {
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { userId, status: 'SUBMITTED' },
  })

  if (attempts.length === 0) {
    return { score: 0, details: [] }
  }

  const avgAccuracy = Math.round(attempts.reduce((a, s) => a + (s.accuracy || 0), 0) / attempts.length)
  const avgTimeTaken = Math.round(attempts.filter(a => a.timeTaken).reduce((a, s) => a + (s.timeTaken || 0), 0) / attempts.length)
  const speedScore = avgTimeTaken > 0
    ? clamp(100 - Math.round(avgTimeTaken / 60), 0, 100)
    : 0

  const score = Math.round(
    clamp(avgAccuracy * 0.60 + speedScore * 0.25 + Math.min(100, attempts.length * 15) * 0.15, 0, 100)
  )

  return {
    score,
    details: [
      { label: 'Assessment Accuracy', value: avgAccuracy, max: 100 },
      { label: 'Speed Score', value: speedScore, max: 100 },
      { label: 'Assessments Taken', value: attempts.length, max: 6 },
    ],
  }
}

async function computeProjectScore(userId: string): Promise<SubScore> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  const hasResume = await prisma.resume.findFirst({
    where: { userId },
  })

  const resumeProjectScore = hasResume?.sectionScores
    ? ((hasResume.sectionScores as any).projects ?? 0)
    : 0

  const hasGithub = user?.profile?.githubUsername ? 1 : 0
  const hasLinkedin = user?.profile?.linkedinUrl ? 1 : 0

  const score = Math.round(
    clamp(resumeProjectScore * 0.50 + (hasGithub * 25) + (hasLinkedin * 15) + (hasResume ? 10 : 0), 0, 100)
  )

  return {
    score,
    details: [
      { label: 'Project Quality', value: Math.round(resumeProjectScore), max: 100 },
      { label: 'GitHub Linked', value: hasGithub ? 100 : 0, max: 100 },
      { label: 'LinkedIn Linked', value: hasLinkedin ? 100 : 0, max: 100 },
    ],
  }
}

async function computeCommunicationScore(userId: string): Promise<SubScore> {
  const sessions = await prisma.interviewSession.findMany({
    where: { userId },
  })

  const avgComm = sessions.filter(s => s.overallScore !== null).length > 0
    ? Math.round(sessions.filter(s => s.overallScore !== null).reduce((a, s) => a + (s.overallScore || 0), 0) / sessions.filter(s => s.overallScore !== null).length)
    : 0

  const fillerScore = sessions.length > 0
    ? clamp(100 - Math.round(sessions.reduce((a, s) => a + s.fillerCount, 0) / sessions.length * 5), 0, 100)
    : 0

  const totalSessions = sessions.length
  const sessionScore = Math.min(100, totalSessions * 15)

  const score = Math.round(
    clamp(avgComm * 0.40 + fillerScore * 0.30 + sessionScore * 0.30, 0, 100)
  )

  return {
    score,
    details: [
      { label: 'Communication in Interviews', value: avgComm, max: 100 },
      { label: 'Clarity & Fluency', value: fillerScore, max: 100 },
      { label: 'Speaking Practice', value: sessionScore, max: 100 },
    ],
  }
}

async function computeConsistencyScore(userId: string): Promise<SubScore> {
  const activities = await prisma.userActivity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (activities.length === 0) {
    return { score: 0, details: [] }
  }

  const dates = [...new Set(activities.map(a => a.createdAt.toISOString().split('T')[0]))].sort().reverse()
  let currentStreak = 1
  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      tempStreak++
    } else {
      if (i === 1) currentStreak = tempStreak
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  const today = new Date().toISOString().split('T')[0]
  const latestDate = dates[0]
  const diffFromToday = Math.round(
    (new Date(today).getTime() - new Date(latestDate).getTime()) / (1000 * 60 * 60 * 24)
  )
  if (diffFromToday > 1) currentStreak = 0

  const totalDaysActive = dates.length
  const firstDate = dates[dates.length - 1]
  const daysSinceStart = Math.max(1, Math.round(
    (new Date(today).getTime() - new Date(firstDate).getTime()) / (1000 * 60 * 60 * 24)
  ))
  const consistencyPct = Math.round((totalDaysActive / daysSinceStart) * 100)

  const streakScore = Math.min(100, longestStreak * 12)
  const score = Math.round(
    clamp(streakScore * 0.40 + consistencyPct * 0.40 + currentStreak * 0.20, 0, 100)
  )

  return {
    score,
    details: [
      { label: 'Longest Streak', value: longestStreak, max: 8 },
      { label: 'Consistency Rate', value: consistencyPct, max: 100 },
      { label: 'Current Streak', value: currentStreak, max: 8 },
    ],
  }
}

async function computeCompanyEligibility(
  readinessScore: number,
  dsaScore: number,
  aptitudeScore: number,
  communicationScore: number,
  allMissingSkills: string[]
): Promise<CompanyEligibility[]> {
  const companies: CompanyEligibility[] = []

  for (const [name, benchmark] of Object.entries(COMPANY_BENCHMARKS)) {
    const readinessOk = readinessScore >= benchmark.minReadiness
    const dsaOk = dsaScore >= benchmark.minDsa
    const aptitudeOk = aptitudeScore >= benchmark.minAptitude
    const commOk = communicationScore >= benchmark.minCommunication

    const metCount = [readinessOk, dsaOk, aptitudeOk, commOk].filter(Boolean).length
    const baseChance = (metCount / 4) * 100

    const missingForCompany = benchmark.requiredSkills.filter(
      skill => allMissingSkills.some(m => m.toLowerCase().includes(skill.toLowerCase()))
    )
    const penalty = missingForCompany.length * 8

    const chancePercent = Math.round(clamp(baseChance - penalty, 0, 98))

    companies.push({
      companyName: name,
      chancePercent,
      category: benchmark.category,
      missingSkills: missingForCompany,
      avgPackage: benchmark.avgPackage,
    })
  }

  return companies.sort((a, b) => b.chancePercent - a.chancePercent)
}

async function computePredictedPackage(readinessScore: number): Promise<{ min: number; max: number; currency: string }> {
  if (readinessScore >= 80) return { min: 20, max: 55, currency: '₹' }
  if (readinessScore >= 70) return { min: 12, max: 28, currency: '₹' }
  if (readinessScore >= 60) return { min: 8, max: 18, currency: '₹' }
  if (readinessScore >= 50) return { min: 5, max: 10, currency: '₹' }
  if (readinessScore >= 40) return { min: 3.5, max: 7, currency: '₹' }
  return { min: 2.5, max: 5, currency: '₹' }
}

function computeReadinessLevel(score: number): { level: string; score: number } {
  if (score >= 80) return { level: 'Highly Prepared', score }
  if (score >= 65) return { level: 'Well Prepared', score }
  if (score >= 50) return { level: 'Moderately Prepared', score }
  if (score >= 35) return { level: 'Needs Improvement', score }
  return { level: 'Early Stage', score }
}

function generateStrengths(scores: { dsa: number; resume: number; interview: number; aptitude: number; projects: number; communication: number; consistency: number }): string[] {
  const strengths: string[] = []
  if (scores.dsa >= 65) strengths.push('Strong Data Structures & Algorithms foundation')
  if (scores.resume >= 65) strengths.push('Well-crafted resume with good ATS optimization')
  if (scores.interview >= 65) strengths.push('Good interview performance and communication')
  if (scores.aptitude >= 65) strengths.push('Strong aptitude and problem-solving speed')
  if (scores.projects >= 65) strengths.push('Quality project portfolio with practical experience')
  if (scores.communication >= 65) strengths.push('Excellent communication and articulation skills')
  if (scores.consistency >= 65) strengths.push('Consistent practice and dedicated learning approach')
  return strengths
}

function generateWeaknesses(scores: { dsa: number; resume: number; interview: number; aptitude: number; projects: number; communication: number; consistency: number }): string[] {
  const weaknesses: string[] = []
  if (scores.dsa < 50) weaknesses.push('DSA skills need significant improvement')
  else if (scores.dsa < 65) weaknesses.push('DSA problem-solving needs more practice, especially Medium/Hard problems')
  if (scores.resume < 50) weaknesses.push('Resume needs major overhaul for ATS optimization')
  else if (scores.resume < 65) weaknesses.push('Resume could be stronger with more quantified achievements')
  if (scores.interview < 50) weaknesses.push('Limited interview practice — attend more mock interviews')
  else if (scores.interview < 65) weaknesses.push('Interview performance needs refinement')
  if (scores.aptitude < 50) weaknesses.push('Aptitude skills need significant practice')
  else if (scores.aptitude < 65) weaknesses.push('Aptitude speed and accuracy need improvement')
  if (scores.projects < 50) weaknesses.push('No significant projects — build at least 2 industry-grade projects')
  else if (scores.projects < 65) weaknesses.push('Projects could be more impactful with better tech stack')
  if (scores.communication < 50) weaknesses.push('Communication skills need considerable improvement')
  else if (scores.communication < 65) weaknesses.push('Communication could be more structured and confident')
  if (scores.consistency < 50) weaknesses.push('Inconsistent practice — establish a regular study routine')
  else if (scores.consistency < 65) weaknesses.push('Slight inconsistency in practice schedule')
  return weaknesses
}

function generateMissingSkills(gapAnalysis: { missingSkills: string[] } | null, scores: { dsa: number; resume: number; interview: number; aptitude: number; projects: number; communication: number; consistency: number }): string[] {
  const missing = new Set<string>()
  if (gapAnalysis?.missingSkills) gapAnalysis.missingSkills.forEach(s => missing.add(s))
  if (scores.dsa < 50) missing.add('Advanced DSA')
  if (scores.projects < 50) missing.add('Industry Projects')
  if (scores.resume < 50) missing.add('Resume Optimization')
  if (scores.interview < 50) missing.add('Mock Interview Practice')
  if (scores.aptitude < 50) missing.add('Aptitude Practice')
  if (scores.communication < 50) missing.add('Communication Skills')
  return Array.from(missing).slice(0, 8)
}

function generateRecommendations(
  scores: { dsa: number; resume: number; interview: number; aptitude: number; projects: number; communication: number; consistency: number },
  weaknesses: string[]
): Recommendation[] {
  const recs: Recommendation[] = []

  if (scores.dsa < 70) {
    recs.push({
      id: 'rec-1',
      title: 'Strengthen DSA Fundamentals',
      description: scores.dsa < 50
        ? 'Start with array, string, and linked list problems. Solve 2-3 Easy problems daily before moving to Medium.'
        : 'Focus on Medium/Hard problems in trees, graphs, and DP. Target 3-4 problems daily.',
      impact: `Expected: +${Math.round((70 - scores.dsa) * 0.4)}% to readiness`,
      category: 'DSA',
      priority: scores.dsa < 50 ? 'high' : 'medium',
    })
  }

  if (scores.resume < 70) {
    recs.push({
      id: 'rec-2',
      title: 'Optimize Your Resume',
      description: scores.resume < 50
        ? 'Redesign resume with ATS-friendly format. Add quantifiable metrics and industry keywords.'
        : 'Improve ATS score by adding more keywords. Quantify achievements with metrics.',
      impact: `Expected: +${Math.round((70 - scores.resume) * 0.3)}% to readiness`,
      category: 'Resume',
      priority: scores.resume < 50 ? 'high' : 'medium',
    })
  }

  if (scores.interview < 65) {
    recs.push({
      id: 'rec-3',
      title: 'Practice Mock Interviews',
      description: 'Complete at least 5 mock interviews focusing on technical and HR rounds. Review recordings to identify improvement areas.',
      impact: `Expected: +${Math.round((65 - scores.interview) * 0.5)}% to readiness`,
      category: 'Interview',
      priority: scores.interview < 50 ? 'high' : 'medium',
    })
  }

  if (scores.aptitude < 70) {
    recs.push({
      id: 'rec-4',
      title: 'Practice Aptitude & Logical Reasoning',
      description: 'Dedicate 30 minutes daily to quantitative aptitude, logical reasoning, and data interpretation.',
      impact: `Expected: +${Math.round((70 - scores.aptitude) * 0.25)}% to readiness`,
      category: 'Aptitude',
      priority: scores.aptitude < 50 ? 'high' : 'low',
    })
  }

  if (scores.projects < 60) {
    recs.push({
      id: 'rec-5',
      title: 'Build Industry-Level Projects',
      description: 'Create 1-2 full-stack projects with proper documentation, deployment, and GitHub README. Use modern tech stack.',
      impact: `Expected: +${Math.round((60 - scores.projects) * 0.35)}% to readiness`,
      category: 'Projects',
      priority: 'medium',
    })
  }

  if (scores.communication < 70) {
    recs.push({
      id: 'rec-6',
      title: 'Improve Communication Skills',
      description: 'Practice structuring answers using the STAR method. Reduce filler words and improve speaking confidence.',
      impact: `Expected: +${Math.round((70 - scores.communication) * 0.3)}% to readiness`,
      category: 'Communication',
      priority: scores.communication < 50 ? 'high' : 'medium',
    })
  }

  if (scores.consistency < 60) {
    recs.push({
      id: 'rec-7',
      title: 'Build a Consistent Practice Routine',
      description: 'Set a daily goal of solving at least 1 problem and practicing one skill. Use the roadmap feature to stay on track.',
      impact: `Expected: +${Math.round((60 - scores.consistency) * 0.4)}% to readiness`,
      category: 'Consistency',
      priority: scores.consistency < 40 ? 'high' : 'medium',
    })
  }

  recs.push({
    id: 'rec-8',
    title: 'Prepare System Design Concepts',
    description: 'Learn scalability, distributed systems, and design patterns. Practice designing systems like URL shortener, chat app, etc.',
    impact: 'Expected: +8% to readiness',
    category: 'System Design',
    priority: 'low',
  })

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

function generateRoadmap(scores: { dsa: number; resume: number; interview: number; aptitude: number; projects: number; communication: number; consistency: number }): RoadmapItem[] {
  const roadmap: RoadmapItem[] = []

  const foundation: string[] = []
  if (scores.dsa < 40) foundation.push('Complete Arrays, Strings, Linked Lists fundamentals')
  if (scores.aptitude < 40) foundation.push('Practice quantitative aptitude and logical reasoning basics')
  if (scores.communication < 40) foundation.push('Work on basic communication and grammar skills')
  if (foundation.length > 0) {
    roadmap.push({
      phase: 'Foundation',
      title: 'Build Core Fundamentals',
      tasks: foundation,
      duration: '2-3 weeks',
    })
  }

  const intermediate: string[] = []
  if (scores.dsa >= 40 && scores.dsa < 70) intermediate.push('Master Trees, Graphs, Dynamic Programming')
  if (scores.resume < 60) intermediate.push('Create ATS-optimized resume with quantified achievements')
  if (scores.projects < 50) intermediate.push('Build at least 1 full-stack project with documentation')
  if (scores.interview < 50) intermediate.push('Start mock interview practice (aim for 3+ sessions)')
  if (intermediate.length > 0) {
    roadmap.push({
      phase: 'Intermediate',
      title: 'Strengthen Core Areas',
      tasks: intermediate,
      duration: '3-4 weeks',
    })
  }

  const advanced: string[] = []
  if (scores.dsa >= 60) advanced.push('Solve Advanced DSA: Tries, Segment Trees, Advanced DP')
  advanced.push('Practice system design for product companies')
  if (scores.interview < 65) advanced.push('Complete 5+ mock interviews with feedback analysis')
  if (scores.projects >= 50 && scores.projects < 70) advanced.push('Enhance projects with deployment and CI/CD')
  if (advanced.length > 0) {
    roadmap.push({
      phase: 'Advanced',
      title: 'Master Interview Skills',
      tasks: advanced,
      duration: '3-4 weeks',
    })
  }

  roadmap.push({
    phase: 'Final',
    title: 'Placement Readiness',
    tasks: [
      'Give full-length mock placement tests',
      'Practice company-specific previous year papers',
      'Revise weak areas identified in assessments',
      'Prepare introduction and closing statements for HR round',
    ],
    duration: '1-2 weeks',
  })

  return roadmap
}

export async function getPlacementTwin(userId: string): Promise<PlacementTwinResponse> {
  const [
    dsa, resume, interview, aptitude, projects, communication, consistency,
  ] = await Promise.all([
    computeDsaScore(userId),
    computeResumeScore(userId),
    computeInterviewScore(userId),
    computeAptitudeScore(userId),
    computeProjectScore(userId),
    computeCommunicationScore(userId),
    computeConsistencyScore(userId),
  ])

  const scores = {
    dsa: dsa.score,
    resume: resume.score,
    interview: interview.score,
    aptitude: aptitude.score,
    projects: projects.score,
    communication: communication.score,
    consistency: consistency.score,
  }

  const readinessScore = Math.round(
    clamp(
      scores.dsa * WEIGHTS.dsa +
      scores.resume * WEIGHTS.resume +
      scores.interview * WEIGHTS.interview +
      scores.aptitude * WEIGHTS.aptitude +
      scores.projects * WEIGHTS.projects +
      scores.communication * WEIGHTS.communication +
      scores.consistency * WEIGHTS.consistency,
      0, 100
    )
  )

  const latestGapAnalysis = await prisma.gapAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  const allMissingSkills = generateMissingSkills(latestGapAnalysis, scores)
  const companyEligibility = await computeCompanyEligibility(
    readinessScore, scores.dsa, scores.aptitude, scores.communication, allMissingSkills
  )

  const predictedPackage = await computePredictedPackage(readinessScore)
  const interviewReadiness = computeReadinessLevel(readinessScore)
  const strengths = generateStrengths(scores)
  const weaknesses = generateWeaknesses(scores)
  const recommendations = generateRecommendations(scores, weaknesses)
  const improvementRoadmap = generateRoadmap(scores)

  return {
    readinessScore,
    subScores: {
      dsa,
      resume,
      interview,
      aptitude,
      projects,
      communication,
      consistency,
    },
    companyEligibility,
    predictedPackage,
    interviewReadiness,
    strengths,
    weaknesses,
    missingSkills: allMissingSkills,
    recommendations,
    improvementRoadmap,
    lastUpdated: new Date().toISOString(),
  }
}
