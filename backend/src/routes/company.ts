import { Router, Request, Response } from 'express'
import { prisma } from '../index'

const router = Router()

const companies = [
  { id: 'google', name: 'Google', slug: 'google', logo: '🔵', avgPackage: '₹45 LPA', difficulty: 'Hard', interviewRounds: 5 },
  { id: 'amazon', name: 'Amazon', slug: 'amazon', logo: '🟠', avgPackage: '₹35 LPA', difficulty: 'Hard', interviewRounds: 4 },
  { id: 'microsoft', name: 'Microsoft', slug: 'microsoft', logo: '🟦', avgPackage: '₹30 LPA', difficulty: 'Hard', interviewRounds: 4 },
  { id: 'meta', name: 'Meta', slug: 'meta', logo: '🔵', avgPackage: '₹40 LPA', difficulty: 'Hard', interviewRounds: 5 },
  { id: 'adobe', name: 'Adobe', slug: 'adobe', logo: '🔴', avgPackage: '₹25 LPA', difficulty: 'Medium', interviewRounds: 4 },
  { id: 'virtusa', name: 'Virtusa', slug: 'virtusa', logo: '🟢', avgPackage: '₹8 LPA', difficulty: 'Easy', interviewRounds: 3 },
  { id: 'infosys', name: 'Infosys', slug: 'infosys', logo: '🟦', avgPackage: '₹9 LPA', difficulty: 'Easy', interviewRounds: 3 },
  { id: 'tcs', name: 'TCS', slug: 'tcs', logo: '🟣', avgPackage: '₹7 LPA', difficulty: 'Easy', interviewRounds: 3 },
  { id: 'wipro', name: 'Wipro', slug: 'wipro', logo: '🟢', avgPackage: '₹8 LPA', difficulty: 'Easy', interviewRounds: 3 },
]

router.get('/', (_req: Request, res: Response) => {
  res.json(companies)
})

router.get('/:slug', (req: Request, res: Response) => {
  const company = companies.find(c => c.slug === String(req.params.slug))
  if (!company) {
    return res.status(404).json({ error: 'Company not found', code: 'COMPANY_NOT_FOUND' })
  }
  const full = {
    ...company,
    rounds: [
      { name: 'Online Assessment', description: 'Coding challenges on DSA and problem solving', duration: '90 mins' },
      { name: 'Technical Round 1', description: 'Data structures, algorithms, and problem solving', duration: '60 mins' },
      { name: 'Technical Round 2', description: 'System design and architecture discussion', duration: '60 mins' },
      { name: 'HR Round', description: 'Behavioral questions and cultural fit assessment', duration: '30 mins' },
    ],
    topQuestions: [
      { id: 1, question: 'Implement a function to reverse a linked list', category: 'DSA', difficulty: 'Easy', topic: 'Linked List' },
      { id: 2, question: 'Design a URL shortening service like TinyURL', category: 'System Design', difficulty: 'Medium', topic: 'System Design' },
      { id: 3, question: 'Explain the CAP theorem', category: 'Core Subject', difficulty: 'Medium', topic: 'Distributed Systems' },
      { id: 4, question: 'Tell me about a time you resolved a conflict in a team', category: 'HR', difficulty: 'Easy', topic: 'Behavioral' },
      { id: 5, question: 'Find the longest palindromic substring in a string', category: 'DSA', difficulty: 'Hard', topic: 'String' },
    ],
    topics: [
      { id: 't1', name: 'Arrays & Hashing', completed: false },
      { id: 't2', name: 'Two Pointers', completed: false },
      { id: 't3', name: 'Sliding Window', completed: false },
      { id: 't4', name: 'Binary Search', completed: false },
      { id: 't5', name: 'Linked Lists', completed: false },
      { id: 't6', name: 'Trees & Graphs', completed: false },
      { id: 't7', name: 'Dynamic Programming', completed: false },
      { id: 't8', name: 'System Design Basics', completed: false },
      { id: 't9', name: 'Object Oriented Design', completed: false },
    ]
  }
  res.json(full)
})

router.get('/:slug/questions', (req: Request, res: Response) => {
  const { difficulty, topic, page = '1' } = req.query as Record<string, string>
  let questions = [
    { id: 1, question: 'Implement a function to reverse a linked list', category: 'DSA', difficulty: 'Easy', topic: 'Linked List' },
    { id: 2, question: 'Design a URL shortening service', category: 'System Design', difficulty: 'Medium', topic: 'System Design' },
    { id: 3, question: 'Explain the CAP theorem', category: 'Core Subject', difficulty: 'Medium', topic: 'Distributed Systems' },
    { id: 4, question: 'Tell me about a time you resolved a conflict', category: 'HR', difficulty: 'Easy', topic: 'Behavioral' },
  ]
  if (difficulty) questions = questions.filter(q => q.difficulty === difficulty)
  if (topic) questions = questions.filter(q => q.topic === topic)
  const pageNum = parseInt(page)
  const perPage = 10
  const start = (pageNum - 1) * perPage
  res.json({ questions: questions.slice(start, start + perPage), total: questions.length, page: pageNum, perPage })
})

export default router
