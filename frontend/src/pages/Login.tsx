import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await login(email, password)
    if (result === 'EMAIL_NOT_FOUND') {
      setError('Email not found')
      setTimeout(() => navigate('/register'), 2000)
    } else if (result === 'INVALID_CREDENTIALS') {
      setError('Invalid password')
    } else if (result === 'NETWORK_ERROR') {
      setError('Network error. Please try again.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-dvh bg-[#0B1121] flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md bg-[#0F172A] border-[#1E293B]">
        <CardHeader className="text-center space-y-2 pb-6 sm:pb-8">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 mb-2">
            AI
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
          <CardDescription className="text-gray-400">Sign in to your PrepCoach account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
                {error === 'Email not found' && (
                  <Link to="/register" className="ml-auto text-indigo-400 hover:text-indigo-300 underline">
                    Register now
                  </Link>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#1E293B] border-0 text-gray-200 placeholder:text-gray-600 focus:ring-1 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-[#1E293B] border-0 text-gray-200 placeholder:text-gray-600 focus:ring-1 focus:ring-indigo-500/50"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
