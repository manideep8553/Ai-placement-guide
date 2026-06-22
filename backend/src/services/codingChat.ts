import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder' })

function mockResponse(question: string) {
  const lower = question.toLowerCase()
  if (lower.includes('hint') || lower.includes('approach') || lower.includes('how to solve')) {
    return 'Think about what data structure gives you the most efficient lookups. Consider using a hash map to track elements you have seen, which can help you find complements in O(1) time per lookup.'
  }
  if (lower.includes('edge case') || lower.includes('what if')) {
    return 'Consider edge cases like empty input, single element arrays, very large values, negative numbers, and duplicate elements. Your solution should handle all valid inputs within the problem constraints gracefully.'
  }
  if (lower.includes('complexity') || lower.includes('optimize') || lower.includes('efficient')) {
    return 'The optimal solution typically achieves O(n) time complexity by using a hash map to trade space for speed. Can you avoid nested loops? Often a single pass with a hash map is the key.'
  }
  if (lower.includes('error') || lower.includes('bug') || lower.includes('wrong')) {
    return 'Check your loop boundaries and conditional logic. Trace through a small example manually and verify each step matches your expected output. Off-by-one errors are common.'
  }
  return 'Break the problem into smaller parts. First, parse the input correctly. Then, think about which data structure or algorithm applies to this specific problem type. Finally, test with the provided examples.'
}

export async function generateChatResponse(problemTitle: string, problemDescription: string, userMessage: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
    return mockResponse(userMessage)
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful coding interview assistant. The user is solving this problem:\n\nTitle: ${problemTitle}\nDescription: ${problemDescription}\n\nProvide concise, helpful guidance without giving away the full solution. Offer hints, point to relevant concepts, and help them think through the problem.`,
        },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 300,
    })

    return response.choices[0]?.message?.content || mockResponse(userMessage)
  } catch {
    return mockResponse(userMessage)
  }
}
