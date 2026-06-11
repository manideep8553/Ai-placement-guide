import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import CompanyPrep from './pages/CompanyPrep'
import GapAnalysis from './pages/GapAnalysis'
import MockInterview from './pages/MockInterview'
import CodingInterview from './pages/CodingInterview'
import Roadmap from './pages/Roadmap'
import Resume from './pages/Resume'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/company-prep" element={<CompanyPrep />} />
        <Route path="/gap-analysis" element={<GapAnalysis />} />
        <Route path="/mock-interview" element={<MockInterview />} />
        <Route path="/coding-interview" element={<CodingInterview />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/resume" element={<Resume />} />
      </Route>
    </Routes>
  )
}

export default App
