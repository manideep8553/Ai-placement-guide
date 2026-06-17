import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/useStore'
import { getProfileApi, updateProfileApi, changePasswordApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  User, Lock, Bell, Palette, Shield, Save, Loader2, CheckCircle,
  AlertCircle, Eye, EyeOff, Moon, Sun, LogOut, Trash2
} from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuthStore()
  const { dark, toggleDark, emailNotifications, setEmailNotifications, pushNotifications, setPushNotifications, interviewReminders, setInterviewReminders, weeklyReport, setWeeklyReport } = useThemeStore()
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [college, setCollege] = useState(user?.college || '')
  const [branch, setBranch] = useState(user?.branch || '')
  const [graduationYear, setGraduationYear] = useState(user?.graduationYear?.toString() || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      setProfileLoading(true)
      const result = await getProfileApi()
      if (result.data?.user) {
        const u = result.data.user
        setName(u.name)
        setCollege(u.college || '')
        setBranch(u.branch || '')
        setGraduationYear(u.graduationYear?.toString() || '')
      }
      setProfileLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSaveProfile() {
    setLoading(true)
    setSaved(false)
    const data: Record<string, any> = { name }
    if (college) data.college = college
    if (branch) data.branch = branch
    if (graduationYear) data.graduationYear = parseInt(graduationYear)
    const result = await updateProfileApi(data as any)
    if (result.data?.user) {
      useAuthStore.setState({ user: result.data.user })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setLoading(false)
  }

  async function handleChangePassword() {
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    setPasswordLoading(true)
    const result = await changePasswordApi(currentPassword, newPassword)
    if (result.error) {
      setPasswordError(result.error)
    } else {
      setPasswordSuccess('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    }
    setPasswordLoading(false)
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences and profile</p>
      </motion.div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-[#1E293B]/50 border border-[#334155]/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg">
            <Lock className="w-4 h-4 mr-2" /> Password
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 rounded-lg">
            <Palette className="w-4 h-4 mr-2" /> Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#1E293B]/80 border-[#334155]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#0F172A]/60 border border-[#334155]/30">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-gray-300">College</Label>
                    <Input
                      id="college"
                      value={college}
                      onChange={e => setCollege(e.target.value)}
                      placeholder="e.g. VIT, BITS, IIT"
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="text-gray-300">Branch</Label>
                    <Input
                      id="branch"
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      placeholder="e.g. CSE, ECE, ISE"
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradYear" className="text-gray-300">Graduation Year</Label>
                    <Input
                      id="gradYear"
                      type="number"
                      value={graduationYear}
                      onChange={e => setGraduationYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white placeholder:text-gray-500 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                  {saved && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-sm text-emerald-400">
                      <CheckCircle className="w-4 h-4" /> Saved successfully
                    </motion.span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="password">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#1E293B]/80 border-[#334155]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update your account password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white pr-10 focus:ring-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="bg-[#0F172A]/60 border-[#334155]/50 text-white pr-10 focus:ring-indigo-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {passwordSuccess}
                  </div>
                )}

                <Button
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !currentPassword || !newPassword}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/20"
                >
                  {passwordLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> Update Password</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#1E293B]/80 border-[#334155]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choose what notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email', value: emailNotifications, set: setEmailNotifications },
                  { label: 'Push Notifications', desc: 'Receive push notifications on your device', value: pushNotifications, set: setPushNotifications },
                  { label: 'Interview Reminders', desc: 'Get reminded before scheduled mock interviews', value: interviewReminders, set: setInterviewReminders },
                  { label: 'Weekly Progress Report', desc: 'Receive a weekly summary of your progress', value: weeklyReport, set: setWeeklyReport },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A]/60 border border-[#334155]/30">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      checked={item.value}
                      onCheckedChange={item.set}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-[#1E293B]/80 border-[#334155]/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Customize the look and feel of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A]/60 border border-[#334155]/30">
                  <div className="flex items-center gap-3">
                    {dark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
                    <div>
                      <p className="text-sm font-medium text-white">Dark Mode</p>
                      <p className="text-xs text-gray-400 mt-0.5">Toggle between light and dark theme</p>
                    </div>
                  </div>
                  <Switch
                    checked={dark}
                    onCheckedChange={toggleDark}
                    className="data-[state=checked]:bg-indigo-500"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card className="bg-[#1E293B]/80 border-rose-500/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-rose-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Irreversible account actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">Sign Out</p>
                      <p className="text-xs text-gray-400 mt-0.5">Sign out from all devices</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      onClick={() => { logout() }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <div>
                      <p className="text-sm font-medium text-white">Delete Account</p>
                      <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      disabled
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
