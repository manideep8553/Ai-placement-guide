import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Save, Trash2, MessageSquare, Bot, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Agent } from '@/data/mockData'
import AgentChat from './AgentChat'
import AgentActions from './AgentActions'
import AgentInsights from './AgentInsights'

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentWorkspaceProps {
  agent: Agent;
  onBack: () => void;
}

const mockResponses: Record<string, string[]> = {
  "agent-1": [
    "I've analyzed your resume. Your ATS score is 74/100. The biggest gap is missing cloud computing keywords. I recommend adding Docker, Kubernetes, and AWS to your skills section.",
    "Based on the job description, you should emphasize your full-stack experience. Add keywords like: RESTful APIs, Microservices, CI/CD, and Agile methodology.",
    "I can help rewrite your experience section. Could you share your current bullet points and the roles you're targeting? I'll optimize them for better impact.",
  ],
  "agent-2": [
    "Based on your target company (Amazon), I recommend focusing on: Arrays & Strings, Trees, Dynamic Programming, and System Design. These cover 80% of Amazon's coding interview questions.",
    "Your DSA progress shows strength in arrays and linked lists. I suggest dedicating the next 2 weeks to Dynamic Programming and Graphs.",
    "Here's a LeetCode study plan: Week 1: Arrays & Hashing (15 problems), Week 2: Two Pointers & Sliding Window (10 problems), Week 3: Trees & Graphs (15 problems).",
  ],
  "agent-3": [
    "I've reviewed your mock interview. Your communication is clear but you use filler words ('umm' 8 times). Try pausing instead of using filler words.",
    "Your confidence score is 72%. To improve: practice the STAR method, record yourself, and do more mock interviews.",
    "For 'Tell me about yourself', try: 1) Current role (30%), 2) Key achievements (50%), 3) Why you're here (20%). Keep it under 90 seconds.",
  ],
  "agent-4": [
    "Here's your optimized weekly plan: Monday-Wednesday: DSA (2 hrs/day), Thursday: System Design (2 hrs), Friday: Mock Interview (1 hr) + Review (1 hr), Weekend: Projects (3 hrs/day).",
    "Your current progress is at 68%. To reach 85% in 4 weeks, increase daily study time from 3 to 4 hours and focus on weak areas.",
    "Based on your available time, I recommend: 40% DSA, 20% System Design, 20% Projects, 20% Mock Interviews per week.",
  ],
  "agent-5": [
    "In a recruiter screening, your resume would stand out for project experience but lack of cloud technologies might be a concern for top-tier companies.",
    "Your placement probability at service-based companies is excellent (88-95%). For product companies, strengthen your DSA and system design skills.",
    "As a recruiter, I look for: 1) Relevant experience, 2) Technical alignment, 3) Cultural fit, 4) Communication. Your project portfolio is your biggest strength.",
  ],
}

let responseIndex: Record<string, number> = {}

function getNextResponse(agentId: string): string {
  if (!responseIndex[agentId]) responseIndex[agentId] = 0
  const responses = mockResponses[agentId] || mockResponses["agent-1"]
  const response = responses[responseIndex[agentId] % responses.length]
  responseIndex[agentId]++
  return response
}

export default function AgentWorkspace({ agent, onBack }: AgentWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (!conversationId) {
      setConversationId(`conv-${Date.now()}`)
    }
  }, [conversationId])

  const handleSendMessage = useCallback((content: string) => {
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)

    setTimeout(() => {
      const agentMsg: Message = {
        id: `msg-${Date.now()}-response`,
        role: 'agent',
        content: getNextResponse(agent.id),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, agentMsg])
      setIsStreaming(false)
    }, 1500 + Math.random() * 1000)
  }, [agent.id])

  const handleAction = useCallback((action: string) => {
    handleSendMessage(`I'd like to use the ${action} feature. Can you help me with that?`)
  }, [handleSendMessage])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const chatData = {
      agent: agent.name,
      conversationId,
      date: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    }
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coach-${agent.id}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setMessages([])
    responseIndex[agent.id] = 0
  }

  const agentColors = agent.icon === 'FileText' ? {
    bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/20',
    gradient: 'from-indigo-500/10 via-transparent to-transparent',
    accent: 'indigo',
  } : agent.icon === 'Code2' ? {
    bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
    accent: 'emerald',
  } : agent.icon === 'Mic' ? {
    bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/20',
    gradient: 'from-amber-500/10 via-transparent to-transparent',
    accent: 'amber',
  } : agent.icon === 'Map' ? {
    bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/20',
    gradient: 'from-cyan-500/10 via-transparent to-transparent',
    accent: 'cyan',
  } : {
    bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/20',
    gradient: 'from-violet-500/10 via-transparent to-transparent',
    accent: 'violet',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", agentColors.bg)}>
            <Bot className={cn("w-5 h-5", agentColors.text)} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
            <p className="text-xs text-gray-400">{agent.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "p-2 rounded-lg transition-colors hidden lg:block",
              showInfo ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Info className="w-4 h-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="text-gray-400 hover:text-white"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={messages.length === 0}
            className="text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={messages.length === 0}
            className="text-gray-400 hover:text-rose-400"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-260px)]">
        <div className={cn(
          "hidden lg:flex flex-col w-64 shrink-0 rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 p-4 overflow-y-auto",
          showInfo ? '' : 'hidden'
        )}>
          <AgentActions agent={agent} onAction={handleAction} />
          <Separator className="my-4 bg-[#334155]/50" />
          <AgentInsights agent={agent} />
        </div>

        <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 overflow-hidden flex flex-col">
          <div className={cn("px-4 py-2 border-b border-[#334155]/50 bg-gradient-to-r", agentColors.gradient)}>
            <div className="flex items-center gap-2">
              <MessageSquare className={cn("w-4 h-4", agentColors.text)} />
              <span className="text-sm text-gray-300">Chat with {agent.name}</span>
              {messages.length > 0 && (
                <span className="text-xs text-gray-500 ml-auto">{messages.length} messages</span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <AgentChat
              agent={agent}
              messages={messages}
              onSendMessage={handleSendMessage}
              isStreaming={isStreaming}
            />
          </div>
        </div>

        <div className={cn(
          "hidden xl:flex flex-col w-72 shrink-0 rounded-2xl bg-gradient-to-br from-[#1E293B]/80 to-[#0F172A]/80 border border-[#334155]/50 overflow-y-auto",
        )}>
          <div className="p-4">
            <AgentInsights agent={agent} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
