import { mockStudents } from '@/data/mockData'
import type { SimulationScenario } from '@/data/mockData'

export interface PlacementProfile {
  readinessScore: number;
  dsaScore: number;
  resumeScore: number;
  interviewScore: number;
  aptitudeScore: number;
  projectsScore: number;
  communicationScore: number;
}

export interface PlacementProbability {
  service: number;
  midProduct: number;
  topProduct: number;
  faang: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export function getCurrentProfile(): PlacementProfile {
  const student = mockStudents[3]
  return {
    readinessScore: student.placementScore.overall,
    dsaScore: student.placementScore.dsa,
    resumeScore: student.placementScore.resume,
    interviewScore: student.placementScore.coreSubjects,
    aptitudeScore: student.placementScore.aptitude,
    projectsScore: 55,
    communicationScore: student.placementScore.communication,
  }
}

export function getPlacementProbability(profile: PlacementProfile): PlacementProbability {
  const base = profile.readinessScore
  return {
    service: Math.min(98, Math.round(base * 0.95 + 10)),
    midProduct: Math.min(95, Math.round(base * 0.82 + 5)),
    topProduct: Math.min(90, Math.round(base * 0.65)),
    faang: Math.min(85, Math.round(base * 0.48 - 5)),
  }
}

export function applyScenario(
  profile: PlacementProfile,
  scenario: SimulationScenario
): PlacementProfile {
  return {
    readinessScore: Math.min(100, scenario.impact.readiness.to),
    dsaScore: Math.min(100, profile.dsaScore + (scenario.impact.dsa ?? 0)),
    resumeScore: Math.min(100, profile.resumeScore + (scenario.impact.resume ?? 0)),
    interviewScore: Math.min(100, profile.interviewScore + (scenario.impact.interview ?? 0)),
    aptitudeScore: Math.min(100, profile.aptitudeScore + (scenario.impact.aptitude ?? 0)),
    projectsScore: Math.min(100, profile.projectsScore + (scenario.impact.projects ?? 0)),
    communicationScore: Math.min(100, profile.communicationScore + (scenario.impact.communication ?? 0)),
  }
}

export function getProbabilityAfterScenario(
  profile: PlacementProfile,
  scenario: SimulationScenario
): PlacementProbability {
  const projected = applyScenario(profile, scenario)
  return getPlacementProbability(projected)
}

export function getRecommendations(profile: PlacementProfile): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (profile.dsaScore < 70) {
    recommendations.push({
      id: "rec-1",
      title: "Strengthen DSA Fundamentals",
      description: "Focus on arrays, strings, trees, and dynamic programming. Solve at least 3 problems daily.",
      impact: `Expected: +${Math.round((70 - profile.dsaScore) * 0.4)}% readiness`,
      category: "DSA",
      priority: profile.dsaScore < 50 ? 'high' : 'medium',
    })
  }

  if (profile.resumeScore < 70) {
    recommendations.push({
      id: "rec-2",
      title: "Optimize Your Resume",
      description: "Improve ATS score by adding industry keywords, quantifying achievements, and fixing formatting.",
      impact: `Expected: +${Math.round((70 - profile.resumeScore) * 0.3)}% readiness`,
      category: "Resume",
      priority: profile.resumeScore < 50 ? 'high' : 'medium',
    })
  }

  if (profile.interviewScore < 65) {
    recommendations.push({
      id: "rec-3",
      title: "Practice Mock Interviews",
      description: "Complete at least 5 mock interviews focusing on technical and HR rounds.",
      impact: `Expected: +${Math.round((65 - profile.interviewScore) * 0.5)}% readiness`,
      category: "Interview",
      priority: profile.interviewScore < 50 ? 'high' : 'medium',
    })
  }

  if (profile.communicationScore < 70) {
    recommendations.push({
      id: "rec-4",
      title: "Improve Communication Skills",
      description: "Practice structuring answers using STAR method and reduce filler words.",
      impact: `Expected: +${Math.round((70 - profile.communicationScore) * 0.3)}% readiness`,
      category: "Communication",
      priority: 'medium',
    })
  }

  if (profile.aptitudeScore < 70) {
    recommendations.push({
      id: "rec-5",
      title: "Practice Aptitude & Logical Reasoning",
      description: "Dedicate 30 minutes daily to quantitative aptitude, logical reasoning, and verbal ability.",
      impact: `Expected: +${Math.round((70 - profile.aptitudeScore) * 0.25)}% readiness`,
      category: "Aptitude",
      priority: profile.aptitudeScore < 50 ? 'high' : 'low',
    })
  }

  if (profile.projectsScore < 60) {
    recommendations.push({
      id: "rec-6",
      title: "Build Industry-Level Projects",
      description: "Create 1-2 full-stack projects demonstrating scalability, system design, and modern tech stack.",
      impact: `Expected: +${Math.round((60 - profile.projectsScore) * 0.35)}% readiness`,
      category: "Projects",
      priority: 'medium',
    })
  }

  recommendations.push({
    id: "rec-7",
    title: "Complete System Design Module",
    description: "Learn distributed systems concepts, scalability patterns, and practice designing large-scale systems.",
    impact: "Expected: +8% readiness",
    category: "System Design",
    priority: 'medium',
  })

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
