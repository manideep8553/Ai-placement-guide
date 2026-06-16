import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Code2, FileText, Mic, Map, Building2, Brain, Sparkles } from 'lucide-react'
import type { Agent } from '@/data/mockData'

interface AgentCardProps {
  agent: Agent;
  index: number;
  onClick: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  FileText, Code2, Mic, Map, Building2,
}

export default function AgentCard({ agent, index, onClick }: AgentCardProps) {
  const Icon = iconMap[agent.icon] || Brain

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className="group text-left w-full"
    >
      <div className={cn(
        "rounded-2xl bg-gradient-to-br border p-5 backdrop-blur-xl transition-all duration-300 cursor-pointer h-full",
        agent.gradient, agent.border,
        "hover:shadow-lg hover:scale-[1.02]"
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            agent.icon === 'FileText' ? 'bg-indigo-500/20 text-indigo-400' :
            agent.icon === 'Code2' ? 'bg-emerald-500/20 text-emerald-400' :
            agent.icon === 'Mic' ? 'bg-amber-500/20 text-amber-400' :
            agent.icon === 'Map' ? 'bg-cyan-500/20 text-cyan-400' :
            'bg-violet-500/20 text-violet-400'
          )}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          <Badge className="bg-white/5 text-gray-400 border-[#334155] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-3 h-3 mr-1" /> Click to open
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">{agent.name}</h3>
        <p className="text-xs text-indigo-400 mb-2">{agent.title}</p>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.description}</p>

        <div className="flex flex-wrap gap-1.5">
          {agent.functions.map(fn => (
            <span key={fn} className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium border",
              agent.icon === 'FileText' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
              agent.icon === 'Code2' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              agent.icon === 'Mic' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              agent.icon === 'Map' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
              'bg-violet-500/10 text-violet-400 border-violet-500/20'
            )}>
              {fn}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}
