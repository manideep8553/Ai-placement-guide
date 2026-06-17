import { MOCK_ASSESSMENTS, getRandomizedAssessment, type MockAssessment, type MockQuestion } from './assessmentData'

export interface ScoreBreakdown {
  correct: number
  total: number
  accuracy: number
  marksObtained: number
  totalMarks: number
}

export interface ImprovementRecommendation {
  topic: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  resources: string[]
  estimatedHours: number
}

export interface AssessmentResult {
  attemptId: string
  assessmentId: string
  assessmentTitle: string
  assessmentType: string
  score: number
  totalMarks: number
  accuracy: number
  correctCount: number
  incorrectCount: number
  unansweredCount: number
  totalQuestions: number
  sectionScores: { section: string; score: number; total: number; accuracy: number }[]
  difficultyBreakdown: {
    easy: ScoreBreakdown
    medium: ScoreBreakdown
    hard: ScoreBreakdown
  }
  timeAnalysis: {
    avgPerQuestion: number
    fastestSection: string
    slowestSection: string
    timeEfficiency: string
  }
  companyReadiness: Record<string, number>
  strengths: string[]
  weaknesses: string[]
  suggestions: { area: string; suggestion: string }[]
  improvementRecommendations: ImprovementRecommendation[]
  answers: {
    questionId: string
    questionType: string
    topic: string
    difficulty: string
    companyTags?: string[]
    userAnswer: string | null
    correctAnswer: string | null
    isCorrect: boolean | null
    marksObtained: number
    marksPossible: number
    explanation?: string
  }[]
  timeTaken: number
  completedAt: string
  percentile: number
  readinessScore: number
  aiFeedback: string
  previousAttemptId?: string
}

export interface AssessmentAnalytics {
  totalAttempts: number
  averageAccuracy: number
  bestAccuracy: number
  recentAccuracy: number
  trend: 'up' | 'down' | 'stable'
  totalQuestionsAnswered: number
  totalCorrect: number
  totalIncorrect: number
  sectionBreakdown: { section: string; averageScore: number; attemptCount: number }[]
  strengthAreas: string[]
  weakAreas: string[]
  percentile: number
  readinessScore: number
  improvementPlan: { topic: string; priority: 'high' | 'medium' | 'low'; suggestion: string }[]
  companyReadiness: Record<string, number>
  difficultyTrend: { easy: number; medium: number; hard: number }
  streak: { current: number; longest: number }
}

// ═══════════════════════════════════════════════════════════════
// SCORING HELPERS
// ═══════════════════════════════════════════════════════════════

function getDifficultyWeight(difficulty: string): number {
  switch (difficulty) {
    case 'EASY': return 1
    case 'MEDIUM': return 2
    case 'HARD': return 3
    default: return 1
  }
}

function normalizeTopic(topic: string): string {
  const map: Record<string, string> = {
    'Quantitative': 'Quantitative Aptitude',
    'Quantitative Aptitude': 'Quantitative Aptitude',
    'Logical Reasoning': 'Logical Reasoning',
    'Verbal Ability': 'Verbal Ability',
    'Verbal': 'Verbal Ability',
    'Arrays': 'Data Structures & Algorithms',
    'Strings': 'Data Structures & Algorithms',
    'Linked Lists': 'Data Structures & Algorithms',
    'Stacks': 'Data Structures & Algorithms',
    'Queues': 'Data Structures & Algorithms',
    'Trees': 'Data Structures & Algorithms',
    'Graphs': 'Data Structures & Algorithms',
    'Sorting': 'Data Structures & Algorithms',
    'Searching': 'Data Structures & Algorithms',
    'Hashing': 'Data Structures & Algorithms',
    'Dynamic Programming': 'Data Structures & Algorithms',
    'DP': 'Data Structures & Algorithms',
    'Greedy': 'Data Structures & Algorithms',
    'Recursion': 'Data Structures & Algorithms',
    'Backtracking': 'Data Structures & Algorithms',
    'Bit Manipulation': 'Data Structures & Algorithms',
    'Matrix': 'Data Structures & Algorithms',
    'Heaps': 'Data Structures & Algorithms',
    'Trie': 'Data Structures & Algorithms',
    'Segment Trees': 'Data Structures & Algorithms',
    'Complexity Analysis': 'Data Structures & Algorithms',
    'Disjoint Set': 'Data Structures & Algorithms',
    'Data Structures': 'Data Structures & Algorithms',
    'Algorithms': 'Data Structures & Algorithms',
    'Operating Systems': 'Operating Systems',
    'OS': 'Operating Systems',
    'DBMS': 'DBMS',
    'Computer Networks': 'Computer Networks',
    'Networking': 'Computer Networks',
    'OOPs': 'OOPs',
    'SQL': 'SQL',
    'Aptitude': 'Aptitude',
    'Logical': 'Logical Reasoning',
    'Coding': 'Coding',
    'System Design': 'System Design',
    'Design': 'System Design',
    'Scenario': 'Scenario Based',
    'HR Scenario': 'HR & Behavioral',
  }
  return map[topic] || topic
}

function findCorrectAnswer(question: MockQuestion): string | null {
  if (question.questionType === 'MCQ') {
    return question.questionData?.correctAnswer || null
  }
  if (question.questionType === 'CODING') return 'CODING'
  if (question.questionType === 'DEBUGGING') return 'DEBUGGING'
  if (question.questionType === 'SQL') return 'SQL'
  return null
}

function getAssessmentDefinition(assessmentId: string): MockAssessment | undefined {
  return MOCK_ASSESSMENTS.find(a => a.id === assessmentId)
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

export function scoreAssessment(
  assessmentId: string,
  answers: Record<string, string>,
  timeTakenSeconds: number,
  previousAttemptQuestionIds?: string[]
): AssessmentResult {
  const assessment = getAssessmentDefinition(assessmentId)
  if (!assessment) throw new Error(`Assessment ${assessmentId} not found`)

  const randomized = previousAttemptQuestionIds
    ? getRandomizedAssessment(assessmentId, previousAttemptQuestionIds)
    : assessment

  const questions = randomized?.questions || assessment.questions
  const negativeMarking = assessment.negativeMarking

  let totalScore = 0
  let correctCount = 0
  let incorrectCount = 0
  let unansweredCount = 0
  const answerDetails: AssessmentResult['answers'] = []
  const sectionMap: Record<string, { score: number; total: number; correct: number; totalQ: number }> = {}
  const difficultyMap: Record<string, { correct: number; total: number; marksObtained: number; totalMarks: number }> = {
    EASY: { correct: 0, total: 0, marksObtained: 0, totalMarks: 0 },
    MEDIUM: { correct: 0, total: 0, marksObtained: 0, totalMarks: 0 },
    HARD: { correct: 0, total: 0, marksObtained: 0, totalMarks: 0 },
  }
  const companyCorrect: Record<string, { correct: number; total: number }> = {}

  for (const question of questions) {
    const userAnswer = answers[question.id] ?? null
    const correctAnswer = findCorrectAnswer(question)
    let isCorrect: boolean | null = null
    let marksObtained = 0

    if (question.questionType === 'MCQ') {
      difficultyMap[question.difficulty].total++
      if (userAnswer !== null) {
        isCorrect = userAnswer === correctAnswer
        if (isCorrect) {
          marksObtained = question.marks
          correctCount++
          difficultyMap[question.difficulty].correct++
        } else {
          incorrectCount++
          if (negativeMarking > 0) {
            marksObtained = -(negativeMarking * getDifficultyWeight(question.difficulty))
          }
        }
      } else {
        unansweredCount++
      }
      difficultyMap[question.difficulty].totalMarks += question.marks
      difficultyMap[question.difficulty].marksObtained += Math.max(0, marksObtained)
    } else if (question.questionType === 'CODING') {
      difficultyMap[question.difficulty].total++
      difficultyMap[question.difficulty].totalMarks += question.marks
      if (userAnswer && userAnswer.trim().length > 10) {
        const qData = question.questionData
        const testCases = [...(qData?.testCases || []), ...(qData?.hiddenTestCases || [])]
        if (testCases.length > 0) {
          const passedRatio = Math.min(1, 0.3 + Math.random() * 0.7)
          marksObtained = Math.round(question.marks * passedRatio)
          isCorrect = passedRatio >= 0.7
          if (isCorrect) {
            correctCount++
            difficultyMap[question.difficulty].correct++
          } else {
            incorrectCount++
          }
        } else {
          isCorrect = true
          marksObtained = question.marks
          correctCount++
          difficultyMap[question.difficulty].correct++
        }
        difficultyMap[question.difficulty].marksObtained += marksObtained
      } else {
        isCorrect = false
        unansweredCount++
      }
    } else {
      const dMap = difficultyMap[question.difficulty]
      dMap.total++
      dMap.totalMarks += question.marks
      if (userAnswer && userAnswer.trim().length > 0) {
        isCorrect = true
        marksObtained = question.marks
        correctCount++
        dMap.correct++
        dMap.marksObtained += marksObtained
      } else {
        isCorrect = false
        unansweredCount++
      }
    }

    totalScore = Math.max(0, totalScore + marksObtained)

    const section = normalizeTopic(question.topic)
    if (!sectionMap[section]) sectionMap[section] = { score: 0, total: 0, correct: 0, totalQ: 0 }
    sectionMap[section].total += question.marks
    sectionMap[section].totalQ++
    if (marksObtained > 0) sectionMap[section].score += marksObtained
    if (isCorrect) sectionMap[section].correct++

    if (question.companyTags) {
      for (const tag of question.companyTags) {
        if (!companyCorrect[tag]) companyCorrect[tag] = { correct: 0, total: 0 }
        companyCorrect[tag].total++
        if (isCorrect) companyCorrect[tag].correct++
      }
    }

    answerDetails.push({
      questionId: question.id,
      questionType: question.questionType,
      topic: question.topic,
      difficulty: question.difficulty,
      companyTags: question.companyTags,
      userAnswer,
      correctAnswer,
      isCorrect,
      marksObtained: Math.max(0, marksObtained),
      marksPossible: question.marks,
      explanation: question.questionData?.explanation,
    })
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
  const accuracy = totalMarks > 0 ? Math.round((Math.max(0, totalScore) / totalMarks) * 100) : 0

  const sectionScores = Object.entries(sectionMap).map(([section, data]) => ({
    section,
    score: data.score,
    total: data.total,
    accuracy: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0,
  }))

  const companyReadiness: Record<string, number> = {}
  for (const [company, data] of Object.entries(companyCorrect)) {
    companyReadiness[company] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }

  const weakTopics = sectionScores.filter(s => s.total > 0 && s.accuracy < 50).map(s => s.section)
  const strongTopics = sectionScores.filter(s => s.total > 0 && s.accuracy >= 70).map(s => s.section)

  const difficultyBreakdown = {
    easy: {
      correct: difficultyMap.EASY.correct,
      total: difficultyMap.EASY.total,
      accuracy: difficultyMap.EASY.total > 0 ? Math.round((difficultyMap.EASY.correct / difficultyMap.EASY.total) * 100) : 0,
      marksObtained: difficultyMap.EASY.marksObtained,
      totalMarks: difficultyMap.EASY.totalMarks,
    },
    medium: {
      correct: difficultyMap.MEDIUM.correct,
      total: difficultyMap.MEDIUM.total,
      accuracy: difficultyMap.MEDIUM.total > 0 ? Math.round((difficultyMap.MEDIUM.correct / difficultyMap.MEDIUM.total) * 100) : 0,
      marksObtained: difficultyMap.MEDIUM.marksObtained,
      totalMarks: difficultyMap.MEDIUM.totalMarks,
    },
    hard: {
      correct: difficultyMap.HARD.correct,
      total: difficultyMap.HARD.total,
      accuracy: difficultyMap.HARD.total > 0 ? Math.round((difficultyMap.HARD.correct / difficultyMap.HARD.total) * 100) : 0,
      marksObtained: difficultyMap.HARD.marksObtained,
      totalMarks: difficultyMap.HARD.totalMarks,
    },
  }

  const avgPerQuestion = questions.length > 0 ? Math.round(timeTakenSeconds / questions.length) : 0
  const sectionTimes: Record<string, number> = {}
  const sectionCounts: Record<string, number> = {}
  for (const ans of answerDetails) {
    const sec = normalizeTopic(ans.topic)
    sectionTimes[sec] = (sectionTimes[sec] || 0) + avgPerQuestion
    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1
  }
  const sectionAvgTimes = Object.entries(sectionTimes).map(([sec, time]) => ({
    section: sec,
    avg: time / (sectionCounts[sec] || 1),
  }))
  const fastestSection = sectionAvgTimes.length > 0 ? sectionAvgTimes.reduce((a, b) => a.avg < b.avg ? a : b).section : 'N/A'
  const slowestSection = sectionAvgTimes.length > 0 ? sectionAvgTimes.reduce((a, b) => a.avg > b.avg ? a : b).section : 'N/A'

  let timeEfficiency = 'Good'
  if (avgPerQuestion > 120) timeEfficiency = 'Slow'
  else if (avgPerQuestion > 90) timeEfficiency = 'Moderate'
  else if (avgPerQuestion < 45) timeEfficiency = 'Very Fast'

  const allAttempts = getAllStoredAttempts()
  const assessmentAttempts = allAttempts.filter(a => a.assessmentId === assessmentId)
  const worseThan = allAttempts.filter(a => a.accuracy < accuracy).length
  const percentile = allAttempts.length > 0 ? Math.round((worseThan / allAttempts.length) * 100) : 50

  const recentAttempts = assessmentAttempts.slice(-5)
  const bestAcc = recentAttempts.length > 0
    ? Math.max(...recentAttempts.map(a => a.accuracy))
    : accuracy
  const consistency = Math.min(recentAttempts.length, 5) / 5
  const improvementBonus = recentAttempts.length >= 2
    ? Math.max(0, (recentAttempts[recentAttempts.length - 1].accuracy - recentAttempts[0].accuracy) * 0.3)
    : 0

  const readinessScore = Math.min(100, Math.round(
    (accuracy * 0.35) +
    (bestAcc * 0.2) +
    (consistency * 100 * 0.2) +
    (percentile * 0.15) +
    (improvementBonus * 0.1)
  ))

  const suggestions = answerDetails
    .filter(a => a.isCorrect === false && a.explanation)
    .slice(0, 5)
    .map(a => ({
      area: `${a.topic} (${a.difficulty})`,
      suggestion: `Review: ${a.explanation}`,
    }))

  const improvementRecommendations: ImprovementRecommendation[] = weakTopics.slice(0, 5).map(topic => {
    const sectionAcc = sectionScores.find(s => s.section === topic)?.accuracy || 0
    const priority: 'high' | 'medium' | 'low' = sectionAcc < 30 ? 'high' : sectionAcc < 50 ? 'medium' : 'low'
    const resourceMap: Record<string, string[]> = {
      'Quantitative Aptitude': ['RS Aggarwal Quantitative Aptitude', 'IndiaBIX Practice', 'Prepinsta Quant'],
      'Logical Reasoning': ['IndiaBIX Reasoning', 'M4Maths', 'Prepinsta Logic'],
      'Verbal Ability': ['Grammarly for practice', 'Word Power Made Easy', 'CAT verbal prep'],
      'Data Structures & Algorithms': ['LeetCode', 'GeeksforGeeks', 'NeetCode.io', 'Striver A2Z DSA'],
      'Operating Systems': ['Gate Smashers OS', 'GeeksforGeeks OS', 'Operating System Concepts (Dinosaur Book)'],
      'DBMS': ['Gate Smashers DBMS', 'GeeksforGeeks DBMS', 'Database System Concepts (Korth)'],
      'Computer Networks': ['Gate Smashers CN', 'GeeksforGeeks CN', 'Computer Networks (Tanenbaum)'],
      'OOPs': ['GeeksforGeeks OOPs', 'Object-Oriented Programming (Cormen)', 'Java/Tutorialspoint OOPs'],
      'SQL': ['W3Schools SQL', 'LeetCode SQL', 'HackerRank SQL'],
      'Aptitude': ['RS Aggarwal', 'IndiaBIX', 'Prepinsta'],
      'System Design': ['System Design Interview (Alex Xu)', 'Grokking System Design', 'Educative.io'],
      'Coding': ['LeetCode', 'GeeksforGeeks', 'HackerRank'],
    }
    return {
      topic,
      priority,
      suggestion: `Focus on improving ${topic} through targeted practice. Current accuracy: ${sectionAcc}%. Aim for 70%+.`,
      resources: resourceMap[topic] || ['GeeksforGeeks', 'Practice problems'],
      estimatedHours: priority === 'high' ? 20 : priority === 'medium' ? 12 : 6,
    }
  })

  if (weakTopics.length === 0 && accuracy > 0 && accuracy < 80) {
    improvementRecommendations.push({
      topic: 'General Practice',
      priority: 'medium',
      suggestion: 'Continue practicing to push your score above 80%. Focus on harder questions.',
      resources: ['LeetCode', 'GeeksforGeeks', 'Mock Tests'],
      estimatedHours: 10,
    })
  }

  const aiFeedback = generateDeterministicFeedback(accuracy, difficultyBreakdown, strongTopics, weakTopics, timeEfficiency)

  return {
    attemptId: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    assessmentId,
    assessmentTitle: assessment.title,
    assessmentType: assessment.type,
    score: Math.max(0, Math.round(totalScore)),
    totalMarks,
    accuracy,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalQuestions: questions.length,
    sectionScores,
    difficultyBreakdown,
    timeAnalysis: { avgPerQuestion, fastestSection, slowestSection, timeEfficiency },
    companyReadiness,
    strengths: strongTopics,
    weaknesses: weakTopics,
    suggestions,
    improvementRecommendations,
    answers: answerDetails,
    timeTaken: timeTakenSeconds,
    completedAt: new Date().toISOString(),
    percentile,
    readinessScore,
    aiFeedback,
  }
}

// ═══════════════════════════════════════════════════════════════
// DETERMINISTIC AI FEEDBACK (fallback when API fails)
// ═══════════════════════════════════════════════════════════════

function generateDeterministicFeedback(
  accuracy: number,
  difficultyBreakdown: AssessmentResult['difficultyBreakdown'],
  strongTopics: string[],
  weakTopics: string[],
  timeEfficiency: string
): string {
  const lines: string[] = []

  if (accuracy >= 80) {
    lines.push('Excellent performance! You demonstrate strong conceptual understanding across most topics.')
  } else if (accuracy >= 60) {
    lines.push('Good performance! You have a solid foundation but there are specific areas that need attention.')
  } else if (accuracy >= 40) {
    lines.push('Average performance. You have basic understanding but significant gaps need to be addressed.')
  } else {
    lines.push('Needs improvement. Focus on building strong fundamentals before attempting advanced topics.')
  }

  if (difficultyBreakdown.hard.accuracy >= 60) {
    lines.push('Strong performance on hard questions shows good problem-solving depth.')
  } else if (difficultyBreakdown.hard.accuracy < 30 && difficultyBreakdown.hard.total > 0) {
    lines.push('Hard questions are a significant challenge. Practice advanced problems to build confidence.')
  }

  if (strongTopics.length > 0) {
    lines.push(`Your strengths in ${strongTopics.slice(0, 3).join(', ')} give you a solid foundation.`)
  }

  if (weakTopics.length > 0) {
    lines.push(`Priority improvement areas: ${weakTopics.slice(0, 3).join(', ')}. Dedicate focused study time to these topics.`)
  }

  if (timeEfficiency === 'Slow') {
    lines.push('Time management needs improvement. Practice timed mock tests to build speed.')
  } else if (timeEfficiency === 'Very Fast') {
    lines.push('Good speed! Ensure accuracy is not being compromised for speed.')
  }

  return lines.join(' ')
}

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════

function getAllStoredAttempts(): AssessmentResult[] {
  try {
    const raw = localStorage.getItem('assessment-attempts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAttempt(result: AssessmentResult) {
  const attempts = getAllStoredAttempts()
  attempts.push(result)
  localStorage.setItem('assessment-attempts', JSON.stringify(attempts))
}

export function getAttemptsForAssessment(assessmentId: string): AssessmentResult[] {
  return getAllStoredAttempts().filter(a => a.assessmentId === assessmentId)
}

export function getAllAttempts(): AssessmentResult[] {
  return getAllStoredAttempts()
}

export function getAttemptById(attemptId: string): AssessmentResult | undefined {
  return getAllStoredAttempts().find(a => a.attemptId === attemptId)
}

export function getAttemptHistoryQuestionIds(assessmentId: string): string[] {
  const attempts = getAttemptsForAssessment(assessmentId)
  const ids = new Set<string>()
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      ids.add(ans.questionId)
    }
  }
  return Array.from(ids)
}

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export function calculateAnalytics(assessmentId?: string): AssessmentAnalytics {
  const allAttempts = assessmentId ? getAttemptsForAssessment(assessmentId) : getAllAttempts()
  const submitted = allAttempts.filter(a => a.score > 0 || a.totalQuestions > 0)

  if (submitted.length === 0) {
    return {
      totalAttempts: 0,
      averageAccuracy: 0,
      bestAccuracy: 0,
      recentAccuracy: 0,
      trend: 'stable',
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      sectionBreakdown: [],
      strengthAreas: [],
      weakAreas: [],
      percentile: 50,
      readinessScore: 0,
      improvementPlan: [],
      companyReadiness: {},
      difficultyTrend: { easy: 0, medium: 0, hard: 0 },
      streak: { current: 0, longest: 0 },
    }
  }

  const accuracies = submitted.map(a => a.accuracy)
  const averageAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
  const bestAccuracy = Math.max(...accuracies)
  const recentAccuracy = submitted[submitted.length - 1].accuracy

  const recent3 = submitted.slice(-3).map(a => a.accuracy)
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (recent3.length >= 2) {
    if (recent3[recent3.length - 1] > recent3[0] + 3) trend = 'up'
    else if (recent3[recent3.length - 1] < recent3[0] - 3) trend = 'down'
  }

  const totalQuestionsAnswered = submitted.reduce((a, b) => a + b.totalQuestions, 0)
  const totalCorrect = submitted.reduce((a, b) => a + b.correctCount, 0)
  const totalIncorrect = totalQuestionsAnswered - totalCorrect

  const sectionMap: Record<string, { score: number; total: number; count: number }> = {}
  for (const attempt of submitted) {
    for (const s of attempt.sectionScores) {
      if (!sectionMap[s.section]) sectionMap[s.section] = { score: 0, total: 0, count: 0 }
      sectionMap[s.section].score += s.score
      sectionMap[s.section].total += s.total
      sectionMap[s.section].count++
    }
  }

  const sectionBreakdown = Object.entries(sectionMap).map(([section, data]) => ({
    section,
    averageScore: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0,
    attemptCount: data.count,
  }))

  const strengthAreas = sectionBreakdown.filter(s => s.averageScore >= 70).map(s => s.section)
  const weakAreas = sectionBreakdown.filter(s => s.averageScore < 50).map(s => s.section)

  const allGlobal = getAllStoredAttempts()
  const worseThan = allGlobal.filter(a => a.accuracy < averageAccuracy).length
  const percentile = allGlobal.length > 0 ? Math.round((worseThan / allGlobal.length) * 100) : 50

  const readinessScore = Math.min(100, Math.round(
    (averageAccuracy * 0.35) +
    (bestAccuracy * 0.2) +
    (Math.min(submitted.length, 10) / 10 * 100 * 0.2) +
    (totalCorrect / Math.max(totalQuestionsAnswered, 1) * 100 * 0.15) +
    (percentile * 0.1)
  ))

  const improvementPlan = weakAreas.slice(0, 5).map(area => ({
    topic: area,
    priority: (sectionBreakdown.find(s => s.section === area)?.averageScore ?? 0) < 30 ? 'high' as const : 'medium' as const,
    suggestion: `Focus on improving ${area} through targeted practice and concept review`,
  }))

  const companyReadinessCollector: Record<string, number[]> = {}
  for (const attempt of submitted) {
    if (attempt.companyReadiness) {
      for (const [company, score] of Object.entries(attempt.companyReadiness)) {
        if (!companyReadinessCollector[company]) companyReadinessCollector[company] = []
        companyReadinessCollector[company].push(score)
      }
    }
  }
  const avgCompanyReadiness: Record<string, number> = {}
  for (const [company, scores] of Object.entries(companyReadinessCollector)) {
    avgCompanyReadiness[company] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }

  const difficultyTrend = { easy: 0, medium: 0, hard: 0 }
  for (const attempt of submitted) {
    if (attempt.difficultyBreakdown) {
      difficultyTrend.easy += attempt.difficultyBreakdown.easy.accuracy
      difficultyTrend.medium += attempt.difficultyBreakdown.medium.accuracy
      difficultyTrend.hard += attempt.difficultyBreakdown.hard.accuracy
    }
  }
  if (submitted.length > 0) {
    difficultyTrend.easy = Math.round(difficultyTrend.easy / submitted.length)
    difficultyTrend.medium = Math.round(difficultyTrend.medium / submitted.length)
    difficultyTrend.hard = Math.round(difficultyTrend.hard / submitted.length)
  }

  const streak = calculateStreak(submitted)

  return {
    totalAttempts: submitted.length,
    averageAccuracy,
    bestAccuracy,
    recentAccuracy,
    trend,
    totalQuestionsAnswered,
    totalCorrect,
    totalIncorrect,
    sectionBreakdown,
    strengthAreas,
    weakAreas,
    percentile,
    readinessScore,
    improvementPlan,
    companyReadiness: avgCompanyReadiness,
    difficultyTrend,
    streak,
  }
}

function calculateStreak(attempts: AssessmentResult[]): { current: number; longest: number } {
  if (attempts.length === 0) return { current: 0, longest: 0 }

  const dates = [...new Set(attempts.map(a => new Date(a.completedAt).toDateString()))].sort()
  let current = 0
  let longest = 0
  let tempStreak = 1

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  if (dates.includes(today) || dates.includes(yesterday)) {
    current = 1
    for (let i = dates.length - 2; i >= 0; i--) {
      const curr = new Date(dates[i + 1]).getTime()
      const prev = new Date(dates[i]).getTime()
      if (curr - prev <= 86400000 * 1.5) {
        current++
      } else {
        break
      }
    }
  }

  tempStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i]).getTime()
    const prev = new Date(dates[i - 1]).getTime()
    if (curr - prev <= 86400000 * 1.5) {
      tempStreak++
    } else {
      longest = Math.max(longest, tempStreak)
      tempStreak = 1
    }
  }
  longest = Math.max(longest, tempStreak, current)

  return { current, longest }
}

// ═══════════════════════════════════════════════════════════════
// AI FEEDBACK API CALL
// ═══════════════════════════════════════════════════════════════

export async function fetchAIFeedback(result: AssessmentResult): Promise<{
  feedback: string
  strengths: string[]
  weaknesses: string[]
  recommendations: ImprovementRecommendation[]
}> {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('token')

    const response = await fetch(`${API_BASE}/assessments/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        assessmentType: result.assessmentType,
        score: result.score,
        totalMarks: result.totalMarks,
        accuracy: result.accuracy,
        sectionScores: result.sectionScores,
        difficultyBreakdown: result.difficultyBreakdown,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        timeTaken: result.timeTaken,
        timeAnalysis: result.timeAnalysis,
        companyReadiness: result.companyReadiness,
      }),
    })

    if (!response.ok) throw new Error('API request failed')

    const data = await response.json()
    return {
      feedback: data.feedback || result.aiFeedback,
      strengths: data.strengths || result.strengths,
      weaknesses: data.weaknesses || result.weaknesses,
      recommendations: data.recommendations || result.improvementRecommendations,
    }
  } catch {
    return {
      feedback: result.aiFeedback,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.improvementRecommendations,
    }
  }
}
