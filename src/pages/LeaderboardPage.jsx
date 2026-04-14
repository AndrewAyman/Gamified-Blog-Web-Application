import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { getLevelInfo } from '../lib/gamification'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Trophy, TrendingUp, Flame, MessageCircle, PenSquare, Crown } from 'lucide-react'

const SORTS = [
  { id: 'points', label: 'XP', icon: Trophy },
  { id: 'posts_created', label: 'Posts', icon: PenSquare },
  { id: 'likes_received', label: 'Likes', icon: TrendingUp },
  { id: 'comments_made', label: 'Comments', icon: MessageCircle },
  { id: 'login_streak', label: 'Streak', icon: Flame },
]

const RANK_STYLE = {
  0: {
    medal: '🥇',
    gradient: 'from-yellow-500/20 to-amber-500/10',
    border: 'border-yellow-500/30',
    glow: '0 0 20px rgba(234,179,8,0.15)',
    nameColor: '#fbbf24',
  },
  1: {
    medal: '🥈',
    gradient: 'from-gray-400/20 to-slate-400/10',
    border: 'border-gray-400/30',
    glow: '0 0 15px rgba(156,163,175,0.1)',
    nameColor: '#9ca3af',
  },
  2: {
    medal: '🥉',
    gradient: 'from-orange-600/20 to-amber-800/10',
    border: 'border-orange-600/30',
    glow: '0 0 15px rgba(234,88,12,0.1)',
    nameColor: '#d97706',
  },
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('points')
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, username, points, level, posts_created, comments_made, likes_received, login_streak')
        .order(sort, { ascending: false })
        .limit(50)

      setUsers(data || [])

      if (user && data) {
        const rank = data.findIndex(u => u.id === user.id)
        setUserRank(rank >= 0 ? rank + 1 : null)
      }

      setLoading(false)
    }
    fetch()
  }, [sort, user])

  const sortConfig = SORTS.find(s => s.id === sort)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 items-center justify-center mb-3">
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-widest" style={{
          background: 'linear-gradient(135deg, #ffd60a, #ff6b35)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          LEADERBOARD
        </h1>
        <p className="text-cyber-muted text-sm font-mono mt-1">
          Top {users.length} writers ranked by {sortConfig?.label}
        </p>
      </div>

      {/* User's own rank */}
      {user && userRank && (
        <div className="cyber-card p-3 border-cyber-cyan/30 bg-cyber-cyan/5 flex items-center gap-3">
          <span className="text-cyber-cyan font-display text-sm font-bold">YOUR RANK</span>
          <span className="text-cyber-yellow font-mono font-bold text-lg">#{userRank}</span>
          <span className="text-cyber-muted text-xs font-mono ml-auto">
            Keep earning XP to climb higher!
          </span>
        </div>
      )}

      {/* Sort buttons */}
      <div className="flex gap-2 flex-wrap">
        {SORTS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSort(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display tracking-wider transition-all duration-200 border
              ${sort === id
                ? 'text-cyber-yellow bg-yellow-500/10 border-yellow-500/30'
                : 'text-cyber-muted border-cyber-border hover:text-cyber-text hover:border-cyber-border/60'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Loading rankings..." />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u, index) => {
            const rankStyle = RANK_STYLE[index]
            const { current: levelInfo } = getLevelInfo(u.points || 0)
            const isMe = u.id === user?.id

            return (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01]
                  bg-gradient-to-r
                  ${rankStyle ? `${rankStyle.gradient} ${rankStyle.border}` : 'bg-cyber-card border-cyber-border hover:border-cyber-border/60'}
                  ${isMe ? 'ring-1 ring-cyber-cyan/40' : ''}`}
                style={rankStyle ? { boxShadow: rankStyle.glow } : {}}
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {rankStyle ? (
                    <span className="text-2xl">{rankStyle.medal}</span>
                  ) : (
                    <span className="font-mono text-sm text-cyber-muted">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full border flex items-center justify-center font-bold flex-shrink-0 font-display"
                  style={rankStyle ? {
                    background: `${rankStyle.nameColor}20`,
                    borderColor: `${rankStyle.nameColor}40`,
                    color: rankStyle.nameColor,
                  } : {
                    background: 'rgba(0,212,255,0.1)',
                    borderColor: 'rgba(0,212,255,0.3)',
                    color: '#00d4ff',
                  }}
                >
                  {u.username?.[0]?.toUpperCase()}
                </div>

                {/* Name + level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-display text-sm font-bold truncate"
                      style={{ color: rankStyle?.nameColor || (isMe ? '#00d4ff' : undefined) }}
                    >
                      {u.username}
                      {isMe && <span className="ml-2 text-[10px] text-cyber-cyan font-mono">(you)</span>}
                    </span>
                    <span className="text-sm flex-shrink-0">{levelInfo.icon}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-cyber-muted text-[11px] font-mono">
                      {u.posts_created || 0} posts
                    </span>
                    <span className="text-cyber-muted text-[11px] font-mono">
                      {u.likes_received || 0} likes
                    </span>
                    {u.login_streak > 0 && (
                      <span className="text-orange-400 text-[11px] font-mono">
                        🔥 {u.login_streak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="font-mono text-base font-bold"
                    style={{ color: rankStyle?.nameColor || '#ffd60a' }}
                  >
                    {(u[sort] || 0).toLocaleString()}
                  </p>
                  <p className="text-cyber-muted text-[11px] font-mono">{sortConfig?.label}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
