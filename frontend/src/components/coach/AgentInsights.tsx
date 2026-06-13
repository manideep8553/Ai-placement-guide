import { motion } from 'framer-motion'
import { Lightbulb, Activity, Clock, TrendingUp, Bot } from 'lucide-react'
import type { Agent } from '@/data/mockData'

interface AgentInsightsProps {
  agent: Agent;
}

const insightMap: Record<string, { recommendations: string[]; insights: string[]; recentActivity: string[] }> = {
  "agent-1": {
    recommendations: [
      "Add cloud certifications to boost ATS score by 15%",
      "Include quantifiable achievements in experience section",
      "Optimize your summary with role-specific keywords",
    ],
    insights: [
      "Your resume scores highest in education (88%)",
      "Missing 12 keywords common in your target roles",
      "ATS compatibility has improved 5% this month",
    ],
    recentActivity: [
      "Resume analyzed 3 days ago",
      "ATS score: 74/100",
      "Keywords suggested: 8 new terms",
    ],
  },
  "agent-2": {
    recommendations: [
      "Focus on Dynamic Programming and Graphs next",
      "Complete 50 more problems for Amazon readiness",
      "Practice system design for senior roles",
    ],
    insights: [
      "Strongest in Arrays & Linked Lists (85%)",
      "DP & Graphs need most improvement (45%)",
      "Consistency score: 72% - good but can improve",
    ],
    recentActivity: [
      "DSA analysis completed yesterday",
      "LeetCode problems solved: 145",
      "Study plan created for Amazon",
    ],
  },
  "agent-3": {
    recommendations: [
      "Practice STAR method for behavioral questions",
      "Reduce filler words through daily exercises",
      "Record and review your mock interviews",
    ],
    insights: [
      "Communication clarity improved 8% last session",
      "Filler word frequency: 15 per session (target: <5)",
      "Optimal speaking pace: 120-150 WPM",
    ],
    recentActivity: [
      "Interview reviewed: Technical round",
      "Confidence score: 72%",
      "3 mock interviews completed this month",
    ],
  },
  "agent-4": {
    recommendations: [
      "Increase daily study time to 4 hours",
      "Add system design to your weekly schedule",
      "Focus on weak areas before strong ones",
    ],
    insights: [
      "Current roadmap completion: 68%",
      "Optimal study ratio: 40% DSA, 20% System Design",
      "Projected completion date: September 2026",
    ],
    recentActivity: [
      "Weekly plan generated for next week",
      "Progress optimized: +12% efficiency",
      "Learning path adjusted for target company",
    ],
  },
  "agent-5": {
    recommendations: [
      "Target service companies first (88-95% chance)",
      "Improve DSA for product companies (currently 28%)",
      "Build cloud projects for FAANG readiness",
    ],
    insights: [
      "Best placement probability: Service companies",
      "Biggest gap for FAANG: System Design & DSA",
      "Resume screening pass rate: 74%",
    ],
    recentActivity: [
      "Placement probability calculated",
      "Resume screening simulation completed",
      "Recruiter feedback report generated",
    ],
  },
}

export default function AgentInsights({ agent }: AgentInsightsProps) {
  const data = insightMap[agent.id] || insightMap["agent-1"]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-medium text-white">Insights & Activity</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">Recommendations</span>
          </div>
          <div className="space-y-1.5">
            {data.recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{rec}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-400">Key Insights</span>
          </div>
          <div className="space-y-1.5">
            {data.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-2 text-xs text-gray-300"
              >
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{insight}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium text-gray-400">Recent Activity</span>
          </div>
          <div className="space-y-1.5">
            {data.recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-xs text-gray-500"
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span>{activity}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
