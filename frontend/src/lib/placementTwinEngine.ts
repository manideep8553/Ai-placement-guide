export interface SubScoreDetail {
  label: string
  value: number
  max: number
}

export interface SubScore {
  score: number
  details: SubScoreDetail[]
}

export interface CompanyEligibility {
  companyName: string
  chancePercent: number
  category: string
  missingSkills: string[]
  avgPackage: string
}

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: string
  category: string
  priority: 'high' | 'medium' | 'low'
}

export interface RoadmapItem {
  phase: string
  title: string
  tasks: string[]
  duration: string
}

export interface PlacementTwinData {
  readinessScore: number
  subScores: {
    dsa: SubScore
    resume: SubScore
    interview: SubScore
    aptitude: SubScore
    projects: SubScore
    communication: SubScore
    consistency: SubScore
  }
  companyEligibility: CompanyEligibility[]
  predictedPackage: { min: number; max: number; currency: string }
  interviewReadiness: { level: string; score: number }
  strengths: string[]
  weaknesses: string[]
  missingSkills: string[]
  recommendations: Recommendation[]
  improvementRoadmap: RoadmapItem[]
  lastUpdated: string
}

export interface ScenarioImpact {
  dsa?: number
  resume?: number
  interview?: number
  aptitude?: number
  projects?: number
  communication?: number
  consistency?: number
  readiness: { from: number; to: number }
}

export interface SimulationScenario {
  id: string
  title: string
  description: string
  icon: string
  impact: ScenarioImpact
}

export const mockSimulationScenarios: SimulationScenario[] = [
  {
    id: 'scenario-1',
    title: 'Complete 50 DSA Problems',
    description: 'Solve 50 additional DSA problems focusing on Medium/Hard difficulty across all topics.',
    icon: 'Code2',
    impact: { dsa: 12, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-2',
    title: 'Complete Dynamic Programming Track',
    description: 'Master DP concepts with 30+ problems from basic recursion to advanced DP patterns.',
    icon: 'Brain',
    impact: { dsa: 8, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-3',
    title: 'Improve Resume ATS Score',
    description: 'Optimize resume with industry keywords, quantified achievements, proper formatting.',
    icon: 'FileText',
    impact: { resume: 15, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-4',
    title: 'Finish System Design Module',
    description: 'Master distributed systems, scalability patterns, and system design interview prep.',
    icon: 'Server',
    impact: { interview: 10, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-5',
    title: 'Complete 5 Mock Interviews',
    description: 'Practice 5 full-length mock interviews covering technical, HR, and behavioral rounds.',
    icon: 'Mic',
    impact: { interview: 10, communication: 8, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-6',
    title: 'Build One Industry Project',
    description: 'Create a full-stack project with proper documentation, deployment, and GitHub README.',
    icon: 'Rocket',
    impact: { projects: 20, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-7',
    title: 'Improve Communication Skills',
    description: 'Practice STAR method, reduce filler words, improve speaking confidence and pace.',
    icon: 'MessageSquare',
    impact: { communication: 12, readiness: { from: 0, to: 0 } },
  },
  {
    id: 'scenario-8',
    title: 'Complete 10 Aptitude Tests',
    description: 'Practice timed aptitude tests covering quantitative, logical, and verbal sections.',
    icon: 'Target',
    impact: { aptitude: 14, readiness: { from: 0, to: 0 } },
  },
]

const WEIGHTS = {
  dsa: 0.25,
  resume: 0.15,
  interview: 0.15,
  aptitude: 0.10,
  projects: 0.10,
  communication: 0.10,
  consistency: 0.15,
}

export function applyScenarioProfile(profile: PlacementTwinData, scenario: SimulationScenario): PlacementTwinData {
  const clamp = (v: number) => Math.min(100, Math.max(0, v))

  const applySubScore = (sub: SubScore, boost: number | undefined): SubScore => {
    if (!boost) return sub
    return {
      score: clamp(sub.score + boost),
      details: sub.details,
    }
  }

  const newSubScores = {
    dsa: applySubScore(profile.subScores.dsa, scenario.impact.dsa),
    resume: applySubScore(profile.subScores.resume, scenario.impact.resume),
    interview: applySubScore(profile.subScores.interview, scenario.impact.interview),
    aptitude: applySubScore(profile.subScores.aptitude, scenario.impact.aptitude),
    projects: applySubScore(profile.subScores.projects, scenario.impact.projects),
    communication: applySubScore(profile.subScores.communication, scenario.impact.communication),
    consistency: applySubScore(profile.subScores.consistency, scenario.impact.consistency),
  }

  const s = newSubScores
  const newReadiness = Math.round(
    clamp(
      s.dsa.score * WEIGHTS.dsa +
      s.resume.score * WEIGHTS.resume +
      s.interview.score * WEIGHTS.interview +
      s.aptitude.score * WEIGHTS.aptitude +
      s.projects.score * WEIGHTS.projects +
      s.communication.score * WEIGHTS.communication +
      s.consistency.score * WEIGHTS.consistency,
    )
  )

  scenario.impact.readiness.from = profile.readinessScore
  scenario.impact.readiness.to = newReadiness

  return { ...profile, readinessScore: newReadiness, subScores: newSubScores }
}

export function getProjectedCompanyEligibility(
  profile: PlacementTwinData,
  scenario: SimulationScenario
): CompanyEligibility[] {
  const projected = applyScenarioProfile(profile, scenario)
  return projected.companyEligibility.map(c => ({
    ...c,
    chancePercent: Math.min(98, c.chancePercent + Math.round((projected.readinessScore - profile.readinessScore) * 0.3)),
  }))
}
