import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Dashboard from './pages/Dashboard'
import CompanyPrep from './pages/CompanyPrep'
import GapAnalysis from './pages/GapAnalysis'
import MockInterview from './pages/MockInterview'
import CodingInterview from './pages/CodingInterview'
import CodingHistory from './pages/CodingHistory'
import Roadmap from './pages/Roadmap'
import Resume from './pages/Resume'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import PlacementTwin from './pages/PlacementTwin'
import PlacementCoach from './pages/PlacementCoach'
import AssessmentList from './pages/AssessmentList'
import AssessmentPlayer from './pages/AssessmentPlayer'
import AssessmentResults from './pages/AssessmentResults'
import AssessmentDashboard from './pages/AssessmentDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
        <Route path="/gap-analysis" element={<ProtectedRoute><GapAnalysis /></ProtectedRoute>} />
        <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/coding-interview" element={<ProtectedRoute><CodingInterview /></ProtectedRoute>} />
        <Route path="/coding-history" element={<ProtectedRoute><CodingHistory /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/placement-twin" element={<ProtectedRoute><PlacementTwin /></ProtectedRoute>} />
        <Route path="/placement-coach" element={<ProtectedRoute><PlacementCoach /></ProtectedRoute>} />
        <Route path="/assessments" element={<ProtectedRoute><AssessmentList /></ProtectedRoute>} />
        <Route path="/assessment/:id" element={<ProtectedRoute><AssessmentPlayer /></ProtectedRoute>} />
        <Route path="/assessment-results/:attemptId" element={<ProtectedRoute><AssessmentResults /></ProtectedRoute>} />
        <Route path="/assessment-dashboard" element={<ProtectedRoute><AssessmentDashboard /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}

export default App
