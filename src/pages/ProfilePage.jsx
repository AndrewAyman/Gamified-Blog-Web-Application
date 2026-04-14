import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { BADGE_DEFINITIONS, MISSION_DEFINITIONS } from '../lib/gamification'
import LevelProgress from '../components/gamification/LevelProgress'
import BadgeCard from '../components/gamification/BadgeCard'
import MissionCard from '../components/gamification/MissionCard'
import PostCard from '../components/blog/PostCard'
import { PageLoader, SkeletonCard } from '../components/ui/LoadingSpinner'
import { Calendar, PenSquare, MessageCircle, Heart, Trophy, Flame } from 'lucide-react'
import { format } from 'date-fns'

const TABS = ['Posts', 'Badges', 'Missions']

export default function ProfilePage() {
  const { userId } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const isOwn = user?.id === userId

  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [allBadges, setAllBadges] = useState([])
  const [userMissions, setUserMissions] = useState([])
  const [tab, setTab] = useState('Posts')
  const [loading, setLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)

      const [profileRes, badgesRes, allBadgesRes, missionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_badges').select('badge_id, badges(*)').eq('user_id', userId),
        supabase.from('badges').select('*'),
        supabase.from('user_missions').select('*').eq('user_id', userId),
      ])

      setProfile(profileRes.data)
      setEarnedBadges(badgesRes.data || [])
      setAllBadges(allBadgesRes.data || [])
      setUserMissions(missionsRes.data || [])
      setLoading(false)
    }

    const fetchPosts = async () => {
      setPostsLoading(true)
      const { data } = await supabase
        .from('posts')
        .select(`*, profiles(username, points), likes(user_id)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setPosts((data || []).map(p => ({
        ...p,
        user_likes: (p.likes || []).map(l => l.user_id),
      })))
      setPostsLoading(false)
    }

    fetchAll()
    fetchPosts()
  }, [userId])

  useEffect(() => {
    if (isOwn) setProfile(myProfile)
  }, [myProfile, isOwn])

  const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badge_id))

  const enrichedBadges = allBadges.map(badge => ({
    ...badge,
    earned: earnedBadgeIds.has(badge.id),
  }))

  const handleLikeUpdate = (postId, newCount, liked) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p
      const newLikes = liked
        ? [...(p.user_likes || []), user?.id]
        : (p.user_likes || []).filter(id => id !== user?.id)
      return { ...p, likes_count: newCount, user_likes: newLikes }
    }))
  }

  const handleDelete = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
    refreshProfile()
  }

  if (loading) return <PageLoader />
  if (!profile) return (
    <div className="text-center py-20">
      <p className="text-cyber-muted font-mono">Profile not found</p>
    </div>
  )

  const STATS = [
    { label: 'Posts', value: profile.posts_created || 0, icon: PenSquare, color: '#00d4ff' },
    { label: 'Comments', value: profile.comments_made || 0, icon: MessageCircle, color: '#7c3aed' },
    { label: 'Likes Recv', value: profile.likes_received || 0, icon: Heart, color: '#ff006e' },
    { label: 'Day Streak', value: profile.login_streak || 0, icon: Flame, color: '#ff6b35' },
    { label: 'Badges', value: earnedBadges.length, icon: Trophy, color: '#ffd60a' },
    { label: 'Total XP', value: profile.points?.toLocaleString() || 0, icon: Trophy, color: '#00ff88' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="cyber-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border-2 border-cyber-border flex items-center justify-center text-3xl font-bold text-cyber-cyan font-display shadow-neon-cyan">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 text-lg">
              {profile.level === 5 ? '👑' : profile.level >= 4 ? '🌟' : profile.level >= 3 ? '🔮' : profile.level >= 2 ? '⚡' : '🔰'}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-cyber-text">
                  {profile.username}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-cyber-muted text-xs font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {format(new Date(profile.created_at || Date.now()), 'MMM yyyy')}
                  </span>
                  {profile.login_streak > 0 && (
                    <span className="text-xs font-mono text-orange-400">
                      🔥 {profile.login_streak} day streak
                    </span>
                  )}
                </div>
              </div>
              {isOwn && (
                <Link to="/create" className="btn-primary py-2 text-xs flex items-center gap-1.5">
                  <PenSquare className="w-3.5 h-3.5" />
                  New Post
                </Link>
              )}
            </div>

            <div className="mt-4 max-w-sm">
              <LevelProgress points={profile.points} />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6 pt-6 border-t border-cyber-border">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <div
                className="w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="font-mono text-sm font-bold text-cyber-text">{value}</p>
              <p className="text-cyber-muted text-[11px] font-body">{label}</p>
            </div>
          ))}
        </div>

        {/* Mini badges strip */}
        {earnedBadges.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-cyber-border">
            <span className="text-xs text-cyber-muted font-mono">Badges:</span>
            <div className="flex flex-wrap gap-1.5">
              {earnedBadges.slice(0, 8).map(eb => (
                <BadgeCard key={eb.badge_id} badge={eb.badges} earned small />
              ))}
              {earnedBadges.length > 8 && (
                <span className="text-xs text-cyber-muted font-mono self-center">
                  +{earnedBadges.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyber-border gap-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-display tracking-wider transition-all duration-200
              ${tab === t
                ? 'text-cyber-cyan border-b-2 border-cyber-cyan -mb-px'
                : 'text-cyber-muted hover:text-cyber-text'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'Posts' && (
        <div>
          {postsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="cyber-card p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-cyber-muted font-body text-sm">
                {isOwn ? "You haven't written any posts yet." : "No posts yet."}
              </p>
              {isOwn && (
                <Link to="/create" className="btn-primary inline-flex items-center gap-2 mt-4">
                  Write your first post
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDelete}
                  onLikeUpdate={handleLikeUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Badges' && (
        <div className="space-y-3">
          <p className="text-cyber-muted text-xs font-mono">
            {earnedBadges.length} / {enrichedBadges.length} badges earned
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enrichedBadges
              .sort((a, b) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0))
              .map(badge => (
                <BadgeCard key={badge.id} badge={badge} earned={badge.earned} />
              ))}
          </div>
        </div>
      )}

      {tab === 'Missions' && (
        <div className="space-y-3">
          <p className="text-cyber-muted text-xs font-mono">
            {userMissions.filter(m => m.completed).length} / {MISSION_DEFINITIONS.length} missions completed
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MISSION_DEFINITIONS.map(mission => {
              const progress = userMissions.find(m => m.mission_id === mission.id)
              return (
                <MissionCard key={mission.id} mission={mission} userProgress={progress} />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
