import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockCodingProblems } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { Play, CheckCircle2, XCircle, Lightbulb, Bot, ChevronLeft, ChevronRight, Code2, Clock, Cpu, BarChart3, MessageSquare, Sparkles, Send, Menu } from 'lucide-react'
import { motion } from 'framer-motion'

const LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'javascript', label: 'JavaScript' },
] as const

const KEYWORDS: Record<string, string[]> = {
  python: ['def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'True', 'False', 'None', 'pass', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'self'],
  java: ['public', 'private', 'protected', 'class', 'static', 'void', 'int', 'String', 'List', 'Map', 'Set', 'boolean', 'char', 'double', 'float', 'long', 'new', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'null', 'true', 'false', 'this', 'super', 'try', 'catch', 'throw', 'throws', 'import', 'package'],
  cpp: ['class', 'public', 'private', 'protected', 'int', 'double', 'float', 'char', 'bool', 'string', 'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'void', 'auto', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'nullptr', 'true', 'false', 'this', 'virtual', 'override', 'const', 'static', 'using', 'namespace', 'include', 'template', 'typename', 'struct'],
  javascript: ['function', 'var', 'let', 'const', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'null', 'undefined', 'true', 'false', 'this', 'new', 'typeof', 'instanceof', 'try', 'catch', 'throw', 'class', 'extends', 'super', 'import', 'export', 'default', 'from', 'async', 'await', 'yield'],
}

const BUILTINS: Record<string, string[]> = {
  python: ['List', 'Dict', 'Tuple', 'Set', 'Optional', 'int', 'str', 'float', 'bool', 'print', 'range', 'len', 'map', 'filter', 'zip', 'enumerate', 'sorted', 'reversed', 'min', 'max', 'sum', 'any', 'all'],
  java: ['ArrayList', 'LinkedList', 'HashMap', 'HashSet', 'TreeMap', 'TreeSet', 'PriorityQueue', 'Stack', 'Queue', 'Deque', 'Arrays', 'Collections', 'Math', 'Integer', 'Double', 'Character', 'StringBuilder', 'StringBuffer', 'System'],
  cpp: ['cout', 'cin', 'endl', 'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'stack', 'queue', 'priority_queue', 'deque', 'pair', 'make_pair', 'sort', 'reverse', 'min', 'max', 'swap', 'abs', 'pow', 'sqrt'],
  javascript: ['console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Map', 'Set', 'Promise', 'setTimeout', 'setInterval', 'parseInt', 'parseFloat', 'isNaN', 'Array.isArray', 'Object.keys', 'Object.values'],
}

function highlightSyntax(code: string, language: string): React.ReactNode[] {
  const lang = (language in KEYWORDS ? language : 'python') as keyof typeof KEYWORDS
  const kw = KEYWORDS[lang]
  const blt = BUILTINS[lang]

  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = []
    const parts = line.split(/(\/\/.*|#.*|"""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*'|\b\w+\b|\s+)/g)
    parts.forEach((part, i) => {
      if (!part) return
      if (part.startsWith('//') || part.startsWith('#')) {
        tokens.push(<span key={i} className="text-[#6A9955]">{part}</span>)
      } else if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
        tokens.push(<span key={i} className="text-[#ce9178]">{part}</span>)
      } else if (kw.includes(part)) {
        tokens.push(<span key={i} className="text-[#569cd6]">{part}</span>)
      } else if (blt.includes(part)) {
        tokens.push(<span key={i} className="text-[#4ec9b0]">{part}</span>)
      } else if (/^\d+$/.test(part)) {
        tokens.push(<span key={i} className="text-[#b5cea8]">{part}</span>)
      } else {
        tokens.push(<span key={i}>{part}</span>)
      }
    })
    return (
      <div key={lineIdx} className="flex">
        <span className="select-none w-12 flex-shrink-0 text-right pr-4 text-[#858585] text-sm leading-6">{lineIdx + 1}</span>
        <span className="leading-6 whitespace-pre">{tokens}</span>
      </div>
    )
  })
}

function CircularGauge({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const [animated, setAnimated] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 300)
    return () => clearTimeout(timer)
  }, [value])

  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{animated}</span>
    </div>
  )
}

function TestCaseGrid({ results }: { results: { passed: boolean }[] }) {
  const cols = Math.min(5, results.length)
  
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {results.map((r, i) => (
        <div key={i} className={cn("flex items-center gap-2 rounded-lg border p-3 text-sm", r.passed ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20" : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20")}>
          {r.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
          <span>Test {i + 1}</span>
        </div>
      ))}
    </div>
  )
}

const DIFFICULTY_DOT: Record<string, string> = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-red-500',
}

function getDifficultyVariant(d: string) {
  if (d === 'Easy') return 'success' as const
  if (d === 'Medium') return 'warning' as const
  return 'destructive' as const
}

function generateMockTestResults(problem: typeof mockCodingProblems[0]) {
  return problem.testCases.map(() => ({
    passed: Math.random() > 0.25,
  }))
}

const MOCK_HINTS: Record<string, string> = {
  'CP001': 'Try using a hash map to store elements you have seen so far. For each element, check if target - current element exists in the map.',
  'CP002': 'Use a stack data structure. Push opening brackets, and when you see a closing bracket, check if it matches the top of the stack.',
  'CP003': 'Use three pointers: prev, current, and next. Iterate through the list, reversing the next pointer of each node.',
  'CP004': 'Try Kadane\'s algorithm: maintain a current sum and max sum. Reset current sum to 0 when it becomes negative.',
  'CP005': 'Use a sliding window with a hash set. Expand the right pointer and if you find a duplicate, move the left pointer forward.',
  'CP006': 'Use a dummy node to simplify the merge logic. Compare values and attach the smaller node to the result.',
  'CP007': 'This is a BFS problem. Use a queue to process nodes level by level.',
  'CP008': 'Combine a doubly linked list with a hash map. The linked list tracks usage order; the map provides O(1) access.',
  'CP009': 'Think about using a min-heap of size k, or the quickselect algorithm for O(n) average time.',
  'CP010': 'Use a hash map to track cloned nodes and perform DFS traversal of the graph.',
  'CP011': 'When you find a \'1\', increment the count and perform DFS to mark all connected land as visited.',
  'CP012': 'Try the expand-around-center approach: treat each character (and gap) as a potential palindrome center.',
  'CP013': 'This is a classic two-pointer problem. Track max heights from both ends.',
  'CP014': 'Use dynamic programming: build a dp array where dp[i] is the minimum coins needed for amount i.',
  'CP015': 'This is a cycle detection problem in a directed graph. Try Kahn\'s algorithm (topological sort).',
  'CP016': 'Standard binary search: maintain left and right pointers, check the middle element.',
  'CP017': 'This is the Fibonacci sequence. dp[i] = dp[i-1] + dp[i-2]. Can you optimize space?',
  'CP018': 'Track both max and min products ending at each position. When you see a negative, swap them.',
  'CP019': 'Use preorder traversal with a marker for null nodes. Rebuild using the same order.',
  'CP020': 'Use two heaps: a max-heap for the smaller half and a min-heap for the larger half.',
}

const MOCK_AI_CHAT: Record<string, { question: string; answer: string }[]> = {
  'CP001': [
    { question: 'What approach should I use?', answer: 'I recommend using a hash map approach. Iterate through the array once, storing each element\'s value and index. For each element, check if target - nums[i] exists in the map. This gives O(n) time complexity.' },
    { question: 'How do I handle edge cases?', answer: 'The problem guarantees exactly one solution, so you don\'t need to handle the no-solution case. However, you should ensure you don\'t use the same element twice - the hash map approach naturally avoids this since you check before adding the current element.' },
  ],
}

const DEFAULT_AI_CHAT = [
  { question: 'Can you help me understand the problem?', answer: 'This problem tests your understanding of efficient algorithms. The brute force approach would be O(n²), but we can do better. Think about what data structure gives you O(1) lookups.' },
  { question: 'What\'s the optimal time complexity?', answer: 'The optimal solution runs in O(n) time. This is achievable by trading space for time - using extra memory to avoid nested loops. The space complexity will typically be O(n) in the worst case.' },
]

export default function CodingInterview() {
  const [selectedProblem, setSelectedProblem] = useState(mockCodingProblems[0])
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showAiChat, setShowAiChat] = useState(false)
  const [testResults, setTestResults] = useState<{ passed: boolean }[] | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedProblem) {
      const starter = selectedProblem.starterCode[language as keyof typeof selectedProblem.starterCode]
      setCode(starter || '')
      setTestResults(null)
      setShowResults(false)
      setShowHint(false)
      setShowAiChat(false)
      setAiMessages([])
    }
  }, [selectedProblem, language])

  const filteredProblems = mockCodingProblems.filter(
    (p) => difficultyFilter === 'All' || p.difficulty === difficultyFilter
  )

  const difficultyBadgeVariant = getDifficultyVariant(selectedProblem.difficulty)

  function handleRun() {
    setShowResults(true)
    setTestResults(generateMockTestResults(selectedProblem))
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  function handleSubmit() {
    setShowResults(true)
    setTestResults(generateMockTestResults(selectedProblem))
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  function handleAiSend() {
    if (!aiInput.trim()) return
    setAiMessages((prev) => [...prev, { role: 'user', text: aiInput }])
    setAiInput('')
    const chat = MOCK_AI_CHAT[selectedProblem.id] || DEFAULT_AI_CHAT
    const reply = chat[Math.floor(Math.random() * chat.length)]
    setTimeout(() => {
      setAiMessages((prev) => [...prev, { role: 'assistant', text: reply.answer }])
    }, 800)
  }

  const passedCount = testResults?.filter((r) => r.passed).length ?? 0
  const totalTests = testResults?.length ?? 0
  const codeQuality = Math.min(100, 65 + passedCount * 5 + Math.floor(Math.random() * 10))

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-background">
      {/* Problem Selector Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 280 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 overflow-hidden border-r bg-card"
      >
        <div className={cn("w-[280px] h-full flex flex-col", !sidebarOpen && "hidden")}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">Problems</h3>
            <span className="text-xs text-muted-foreground">{filteredProblems.length}</span>
          </div>
          <div className="flex gap-1 px-4 py-2 border-b">
            {['All', 'Easy', 'Medium', 'Hard'].map((f) => (
              <button
                key={f}
                onClick={() => setDifficultyFilter(f)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-lg transition-colors",
                  difficultyFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {filteredProblems.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProblem(p); setSidebarOpen(false) }}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3",
                    selectedProblem.id === p.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", DIFFICULTY_DOT[p.difficulty])} />
                  <span className="truncate">{p.title}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </motion.div>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex-shrink-0 w-8 border-r flex items-center justify-center hover:bg-accent transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b bg-card">
          <Code2 className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-base truncate">{selectedProblem.title}</h1>
          <Badge variant={difficultyBadgeVariant}>{selectedProblem.difficulty}</Badge>
          <Badge variant="outline" className="text-xs">{selectedProblem.topic}</Badge>
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            {selectedProblem.companyTags.slice(0, 4).map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
            ))}
            {selectedProblem.companyTags.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{selectedProblem.companyTags.length - 4}</span>
            )}
          </div>
        </div>

        {/* Body: Left Panel + Right Panel */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel - Problem Statement */}
          <div className="w-[40%] flex-shrink-0 border-r flex flex-col min-w-0">
            <ScrollArea className="flex-1">
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-sm leading-relaxed text-foreground/90">{selectedProblem.description}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Constraints</h4>
                  <ul className="space-y-1">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1.5 h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Examples</h4>
                  <div className="space-y-3">
                    {selectedProblem.examples.map((ex, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-3 space-y-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Input:</span>
                            <pre className="mt-0.5 text-sm bg-muted rounded-lg p-2 overflow-x-auto">{ex.input}</pre>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Output:</span>
                            <pre className="mt-0.5 text-sm bg-muted rounded-lg p-2 overflow-x-auto">{ex.output}</pre>
                          </div>
                          {ex.explanation && (
                            <p className="text-xs text-muted-foreground">{ex.explanation}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Bottom toolbar */}
            <div className="flex items-center gap-2 p-3 border-t bg-card">
              <Button size="sm" onClick={handleRun}>
                <Play className="h-3.5 w-3.5 mr-1.5" /> Run
              </Button>
              <Button size="sm" onClick={handleSubmit} variant="default">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Submit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowHint(!showHint)}>
                <Lightbulb className="h-3.5 w-3.5 mr-1.5" /> Hint
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAiChat(!showAiChat)}>
                <Bot className="h-3.5 w-3.5 mr-1.5" /> Ask AI
              </Button>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
            {/* Language selector */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#858585]" />
                <span className="text-xs text-[#cccccc] font-medium">{selectedProblem.id} · {selectedProblem.title}</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36 h-8 text-xs bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code editor area */}
            <div className="relative flex-1 overflow-auto">
              <div className="absolute inset-0 p-0 font-mono text-sm leading-6 overflow-auto" style={{ fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace" }}>
                <pre className="p-0 m-0">
                  <code className="text-[#d4d4d4]">
                    {highlightSyntax(code, language)}
                  </code>
                </pre>
              </div>
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-transparent caret-[#cccccc] font-mono text-sm leading-6 p-0 outline-none border-none overflow-auto"
                style={{ fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Consolas', monospace", WebkitTextFillColor: 'transparent', tabSize: 4 }}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                wrap="off"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hint Side Panel */}
      <motion.div
        initial={false}
        animate={{ width: showHint ? 320 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 overflow-hidden border-l bg-card"
      >
        <div className={cn("w-[320px] h-full flex flex-col", !showHint && "hidden")}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-sm">Hint</h3>
            </div>
            <button onClick={() => setShowHint(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 p-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
              <p className="text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
                {MOCK_HINTS[selectedProblem.id] || 'Think about using an efficient data structure to solve this problem optimally.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Chat Side Panel */}
      <motion.div
        initial={false}
        animate={{ width: showAiChat ? 360 : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex-shrink-0 overflow-hidden border-l bg-card"
      >
        <div className={cn("w-[360px] h-full flex flex-col", !showAiChat && "hidden")}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">AI Assistant</h3>
            </div>
            <button onClick={() => setShowAiChat(false)} className="text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {aiMessages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-xs text-muted-foreground">Ask me anything about this problem!</p>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t flex gap-2">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
              placeholder="Ask a question..."
              className="flex-1 h-9 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="icon" className="h-9 w-9 flex-shrink-0" onClick={handleAiSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Submission Results Modal */}
      {showResults && testResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowResults(false)}>
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Submission Results</h2>
                <Badge variant={passedCount === totalTests ? 'success' : 'destructive'} className="text-xs">
                  {passedCount === totalTests ? 'All Tests Passed' : `${passedCount}/${totalTests} Passed`}
                </Badge>
              </div>

              {/* Test Case Grid */}
              <div>
                <h4 className="text-sm font-medium mb-3">Test Cases</h4>
                <TestCaseGrid results={testResults} />
              </div>

              {/* Complexity & Quality */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Time</span>
                    <Badge variant="info" className="text-xs font-mono">{selectedProblem.optimalComplexity.time}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Space</span>
                    <Badge variant="info" className="text-xs font-mono">{selectedProblem.optimalComplexity.space}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quality</span>
                    <CircularGauge value={codeQuality} size={56} strokeWidth={6} />
                  </CardContent>
                </Card>
              </div>

              {/* AI Reviewer */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    AI Reviewer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Your solution follows the correct approach.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Consider adding input validation for edge cases like empty arrays.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Your variable naming is clear. Try extracting the core logic into a helper function for better readability.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
