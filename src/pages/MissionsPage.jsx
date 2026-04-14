import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { MISSION_DEFINITIONS } from '../lib/gamification'
import MissionCard from '../components/gamification/MissionCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Target, CheckCircle, Clock, Award } from 'lucide-react'

const CATEGORIES = ['all', 'writing', 'social', 'activity', 'progression']

export default function MissionsPage() {
  const { user } = useAuth()
  const [userMissions, setUserMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', user.id)

      setUserMissions(data || [])
      setLoading(false)
    }
    fetch()
  }, [user.id])

  const completed = userMissions.filter(m => m.completed).length
  const total = MISSION_DEFINITIONS.length
  const totalBonusXP = MISSION_DEFINITIONS.reduce((sum, m) => sum + m.reward, 0)
  const earnedXP = MISSION_DEFINITIONS
    .filter(m => userMissions.find(um => um.mission_id === m.id && um.completed))
    .reduce((sum, m) => sum + m.reward, 0)

  const filtered = MISSION_DEFINITIONS.filter(m =>
    activeCategory === 'all' || m.category === activeCategory
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Target className="w-6 h-6 text-cyber-cyan" />
              <h1 className="font-display text-2xl font-bold text-cyber-text tracking-wider">
                MISSIONS
              </h1>
            </div>
            <p className="text-cyber-muted text-sm font-body">
              Complete challenges to earn bonus XP and level up faster
            </p>
          </div>

          <div className="text-right">
            <p className="font-display text-2xl font-bold text-cyber-yellow">
              {earnedXP} <span className="text-sm text-cyber-muted">/ {totalBonusXP} XP</span>
            </p>
            <p className="text-cyber-muted text-xs font-mono">bonus earned</p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-cyber-muted">{completed} / {total} completed</span>
            <span className="text-cyber-cyan">{Math.round((completed / total) * 100)}%</span>
          </div>
          <div className="progress-bar h-3">
            <div
              className="progress-fill"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { icon: CheckCircle, label: 'Complete', value: completed, color: '#00ff88' },
            { icon: Clock, label: 'In Progress', value: total - completed, color: '#00d4ff' },
            { icon: Award, label: 'XP Available', value: totalBonusXP - earnedXP, color: '#ffd60a' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-cyber-surface rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
              <p className="font-mono text-sm font-bold" style={{ color }}>{value}</p>
              <p className="text-cyber-muted text-xs font-body">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-display tracking-wider capitalize transition-all duration-200 border
              ${activeCategory === cat
                ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan'
                : 'border-cyber-border text-cyber-muted hover:text-cyber-text hover:border-cyber-border/60'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Missions grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Loading missions..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered
            .sort((a, b) => {
              const aComp = userMissions.find(m => m.mission_id === a.id)?.completed
              const bComp = userMissions.find(m => m.mission_id === b.id)?.completed
              if (aComp && !bComp) return 1
              if (!aComp && bComp) return -1
              return 0
            })
            .map(mission => {
              const progress = userMissions.find(m => m.mission_id === mission.id)
              return (
                <MissionCard key={mission.id} mission={mission} userProgress={progress} />
              )
            })}
        </div>
      )}
    </div>
  )
}
