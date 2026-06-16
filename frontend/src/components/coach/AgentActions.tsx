import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ArrowRight, Bot } from 'lucide-react'
import type { Agent } from '@/data/mockData'

interface AgentActionsProps {
  agent: Agent;
  onAction: (action: string) => void;
}

const actionDescriptions: Record<string, string> = {
  'ATS Review': 'Analyze your resume against ATS requirements',
  'Resume Improvement': 'Get suggestions to enhance your resume',
  'Keyword Suggestions': 'Discover missing keywords for your target role',
  'Resume Rewrite': 'Rewrite your resume sections professionally',
  'DSA Analysis': 'Evaluate your DSA preparation level',
  'Coding Roadmaps': 'Get a personalized coding study plan',
  'LeetCode Planning': 'Plan your LeetCode practice schedule',
  'Topic Recommendations': 'Discover which topics to focus on',
  'Interview Review': 'Get feedback on your interview performance',
  'Confidence Analysis': 'Analyze and improve your confidence',
  'Communication Feedback': 'Improve your communication skills',
  'Weekly Plans': 'Generate weekly study plans',
  'Progress Optimization': 'Optimize your learning progress',
  'Learning Path Suggestions': 'Get personalized learning path',
  'Resume Screening': 'Simulate a recruiter resume screening',
  'Hiring Simulation': 'Run a complete hiring simulation',
  'Recruiter Feedback': 'Get feedback from a recruiter perspective',
  'Placement Probability Review': 'Review your placement chances',
}

const iconColors: Record<string, string> = {
  'FileText': 'from-indigo-500/20 to-purple-500/10 border-indigo-500/20',
  'Code2': 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20',
  'Mic': 'from-amber-500/20 to-orange-500/10 border-amber-500/20',
  'Map': 'from-cyan-500/20 to-blue-500/10 border-cyan-500/20',
  'Building2': 'from-violet-500/20 to-purple-500/10 border-violet-500/20',
}

export default function AgentActions({ agent, onAction }: AgentActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-medium text-white">Quick Actions</h3>
      </div>

      <div className="space-y-2">
        {agent.functions.map((fn, i) => (
          <motion.button
            key={fn}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onAction(fn)}
            className={cn(
              "w-full text-left p-3 rounded-xl bg-gradient-to-br border transition-all duration-200 group hover:shadow-md",
              iconColors[agent.icon] || 'from-[#1E293B]/50 to-[#0F172A]/80 border-[#334155]/50'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">{fn}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {actionDescriptions[fn] || `Execute ${fn.toLowerCase()}`}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
