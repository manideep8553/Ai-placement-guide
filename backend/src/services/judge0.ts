const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358'
const JUDGE0_TIMEOUT = 30000

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  javascript: 63,
  c: 50,
}

const LANGUAGE_NAMES: Record<string, string> = {
  python: 'Python (3.8.1)',
  java: 'Java (OpenJDK 13.0.1)',
  cpp: 'C++ (GCC 9.2.0)',
  javascript: 'JavaScript (Node.js 12.14.0)',
  c: 'C (GCC 9.2.0)',
}

export interface Judge0Result {
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  status: { id: number; description: string }
  time: string | null
  memory: number | null
  exit_code: number | null
  token: string
}

function buildSourceCode(code: string, language: string, input: string): string {
  if (language === 'python') {
    return `${code}\n\nimport sys\nsys.stdin.write(str(${code.includes('def ') ? 'globals()' : 'eval'}(...)))`
  }
  return code
}

function wrapCodeWithInput(code: string, language: string, input: string): string {
  if (language === 'python') {
    const lines = code.split('\n')
    const funcLines = lines.filter(l => l.trim().startsWith('def ') || l.trim().startsWith('class '))
    if (funcLines.length > 0) {
      const funcName = funcLines[0].trim().split('(')[0].replace('def ', '').replace('class ', '')
      return `${code}\n\nif __name__ == "__main__":\n    import sys\n    import json\n    data = json.loads(sys.stdin.read())\n    result = ${funcName}(**data) if isinstance(data, dict) else ${funcName}(*data)\n    print(json.dumps(result))`
    }
    return `${code}\n\nif __name__ == "__main__":\n    import sys\n    import json\n    data = json.loads(sys.stdin.read())\n    print(json.dumps(data))`
  }
  return code
}

export async function executeCode(
  code: string,
  language: string,
  input: string,
  expectedOutput: string,
): Promise<{ passed: boolean; actualOutput: string | null; error: string | null; executionTime: number | null }> {
  const langId = LANGUAGE_IDS[language]
  if (!langId) {
    return { passed: false, actualOutput: null, error: `Unsupported language: ${language}`, executionTime: null }
  }

  try {
    const submissionBody = {
      source_code: code,
      language_id: langId,
      stdin: input,
      expected_output: expectedOutput,
      cpu_time_limit: 5,
      memory_limit: 256000,
      redirect_stderr_to_stdout: true,
    }

    const submitRes = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionBody),
      signal: AbortSignal.timeout(JUDGE0_TIMEOUT),
    })

    if (!submitRes.ok) {
      const text = await submitRes.text()
      return { passed: false, actualOutput: null, error: `Judge0 error: ${submitRes.status} ${text}`, executionTime: null }
    }

    const result = (await submitRes.json()) as Judge0Result
    const statusId = result.status.id

    if (statusId === 3) {
      return {
        passed: true,
        actualOutput: result.stdout?.trim() || null,
        error: null,
        executionTime: result.time ? parseFloat(result.time) * 1000 : null,
      }
    }

    if (statusId === 4) {
      return {
        passed: false,
        actualOutput: result.stdout?.trim() || null,
        error: `Expected: ${expectedOutput}, Got: ${result.stdout?.trim() || 'null'}`,
        executionTime: result.time ? parseFloat(result.time) * 1000 : null,
      }
    }

    const errorMsg = result.stderr || result.compile_output || result.status.description
    return {
      passed: false,
      actualOutput: null,
      error: errorMsg || `Status: ${result.status.description}`,
      executionTime: result.time ? parseFloat(result.time) * 1000 : null,
    }
  } catch (err: any) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return { passed: false, actualOutput: null, error: 'Execution timed out', executionTime: null }
    }
    return { passed: false, actualOutput: null, error: err.message || 'Execution failed', executionTime: null }
  }
}

export async function executeTestCases(
  code: string,
  language: string,
  testCases: { input: string; expectedOutput: string; id: string; orderIndex: number }[],
): Promise<{
  results: { testCaseId: string; passed: boolean; actualOutput: string | null; error: string | null; executionTime: number | null; index: number }[]
  passedCount: number
  totalCount: number
  averageTime: number | null
}> {
  const results = await Promise.all(
    testCases.map(tc =>
      executeCode(code, language, tc.input, tc.expectedOutput).then(r => ({
        testCaseId: tc.id,
        passed: r.passed,
        actualOutput: r.actualOutput,
        error: r.error,
        executionTime: r.executionTime,
        index: tc.orderIndex,
      }))
    )
  )

  const passedCount = results.filter(r => r.passed).length
  const times = results.map(r => r.executionTime).filter((t): t is number => t !== null)
  const averageTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null

  return { results, passedCount, totalCount: testCases.length, averageTime }
}

export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_IDS).map(([id, judge0Id]) => ({
    id,
    name: LANGUAGE_NAMES[id] || id,
    judge0Id,
  }))
}
