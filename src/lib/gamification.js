import { supabase } from './supabase'
import toast from 'react-hot-toast'

// POINT VALUES
export const XP = {
  CREATE_POST: 10,
  LIKE_POST: 2,
  COMMENT: 5,
  DAILY_LOGIN: 3,
  DELETE_POST: -5,
}

// LEVEL THRESHOLDS
export const LEVELS = [
  { level: 1, name: 'Initiate',    minPoints: 0,    color: '#64748b', icon: '🔰' },
  { level: 2, name: 'Apprentice',  minPoints: 100,  color: '#00d4ff', icon: '⚡' },
  { level: 3, name: 'Adept',       minPoints: 300,  color: '#7c3aed', icon: '🔮' },
  { level: 4, name: 'Expert',      minPoints: 600,  color: '#00ff88', icon: '🌟' },
  { level: 5, name: 'Master',      minPoints: 1000, color: '#ffd60a', icon: '👑' },
  { level: 6, name: 'Grandmaster', minPoints: 2000, color: '#ff006e', icon: '🏆' },
]

export function getLevelInfo(points) {
  let current = LEVELS[0]
  let next = LEVELS[1]

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      current = LEVELS[i]
      next = LEVELS[i + 1] || null
      break
    }
  }

  const progress = next
    ? Math.min(100, Math.round(((points - current.minPoints) / (next.minPoints - current.minPoints)) * 100))
    : 100

  return { current, next, progress }
}

// BADGE DEFINITIONS
export const BADGE_DEFINITIONS = [
  {
    name: 'First Post',
    description: 'Published your first blog post',
    icon: '✍️',
    color: '#00d4ff',
    condition: 'posts_created >= 1',
    secret: false,
  },
  {
    name: 'Prolific Writer',
    description: 'Published 10 blog posts',
    icon: '📚',
    color: '#7c3aed',
    condition: 'posts_created >= 10',
    secret: false,
  },
  {
    name: 'Comment Master',
    description: 'Left 50 comments',
    icon: '💬',
    color: '#00ff88',
    condition: 'comments_made >= 50',
    secret: false,
  },
  {
    name: 'Popular Creator',
    description: 'Received 100 likes on your posts',
    icon: '🔥',
    color: '#ff006e',
    condition: 'likes_received >= 100',
    secret: false,
  },
  {
    name: 'Early Adopter',
    description: 'Joined the platform in its early days',
    icon: '🌅',
    color: '#ffd60a',
    condition: 'early_adopter',
    secret: false,
  },
  {
    name: 'XP Hunter',
    description: 'Earned 500 total XP',
    icon: '💎',
    color: '#00d4ff',
    condition: 'points >= 500',
    secret: false,
  },
  {
    name: 'Streak Master',
    description: 'Maintained a 7-day login streak',
    icon: '🔥',
    color: '#ff6b35',
    condition: 'login_streak >= 7',
    secret: false,
  },
  // Hidden/Secret Badges
  {
    name: 'Night Owl',
    description: 'Published a post after midnight',
    icon: '🦉',
    color: '#4a5568',
    condition: 'night_post',
    secret: true,
  },
  {
    name: 'Speed Writer',
    description: 'Published 3 posts in a single day',
    icon: '⚡',
    color: '#ffd60a',
    condition: 'posts_in_day >= 3',
    secret: true,
  },
]

// MISSION DEFINITIONS
export const MISSION_DEFINITIONS = [
  {
    id: 'create_3_posts',
    title: 'Content Creator',
    description: 'Create 3 blog posts',
    icon: '📝',
    target: 3,
    metric: 'posts_created',
    reward: 30,
    category: 'writing',
  },
  {
    id: 'write_5_comments',
    title: 'Community Voice',
    description: 'Write 5 comments on posts',
    icon: '💬',
    target: 5,
    metric: 'comments_made',
    reward: 20,
    category: 'social',
  },
  {
    id: 'get_10_likes',
    title: 'Rising Star',
    description: 'Receive 10 likes on your posts',
    icon: '❤️',
    target: 10,
    metric: 'likes_received',
    reward: 25,
    category: 'social',
  },
  {
    id: 'login_3_days',
    title: 'Regular Visitor',
    description: 'Log in 3 days in a row',
    icon: '📅',
    target: 3,
    metric: 'login_streak',
    reward: 15,
    category: 'activity',
  },
  {
    id: 'create_10_posts',
    title: 'Blog Veteran',
    description: 'Create 10 blog posts',
    icon: '🏆',
    target: 10,
    metric: 'posts_created',
    reward: 100,
    category: 'writing',
  },
  {
    id: 'reach_level_3',
    title: 'Power Up',
    description: 'Reach Level 3 (Adept)',
    icon: '🔮',
    target: 300,
    metric: 'points',
    reward: 50,
    category: 'progression',
  },
]

// AWARD XP
export async function awardXP(userId, amount, reason) {
  try {
    // Get current user stats
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('points, level, posts_created, comments_made, likes_received, login_streak')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    const newPoints = Math.max(0, (profile.points || 0) + amount)
    const { current: newLevel } = getLevelInfo(newPoints)
    const oldLevel = getLevelInfo(profile.points || 0).current

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        points: newPoints,
        level: newLevel.level,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) throw updateError

    // Check for level up
    if (newLevel.level > oldLevel.level) {
      toast.success(`🎉 LEVEL UP! You're now ${newLevel.name} ${newLevel.icon}`, {
        duration: 4000,
        style: {
          background: '#0d0d1a',
          color: '#ffd60a',
          border: '1px solid #ffd60a',
          fontFamily: 'Orbitron, monospace',
        },
      })
    }

    // Check missions and badges
    await checkAndAwardBadges(userId, { ...profile, points: newPoints })
    await checkMissions(userId, { ...profile, points: newPoints })

    return { newPoints, leveledUp: newLevel.level > oldLevel.level, newLevel }
  } catch (err) {
    console.error('Error awarding XP:', err)
    return null
  }
}

// CHECK BADGES
export async function checkAndAwardBadges(userId, stats) {
  try {
    // Get existing user badges
    const { data: existingBadges } = await supabase
      .from('user_badges')
      .select('badge_id, badges(name)')
      .eq('user_id', userId)

    const earnedBadgeNames = new Set((existingBadges || []).map(ub => ub.badges?.name))

    // Get all badge definitions from DB
    const { data: allBadges } = await supabase
      .from('badges')
      .select('*')

    if (!allBadges) return

    for (const badge of allBadges) {
      if (earnedBadgeNames.has(badge.name)) continue

      let earned = false

      switch (badge.name) {
        case 'First Post':        earned = (stats.posts_created || 0) >= 1; break
        case 'Prolific Writer':   earned = (stats.posts_created || 0) >= 10; break
        case 'Comment Master':    earned = (stats.comments_made || 0) >= 50; break
        case 'Popular Creator':   earned = (stats.likes_received || 0) >= 100; break
        case 'XP Hunter':         earned = (stats.points || 0) >= 500; break
        case 'Streak Master':     earned = (stats.login_streak || 0) >= 7; break
        case 'Early Adopter':     earned = true; break
        default:                  break
      }

      if (earned) {
        await supabase.from('user_badges').insert({ user_id: userId, badge_id: badge.id })
        toast.success(`🏅 Badge Unlocked: "${badge.name}"!`, {
          duration: 5000,
          style: {
            background: '#0d0d1a',
            color: '#ffd60a',
            border: '1px solid rgba(124,58,237,0.6)',
            fontFamily: 'Orbitron, monospace',
          },
        })
      }
    }
  } catch (err) {
    console.error('Error checking badges:', err)
  }
}

// CHECK MISSIONS
export async function checkMissions(userId, stats) {
  try {
    const { data: userMissions } = await supabase
      .from('user_missions')
      .select('*')
      .eq('user_id', userId)

    const completedIds = new Set((userMissions || []).filter(m => m.completed).map(m => m.mission_id))

    for (const mission of MISSION_DEFINITIONS) {
      if (completedIds.has(mission.id)) continue

      const current = stats[mission.metric] || 0
      const progress = Math.min(current, mission.target)
      const isComplete = current >= mission.target

      // Upsert mission progress
      await supabase.from('user_missions').upsert({
        user_id: userId,
        mission_id: mission.id,
        progress,
        completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,mission_id' })

      if (isComplete) {
        // Award bonus XP directly (avoid recursion)
        await supabase.rpc('increment_points', { uid: userId, amount: mission.reward })
        toast.success(`🎯 Mission Complete: "${mission.title}" +${mission.reward} XP!`, {
          duration: 5000,
          style: {
            background: '#0d0d1a',
            color: '#00ff88',
            border: '1px solid rgba(0,255,136,0.4)',
            fontFamily: 'Orbitron, monospace',
          },
        })
      }
    }
  } catch (err) {
    console.error('Error checking missions:', err)
  }
}

// DAILY LOGIN
export async function processDailyLogin(userId) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data: profile } = await supabase
      .from('profiles')
      .select('last_login_date, login_streak')
      .eq('id', userId)
      .single()

    if (!profile) return

    if (profile.last_login_date === today) return // Already logged in today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const newStreak = profile.last_login_date === yesterdayStr
      ? (profile.login_streak || 0) + 1
      : 1

    await supabase.from('profiles').update({
      last_login_date: today,
      login_streak: newStreak,
    }).eq('id', userId)

    await awardXP(userId, XP.DAILY_LOGIN, 'Daily login bonus')

    toast.success(`🌅 Daily Login! +${XP.DAILY_LOGIN} XP | Streak: ${newStreak} 🔥`, {
      duration: 3000,
      style: {
        background: '#0d0d1a',
        color: '#00d4ff',
        border: '1px solid rgba(0,212,255,0.3)',
        fontFamily: 'Orbitron, monospace',
      },
    })
  } catch (err) {
    console.error('Error processing daily login:', err)
  }
}
