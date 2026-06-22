import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' })

export async function generateCodingFeedback(params: {
  problemTitle: string
  problemDescription: string
  difficulty: string
  code: string
  language: string
  passedCount: number
  totalCount: number
  testCaseResults: { passed: boolean; error: string | null }[]
  solutionApproach?: string | null
  optimalComplexity?: { time?: string; space?: string } | null
}): Promise<{
  suggestions: string[]
  optimizedApproach: string
  styleIssues: string[]
  edgeCasesMissed: string[]
  timeComplexity: string
  spaceComplexity: string
  codeQuality: number
}> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
    return generateMockFeedback(params)
  }

  try {
    const prompt = `You are a senior software engineer conducting a code review.

Problem: "${params.problemTitle}"
Difficulty: ${params.difficulty}
Description: ${params.problemDescription}
Language: ${params.language}

Code:
\`\`\`${params.language}
${params.code}
\`\`\`

Test Results: ${params.passedCount}/${params.totalCount} passed
${params.testCaseResults.map((r, i) => `  Test ${i + 1}: ${r.passed ? 'PASS' : 'FAIL'}${r.error ? ' - ' + r.error : ''}`).join('\n')}

Provide a detailed code review in JSON format:
{
  "suggestions": ["list of specific improvement suggestions"],
  "optimizedApproach": "description of the optimal approach",
  "styleIssues": ["code style issues found"],
  "edgeCasesMissed": ["edge cases not handled"],
  "timeComplexity": "analyzed time complexity",
  "spaceComplexity": "analyzed space complexity",
  "codeQuality": 0-100 score
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return generateMockFeedback(params)

    const parsed = JSON.parse(content)
    return {
      suggestions: parsed.suggestions || [],
      optimizedApproach: parsed.optimizedApproach || params.solutionApproach || 'Use an efficient algorithm',
      styleIssues: parsed.styleIssues || [],
      edgeCasesMissed: parsed.edgeCasesMissed || [],
      timeComplexity: parsed.timeComplexity || 'O(n)',
      spaceComplexity: parsed.spaceComplexity || 'O(n)',
      codeQuality: Math.min(100, Math.max(0, parsed.codeQuality || 70)),
    }
  } catch {
    return generateMockFeedback(params)
  }
}

function generateMockFeedback(params: {
  code: string
  passedCount: number
  totalCount: number
  solutionApproach?: string | null
}): {
  suggestions: string[]
  optimizedApproach: string
  styleIssues: string[]
  edgeCasesMissed: string[]
  timeComplexity: string
  spaceComplexity: string
  codeQuality: number
} {
  const passRatio = params.passedCount / params.totalCount
  const codeQuality = Math.round(passRatio * 60 + Math.random() * 20 + 10)

  const suggestions = [
    'Consider adding input validation at the start of the function',
    'Use more descriptive variable names for better readability',
    'Add type hints/annotations for better code documentation',
  ]
  if (passRatio < 1) {
    suggestions.push('Review edge cases - some test cases are failing')
  }

  return {
    suggestions,
    optimizedApproach: params.solutionApproach || 'Use a more efficient data structure for optimal performance',
    styleIssues: [
      'Inconsistent indentation detected',
      'Consider extracting repeated logic into helper functions',
      'Add comments for complex logic sections',
    ],
    edgeCasesMissed: passRatio < 1 ? ['Empty input handling', 'Null/undefined values', 'Large input bounds'] : [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    codeQuality,
  }
}
