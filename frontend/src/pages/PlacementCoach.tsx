import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { mockAgents } from '@/data/mockData'
import AgentCard from '@/components/coach/AgentCard'
import AgentWorkspace from '@/components/coach/AgentWorkspace'
import type { Agent } from '@/data/mockData'

export default function PlacementCoach() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  if (selectedAgent) {
    return (
      <div className="max-w-7xl mx-auto">
        <AgentWorkspace agent={selectedAgent} onBack={() => setSelectedAgent(null)} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Placement Coach</h1>
              <p className="text-sm text-gray-400">Your AI-powered placement preparation team</p>
            </div>
          </div>
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> 5 Agents Available
          </Badge>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-[#0F172A]/80 border border-indigo-500/10 p-4 sm:p-6"
      >
        <p className="text-sm text-gray-300 leading-relaxed">
          Your personal AI coaching team is ready. Each agent specializes in a different aspect of placement preparation.
          Click any agent to start a conversation, get expert advice, and accelerate your placement readiness.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {mockAgents.map((agent, i) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            index={i}
            onClick={() => setSelectedAgent(agent)}
          />
        ))}
      </div>
    </div>
  )
}
