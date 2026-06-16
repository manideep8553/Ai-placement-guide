import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.assessmentAnswer.deleteMany()
  await prisma.assessmentAttempt.deleteMany()
  await prisma.assessmentQuestion.deleteMany()
  await prisma.assessment.deleteMany()
  await prisma.companyChance.deleteMany()
  await prisma.placementScore.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.codingSubmission.deleteMany()
  await prisma.interviewMessage.deleteMany()
  await prisma.interviewSession.deleteMany()
  await prisma.roadmapWeek.deleteMany()
  await prisma.roadmap.deleteMany()
  await prisma.gapAnalysis.deleteMany()
  await prisma.resume.deleteMany()
  await prisma.problem.deleteMany()
  await prisma.user.deleteMany()

  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1', email: 'rahul@college.edu', name: 'Rahul Kumar',
        passwordHash: '$2a$10$dummy', college: 'IIT Bombay', branch: 'CSE', graduationYear: 2025,
        profile: { create: { currentLevel: 'Intermediate', targetCompany: 'Google', leetcodeUsername: 'rahul_k', githubUsername: 'rahulk' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-2', email: 'priya@college.edu', name: 'Priya Sharma',
        passwordHash: '$2a$10$dummy', college: 'NIT Trichy', branch: 'IT', graduationYear: 2025,
        profile: { create: { currentLevel: 'Advanced', targetCompany: 'Microsoft', leetcodeUsername: 'priya_s', githubUsername: 'priyasharma' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-3', email: 'amit@college.edu', name: 'Amit Patel',
        passwordHash: '$2a$10$dummy', college: 'BITS Pilani', branch: 'ECE', graduationYear: 2026,
        profile: { create: { currentLevel: 'Beginner', targetCompany: 'TCS', leetcodeUsername: 'amit_p', githubUsername: 'amitpatel' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-4', email: 'sneha@college.edu', name: 'Sneha Reddy',
        passwordHash: '$2a$10$dummy', college: 'IIIT Hyderabad', branch: 'CSE', graduationYear: 2025,
        profile: { create: { currentLevel: 'Advanced', targetCompany: 'Amazon', leetcodeUsername: 'sneha_r', githubUsername: 'snehareddy' } }
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-5', email: 'vikram@college.edu', name: 'Vikram Singh',
        passwordHash: '$2a$10$dummy', college: 'VIT Vellore', branch: 'CSE', graduationYear: 2026,
        profile: { create: { currentLevel: 'Intermediate', targetCompany: 'Infosys', leetcodeUsername: 'vikram_s', githubUsername: 'vikramsingh' } }
      }
    }),
  ])

  console.log(`Created ${users.length} users`)

  const score = await prisma.placementScore.create({
    data: {
      userId: 'user-1', aptitude: 78, dsa: 65, coreSubjects: 72, communication: 80, resumeScore: 85, overall: 74,
      companyChances: {
        create: [
          { companyName: 'TCS', chancePercent: 92 },
          { companyName: 'Infosys', chancePercent: 85 },
          { companyName: 'Wipro', chancePercent: 78 },
          { companyName: 'Microsoft', chancePercent: 55 },
          { companyName: 'Amazon', chancePercent: 42 },
          { companyName: 'Google', chancePercent: 28 },
        ]
      }
    }
  })

  const problems = []
  const problemData = [
    { title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', company: ['Google', 'Amazon', 'Microsoft'] },
    { title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', company: ['Amazon', 'Microsoft'] },
    { title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', company: ['Google', 'Amazon'] },
    { title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Dynamic Programming', company: ['Amazon', 'Microsoft'] },
    { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', company: ['Google', 'Amazon'] },
    { title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', company: ['Microsoft', 'Adobe'] },
    { title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Tree', company: ['Amazon', 'Google'] },
    { title: 'LRU Cache', difficulty: 'Medium', topic: 'Design', company: ['Google', 'Amazon', 'Microsoft'] },
    { title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'Heap', company: ['Amazon', 'Meta'] },
    { title: 'Number of Islands', difficulty: 'Medium', topic: 'Graph', company: ['Amazon', 'Google'] },
    { title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'String', company: ['Microsoft', 'Amazon'] },
    { title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers', company: ['Google', 'Amazon'] },
    { title: 'Course Schedule', difficulty: 'Medium', topic: 'Graph', company: ['Google', 'Meta'] },
    { title: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard', topic: 'Tree', company: ['Google', 'Amazon'] },
    { title: 'Edit Distance', difficulty: 'Hard', topic: 'Dynamic Programming', company: ['Microsoft', 'Google'] },
    { title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Sliding Window', company: ['Amazon', 'Google'] },
    { title: 'Word Ladder', difficulty: 'Hard', topic: 'Graph', company: ['Amazon', 'Microsoft'] },
    { title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', company: ['Google', 'Amazon'] },
    { title: 'Trapping Rain Water', difficulty: 'Hard', topic: 'Two Pointers', company: ['Amazon', 'Google'] },
    { title: 'Kth Largest Element in an Array', difficulty: 'Medium', topic: 'Heap', company: ['Meta', 'Microsoft'] },
  ]

  for (const p of problemData) {
    const problem = await prisma.problem.create({
      data: {
        title: p.title, difficulty: p.difficulty, topic: p.topic,
        companyTags: p.company,
        description: `Given a problem statement for ${p.title}. This is a ${p.difficulty} level problem in ${p.topic}.`,
        solutionApproach: `Use ${p.topic} approach to solve efficiently.`,
        optimalComplexity: { time: 'O(n)', space: 'O(n)' },
        constraints: ['1 ≤ input length ≤ 10^5', '-10^9 ≤ values ≤ 10^9'],
        testCases: [
          { input: '[2,7,11,15], target=9', expectedOutput: '[0,1]' },
          { input: '[3,2,4], target=6', expectedOutput: '[1,2]' },
        ]
      }
    })
    problems.push(problem)
  }

  console.log(`Created ${problems.length} problems`)

  console.log('Seeding assessment data...')
  const { seedAssessments } = await import('./seed-assessments')
  await seedAssessments()
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
