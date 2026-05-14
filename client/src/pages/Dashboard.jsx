import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    mySkills: 0,
    receivedRequests: 0,
    sentRequests: 0,
    acceptedRequests: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [skillsRes, requestsRes] = await Promise.all([
        axios.get('/api/skills/my-skills'),
        axios.get('/api/requests')
      ])

      const skills = skillsRes.data
      const { sent, received } = requestsRes.data

      setStats({
        mySkills: skills.length,
        receivedRequests: received.filter(r => r.status === 'pending').length,
        sentRequests: sent.filter(r => r.status === 'pending').length,
        acceptedRequests: [...sent, ...received].filter(r => r.status === 'accepted').length
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <LayoutDashboard className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <p className="mt-4 text-slate-500 font-bold animate-pulse">Setting up your workspace...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-primary-600">{user.name}</span>!
            </h1>
            <p className="mt-3 text-lg text-slate-500 font-medium">
              Here's what's happening with your skill exchanges today.
            </p>
          </div>
          <Link to="/my-skills" className="btn-primary flex items-center space-x-2 shadow-xl shadow-primary-500/20">
            <Plus className="h-5 w-5" />
            <span>Post New Skill</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'My Skills', value: stats.mySkills, icon: Zap, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
            { label: 'Pending Received', value: stats.receivedRequests, icon: Clock, color: 'text-secondary-600', bg: 'bg-secondary-50', border: 'border-secondary-100' },
            { label: 'Pending Sent', value: stats.sentRequests, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
            { label: 'Accepted Exchanges', value: stats.acceptedRequests, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 border-white/40 shadow-xl group hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bg} ${stat.border} border rounded-2xl`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-extrabold text-slate-900">{stat.value}</p>
                <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color.replace('text', 'bg')} w-[60%]`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 border-white/40 shadow-xl h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center space-x-3">
                <div className="w-2 h-8 bg-primary-600 rounded-full"></div>
                <span>Quick Actions</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/my-skills" className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-300">
                  <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Manage My Skills</h3>
                  <p className="text-slate-500 font-medium mb-4">Update your offerings or add new expertise to share.</p>
                  <div className="flex items-center text-primary-600 font-bold space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>Go to My Skills</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                <Link to="/skills" className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-300">
                  <div className="w-12 h-12 bg-secondary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-secondary-500/20 group-hover:scale-110 transition-transform">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Browse & Learn</h3>
                  <p className="text-slate-500 font-medium mb-4">Discover new skills and connect with other experts.</p>
                  <div className="flex items-center text-secondary-600 font-bold space-x-2 group-hover:translate-x-2 transition-transform">
                    <span>Explore Skills</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>

                <Link to="/requests" className="group p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-300 md:col-span-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">View Exchange Requests</h3>
                      <p className="text-slate-500 font-medium">You have <span className="text-amber-600 font-bold">{stats.receivedRequests} incoming</span> and <span className="text-amber-600 font-bold">{stats.sentRequests} outgoing</span> pending requests.</p>
                    </div>
                    <div className="flex items-center text-amber-600 font-bold space-x-2 group-hover:translate-x-2 transition-transform whitespace-nowrap">
                      <span>Manage Requests</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Tips / Getting Started */}
          <div className="glass-card p-8 border-white/40 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
              <Award className="h-6 w-6 text-primary-400" />
              <span>SkillSwap Pro Tips</span>
            </h2>
            
            <div className="space-y-6">
              {[
                { title: 'Optimize Your Profile', desc: 'Add a clear description and your levels to attract better matches.', icon: Zap },
                { title: 'Be Responsive', desc: 'Accepted requests lead to 3x more successful skill exchanges.', icon: Clock },
                { title: 'Share the Love', desc: 'The more skills you post, the more you rank in search results.', icon: LayoutDashboard }
              ].map((tip, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors duration-300">
                    <tip.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{tip.title}</h4>
                    <p className="text-slate-400 text-sm font-medium">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-2">Community Goal</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-white font-bold">128 Active Swaps</span>
                <span className="text-slate-400 text-xs">85% of target</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 w-[85%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

