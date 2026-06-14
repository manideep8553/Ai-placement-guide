import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/store/useStore'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Building2, BarChart3, Mic, Code2, Map, FileText,
  Bell, Search, Menu, X, ChevronLeft, Moon, Sun, Settings, LogOut,
  ChevronDown
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/company-prep', icon: Building2, label: 'Company Prep' },
  { to: '/gap-analysis', icon: BarChart3, label: 'Gap Analysis' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
  { to: '/coding-interview', icon: Code2, label: 'AI Coding Interview' },
  { to: '/mock-interview', icon: Mic, label: 'Voice Mock Interview' },
  { to: '/roadmap', icon: Map, label: 'Dynamic Roadmap' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const { dark, toggleDark, sidebarOpen, setSidebarOpen } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="flex h-screen bg-[#0B1121] text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-[#1E293B] bg-[#0F172A] transition-all duration-300 relative z-30",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className={cn("flex items-center gap-3 h-16 px-4 border-b border-[#1E293B]", !sidebarOpen && "justify-center px-0")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-indigo-500/20">
            AI
          </div>
          {sidebarOpen && <span className="font-semibold text-base text-white tracking-tight">PrepCoach</span>}
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-[60px] w-6 h-6 rounded-full border border-[#1E293B] bg-[#0F172A] items-center justify-center text-gray-400 hover:text-white transition-colors z-20"
        >
          <ChevronLeft className={cn("w-3 h-3 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5",
                !sidebarOpen && "justify-center px-2"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.label === 'Dashboard' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn("p-3 border-t border-[#1E293B] mt-auto", !sidebarOpen && "flex justify-center")}>
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={cn("flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors", !sidebarOpen && "justify-center")}
            >
              <Avatar className="w-9 h-9 ring-2 ring-indigo-500/30">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-200 truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                </div>
              )}
              {sidebarOpen && <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </button>
            {showProfile && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[#1E293B] border border-[#334155] shadow-xl">
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => { logout(); navigate('/login'); setShowProfile(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-72 bg-[#0F172A] border-r border-[#1E293B] z-50">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  AI
                </div>
                <span className="font-semibold text-base text-white">PrepCoach</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1 mt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-[#1E293B] bg-[#0B1121]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search..."
                className="w-64 lg:w-80 pl-9 h-9 text-sm rounded-xl bg-[#1E293B] border-0 text-gray-300 placeholder:text-gray-600 focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0B1121]" />
            </button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              {dark ? <Moon className="w-5 h-5 text-gray-400" /> : <Sun className="w-5 h-5 text-gray-400" />}
            </button>
            <div className="ml-2 pl-2 border-l border-[#1E293B] flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-200">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-indigo-500/30">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
