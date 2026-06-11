import { Outlet, NavLink } from 'react-router-dom'
import { useThemeStore } from '@/store/useStore'
import {
  LayoutDashboard, Building2, BarChart3, Mic, Code2, Map, FileText,
  Bell, Search, Menu, X, ChevronLeft, Moon, Sun, Award
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/company-prep', icon: Building2, label: 'Company Prep' },
  { to: '/gap-analysis', icon: BarChart3, label: 'Gap Analysis' },
  { to: '/mock-interview', icon: Mic, label: 'Mock Interview' },
  { to: '/coding-interview', icon: Code2, label: 'Coding Interview' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/resume', icon: FileText, label: 'Resume Analyzer' },
]

export default function Layout() {
  const { dark, toggleDark, sidebarOpen, setSidebarOpen } = useThemeStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className={cn("flex items-center gap-3 p-4 border-b border-border", !sidebarOpen && "justify-center")}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
            AI
          </div>
          {sidebarOpen && <span className="font-semibold text-lg">PrepCoach</span>}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          <ChevronLeft className={cn("w-3 h-3 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                !sidebarOpen && "justify-center"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className={cn("p-3 border-t border-border", !sidebarOpen && "flex justify-center")}>
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">RK</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Rahul Kumar</p>
                <p className="text-xs text-muted-foreground truncate">rahul@college.edu</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-border z-50">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
                  AI
                </div>
                <span className="font-semibold text-lg">PrepCoach</span>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-64 lg:w-80 pl-9 h-9 text-sm rounded-xl bg-muted/50 border-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium">12 day streak</span>
            </Badge>
            <button className="relative p-2 rounded-xl hover:bg-accent transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="bg-primary/20 text-primary text-xs">RK</AvatarFallback>
            </Avatar>
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
