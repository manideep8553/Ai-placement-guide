const SANDBOXAPI_URL = process.env.SANDBOXAPI_URL || 'https://sandboxapi.p.rapidapi.com'
const SANDBOXAPI_KEY = process.env.SANDBOXAPI_KEY || process.env.JUDGE0_RAPIDAPI_KEY || ''
const SANDBOXAPI_TIMEOUT = 30000

const LANGUAGE_MAP: Record<string, string> = {
  python: 'python3',
  java: 'java',
  cpp: 'cpp',
  javascript: 'javascript',
  c: 'c',
}

const LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python 3.12',
  java: 'Java 21',
  cpp: 'C++ (GCC 14)',
  javascript: 'Node.js 22',
  c: 'C (GCC 14)',
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (SANDBOXAPI_KEY) {
    headers['X-RapidAPI-Key'] = SANDBOXAPI_KEY
    try {
      const host = new URL(SANDBOXAPI_URL).host
      headers['X-RapidAPI-Host'] = host
    } catch { /* ignore */ }
  }
  return headers
}

export interface SandboxAPIResult {
  id: string
  status: string
  language: string
  stdout: string
  stderr: string
  compile_output: string
  exit_code: number
  exit_signal: number
  execution_time_ms: number
  wall_time_ms: number
  memory_used_kb: number
}

export async function executeCode(
  code: string,
  language: string,
  input: string,
  expectedOutput: string,
): Promise<{ passed: boolean; actualOutput: string | null; error: string | null; executionTime: number | null; memory: number | null }> {
  const langId = LANGUAGE_MAP[language]
  if (!langId) {
    return { passed: false, actualOutput: null, error: `Unsupported language: ${language}`, executionTime: null, memory: null }
  }

  try {
    const body: Record<string, any> = {
      language: langId,
      code,
      stdin: input || '',
      expected_output: expectedOutput,
      timeout: 5,
    }

    const submitRes = await fetch(`${SANDBOXAPI_URL}/v1/execute`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(SANDBOXAPI_TIMEOUT),
    })

    if (!submitRes.ok) {
      const text = await submitRes.text()
      return { passed: false, actualOutput: null, error: `SandboxAPI error: ${submitRes.status} ${text}`, executionTime: null, memory: null }
    }

    const result = (await submitRes.json()) as SandboxAPIResult

    if (result.status === 'completed') {
      return {
        passed: true,
        actualOutput: result.stdout?.trim() || null,
        error: null,
        executionTime: result.execution_time_ms || null,
        memory: result.memory_used_kb || null,
      }
    }

    if (result.status === 'wrong_answer') {
      return {
        passed: false,
        actualOutput: result.stdout?.trim() || null,
        error: `Expected: ${expectedOutput}, Got: ${result.stdout?.trim() || 'null'}`,
        executionTime: result.execution_time_ms || null,
        memory: result.memory_used_kb || null,
      }
    }

    const errorMsg = result.compile_output || result.stderr || result.status
    return {
      passed: false,
      actualOutput: null,
      error: errorMsg || `Status: ${result.status}`,
      executionTime: result.execution_time_ms || null,
      memory: result.memory_used_kb || null,
    }
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { passed: false, actualOutput: null, error: 'Execution timed out', executionTime: null, memory: null }
    }
    return { passed: false, actualOutput: null, error: err.message || 'Execution failed', executionTime: null, memory: null }
  }
}

export async function executeTestCases(
  code: string,
  language: string,
  testCases: { input: string; expectedOutput: string; id: string; orderIndex: number }[],
): Promise<{
  results: { testCaseId: string; passed: boolean; actualOutput: string | null; error: string | null; executionTime: number | null; memory: number | null; index: number }[]
  passedCount: number
  totalCount: number
  averageTime: number | null
  peakMemory: number | null
}> {
  const results = await Promise.all(
    testCases.map(tc =>
      executeCode(code, language, tc.input, tc.expectedOutput).then(r => ({
        testCaseId: tc.id,
        passed: r.passed,
        actualOutput: r.actualOutput,
        error: r.error,
        executionTime: r.executionTime,
        memory: r.memory,
        index: tc.orderIndex,
      }))
    )
  )

  const passedCount = results.filter(r => r.passed).length
  const times = results.map(r => r.executionTime).filter((t): t is number => t !== null)
  const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null
  const memories = results.map(r => r.memory).filter((m): m is number => m !== null)
  const peakMemory = memories.length > 0 ? Math.max(...memories) : null

  return { results, passedCount, totalCount: testCases.length, averageTime, peakMemory }
}

export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_MAP).map(([id, sandboxId]) => ({
    id,
    name: LANGUAGE_NAMES[id] || id,
    sandboxId,
  }))
}
