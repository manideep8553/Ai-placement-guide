import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Agent } from '@/data/mockData'

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

interface AgentChatProps {
  agent: Agent;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isStreaming: boolean;
}

const mockAgentName: Record<string, string> = {
  "agent-1": "Resume Agent",
  "agent-2": "Coding Agent",
  "agent-3": "Interview Agent",
  "agent-4": "Roadmap Agent",
  "agent-5": "Recruiter Agent",
}

export default function AgentChat({ agent, messages, onSendMessage, isStreaming }: AgentChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isStreaming) return
    onSendMessage(input.trim())
    setInput('')
  }

  const handleSuggestedPrompt = (prompt: string) => {
    if (isStreaming) return
    onSendMessage(prompt)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
              agent.icon === 'FileText' ? 'bg-indigo-500/20' :
              agent.icon === 'Code2' ? 'bg-emerald-500/20' :
              agent.icon === 'Mic' ? 'bg-amber-500/20' :
              agent.icon === 'Map' ? 'bg-cyan-500/20' : 'bg-violet-500/20'
            )}>
              <Bot className={cn(
                "w-8 h-8",
                agent.icon === 'FileText' ? 'text-indigo-400' :
                agent.icon === 'Code2' ? 'text-emerald-400' :
                agent.icon === 'Mic' ? 'text-amber-400' :
                agent.icon === 'Map' ? 'text-cyan-400' : 'text-violet-400'
              )} />
            </div>
            <h3 className="text-white font-medium mb-1">{mockAgentName[agent.id] || agent.name}</h3>
            <p className="text-sm text-gray-400 mb-4 max-w-sm">{agent.description}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {agent.suggestedPrompts.slice(0, 2).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#1E293B] border border-[#334155] text-gray-300 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'agent' && (
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                  agent.icon === 'FileText' ? 'bg-indigo-500/20' :
                  agent.icon === 'Code2' ? 'bg-emerald-500/20' :
                  agent.icon === 'Mic' ? 'bg-amber-500/20' :
                  agent.icon === 'Map' ? 'bg-cyan-500/20' : 'bg-violet-500/20'
                )}>
                  <Bot className={cn(
                    "w-4 h-4",
                    agent.icon === 'FileText' ? 'text-indigo-400' :
                    agent.icon === 'Code2' ? 'text-emerald-400' :
                    agent.icon === 'Mic' ? 'text-amber-400' :
                    agent.icon === 'Map' ? 'text-cyan-400' : 'text-violet-400'
                  )} />
                </div>
              )}
              <div className={cn(
                "max-w-[88%] sm:max-w-[80%] rounded-xl p-3",
                msg.role === 'user'
                  ? 'bg-indigo-500/20 border border-indigo-500/20'
                  : 'bg-[#1E293B] border border-[#334155]'
              )}>
                <p className="text-sm text-gray-200 leading-relaxed">{msg.content}</p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
              )}
            </motion.div>
          ))
        )}

        {isStreaming && (
          <div className="flex gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              agent.icon === 'FileText' ? 'bg-indigo-500/20' :
              agent.icon === 'Code2' ? 'bg-emerald-500/20' :
              agent.icon === 'Mic' ? 'bg-amber-500/20' :
              agent.icon === 'Map' ? 'bg-cyan-500/20' : 'bg-violet-500/20'
            )}>
              <Loader2 className={cn(
                "w-4 h-4 animate-spin",
                agent.icon === 'FileText' ? 'text-indigo-400' :
                agent.icon === 'Code2' ? 'text-emerald-400' :
                agent.icon === 'Mic' ? 'text-amber-400' :
                agent.icon === 'Map' ? 'text-cyan-400' : 'text-violet-400'
              )} />
            </div>
            <div className="max-w-[80%] rounded-xl p-3 bg-[#1E293B] border border-[#334155]">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#334155]/50 p-3 sm:p-4">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[#1E293B] border border-[#334155] text-gray-400 hover:border-indigo-500/30 hover:text-indigo-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Input
            placeholder={`Ask ${agent.name}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isStreaming}
            className="flex-1 bg-[#1E293B] border-[#334155] text-sm text-gray-300 placeholder:text-gray-600 focus:border-indigo-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "w-11 h-11 sm:w-9 sm:h-9 rounded-lg flex shrink-0 items-center justify-center transition-all",
              input.trim() && !isStreaming
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-[#1E293B] text-gray-500'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
