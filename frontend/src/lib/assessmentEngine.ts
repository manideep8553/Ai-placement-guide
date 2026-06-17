import { MOCK_ASSESSMENTS, type MockAssessment, type MockQuestion } from './assessmentData'

export interface AssessmentResult {
  attemptId: string
  assessmentId: string
  assessmentTitle: string
  assessmentType: string
  score: number
  totalMarks: number
  accuracy: number
  correctCount: number
  totalQuestions: number
  sectionScores: { section: string; score: number; total: number }[]
  strengths: string[]
  weaknesses: string[]
  suggestions: { area: string; suggestion: string }[]
  answers: {
    questionId: string
    questionType: string
    topic: string
    difficulty: string
    userAnswer: string | null
    correctAnswer: string | null
    isCorrect: boolean | null
    marksObtained: number
    explanation?: string
  }[]
  timeTaken: number
  completedAt: string
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
}

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
    'Logical Reasoning': 'Logical Reasoning',
    'Verbal Ability': 'Verbal Ability',
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
    'Operating Systems': 'Operating Systems',
    'DBMS': 'DBMS',
    'Computer Networks': 'Computer Networks',
    'OOPs': 'OOPs',
    'SQL': 'SQL',
    'Aptitude': 'Aptitude',
    'Verbal': 'Verbal Ability',
    'Logical': 'Logical Reasoning',
    'Coding': 'Coding',
    'System Design': 'System Design',
    'Algorithms': 'Data Structures & Algorithms',
    'Networking': 'Computer Networks',
    'Data Structures': 'Data Structures & Algorithms',
    'OS': 'Operating Systems',
    'Scenario': 'Scenario Based',
    'HR Scenario': 'HR & Behavioral',
  }
  return map[topic] || topic
}

function getAssessmentDefinition(assessmentId: string): MockAssessment | undefined {
  return MOCK_ASSESSMENTS.find(a => a.id === assessmentId)
}

function findCorrectAnswer(question: MockQuestion): string | null {
  if (question.questionType === 'MCQ') {
    return question.questionData?.correctAnswer || null
  }
  if (question.questionType === 'CODING') {
    return 'CODING'
  }
  if (question.questionType === 'DEBUGGING') {
    return 'DEBUGGING'
  }
  return null
}

export function scoreAssessment(
  assessmentId: string,
  answers: Record<string, string>,
  timeTakenSeconds: number
): AssessmentResult {
  const assessment = getAssessmentDefinition(assessmentId)
  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found`)
  }

  const totalMarks = assessment.totalMarks
  let totalScore = 0
  let correctCount = 0
  const answerDetails: AssessmentResult['answers'] = []
  const sectionMap: Record<string, { score: number; total: number }> = {}

  for (const question of assessment.questions) {
    const userAnswer = answers[question.id] ?? null
    const correctAnswer = findCorrectAnswer(question)
    let isCorrect: boolean | null = null
    let marksObtained = 0

    if (question.questionType === 'MCQ') {
      if (userAnswer !== null) {
        isCorrect = userAnswer === correctAnswer
        if (isCorrect) {
          marksObtained = question.marks
          correctCount++
        } else if (assessment.negativeMarking > 0) {
          marksObtained = -assessment.negativeMarking * getDifficultyWeight(question.difficulty)
        }
      }
    } else if (question.questionType === 'CODING') {
      const qData = question.questionData
      if (userAnswer && userAnswer.trim().length > 0) {
        const testCases = qData?.testCases || []
        const hiddenTestCases = qData?.hiddenTestCases || []
        const allCases = [...testCases, ...hiddenTestCases]
        if (allCases.length > 0) {
          const passedCases = Math.floor(Math.random() * (allCases.length + 1))
          const passRatio = passedCases / allCases.length
          marksObtained = Math.round(question.marks * passRatio)
          isCorrect = passRatio >= 0.7
          if (isCorrect && passRatio >= 0.7) correctCount++
        } else {
          isCorrect = true
          marksObtained = question.marks
          correctCount++
        }
      } else {
        isCorrect = false
        marksObtained = 0
      }
    } else {
      if (userAnswer && userAnswer.trim().length > 0) {
        isCorrect = true
        marksObtained = question.marks
        correctCount++
      } else {
        isCorrect = false
        marksObtained = 0
      }
    }

    totalScore = Math.max(0, totalScore + marksObtained)

    const section = normalizeTopic(question.topic)
    if (!sectionMap[section]) {
      sectionMap[section] = { score: 0, total: 0 }
    }
    sectionMap[section].total += question.marks
    if (marksObtained > 0) {
      sectionMap[section].score += marksObtained
    }

    answerDetails.push({
      questionId: question.id,
      questionType: question.questionType,
      topic: question.topic,
      difficulty: question.difficulty,
      userAnswer,
      correctAnswer,
      isCorrect,
      marksObtained,
      explanation: question.questionData?.explanation,
    })
  }

  const sectionScores = Object.entries(sectionMap).map(([section, data]) => ({
    section,
    score: data.score,
    total: data.total,
  }))

  const accuracy = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0

  const weakTopics = sectionScores
    .filter(s => s.total > 0 && (s.score / s.total) < 0.5)
    .map(s => s.section)
  const strongTopics = sectionScores
    .filter(s => s.total > 0 && (s.score / s.total) >= 0.7)
    .map(s => s.section)

  const wrongAnswers = answerDetails.filter(a => a.isCorrect === false)
  const suggestions: AssessmentResult['suggestions'] = wrongAnswers.slice(0, 5).map(a => ({
    area: `${a.topic} (${a.difficulty})`,
    suggestion: a.explanation
      ? `Review: ${a.explanation}`
      : `Practice more ${a.topic} problems at ${a.difficulty.toLowerCase()} level`,
  }))

  return {
    attemptId: `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    assessmentId,
    assessmentTitle: assessment.title,
    assessmentType: assessment.type,
    score: totalScore,
    totalMarks,
    accuracy,
    correctCount,
    totalQuestions: assessment.questions.length,
    sectionScores,
    strengths: strongTopics,
    weaknesses: weakTopics,
    suggestions,
    answers: answerDetails,
    timeTaken: timeTakenSeconds,
    completedAt: new Date().toISOString(),
  }
}

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
    }
  }

  const accuracies = submitted.map(a => a.accuracy)
  const averageAccuracy = Math.round(accuracies.reduce((a, b) => a + b, 0) / accuracies.length)
  const bestAccuracy = Math.max(...accuracies)
  const recentAccuracy = submitted[submitted.length - 1].accuracy

  const recent3 = submitted.slice(-3).map(a => a.accuracy)
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (recent3.length >= 2) {
    if (recent3[recent3.length - 1] > recent3[0]) trend = 'up'
    else if (recent3[recent3.length - 1] < recent3[0]) trend = 'down'
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

  const allAttemptsGlobal = getAllAttempts()
  const totalGlobal = allAttemptsGlobal.length
  const worseThan = allAttemptsGlobal.filter(a => a.accuracy < averageAccuracy).length
  const percentile = totalGlobal > 0 ? Math.round((worseThan / totalGlobal) * 100) : 50

  const readinessScore = Math.min(100, Math.round(
    (averageAccuracy * 0.4) +
    (bestAccuracy * 0.2) +
    (Math.min(submitted.length, 10) / 10 * 100 * 0.2) +
    (totalCorrect / Math.max(totalQuestionsAnswered, 1) * 100 * 0.2)
  ))

  const improvementPlan = weakAreas.slice(0, 5).map(area => ({
    topic: area,
    priority: (sectionBreakdown.find(s => s.section === area)?.averageScore ?? 0) < 30 ? 'high' as const : 'medium' as const,
    suggestion: `Focus on improving ${area} through targeted practice and concept review`,
  }))

  if (strengthAreas.length === 0 && improvementPlan.length === 0 && averageAccuracy > 0) {
    improvementPlan.push({
      topic: 'General Practice',
      priority: 'medium',
      suggestion: 'Continue practicing to maintain and improve your skills across all areas',
    })
  }

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
  }
}
