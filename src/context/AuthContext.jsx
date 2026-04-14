import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { processDailyLogin } from '../lib/gamification'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const ensureProfile = useCallback(async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles').select('*').eq('id', authUser.id).single()

      if (data) { setProfile(data); return data }

      if (error?.code === 'PGRST116' || !data) {
        const username =
          authUser.user_metadata?.username ||
          authUser.email?.split('@')[0] ||
          `user_${authUser.id.slice(0, 6)}`

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id, email: authUser.email, username,
            points: 0, level: 1, posts_created: 0, comments_made: 0,
            likes_received: 0, login_streak: 0, last_login_date: null,
            created_at: new Date().toISOString(),
          })
          .select().single()

        if (insertError) {
          const { data: retry } = await supabase
            .from('profiles').select('*').eq('id', authUser.id).single()
          if (retry) { setProfile(retry); return retry }
          return null
        }
        setProfile(created)
        return created
      }
      return null
    } catch (err) {
      console.error('ensureProfile:', err)
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return null
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile(data)
      return data
    } catch (err) { return null }
  }, [user?.id])

  useEffect(() => {
    let mounted = true
    const safetyTimer = setTimeout(() => { if (mounted) setLoading(false) }, 6000)

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          const prof = await ensureProfile(session.user)
          if (prof) processDailyLogin(session.user.id).catch(console.error)
        }
      } catch (err) {
        console.error('initAuth error:', err)
        if (mounted) setAuthError(err.message)
      } finally {
        clearTimeout(safetyTimer)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (session?.user) {
          setUser(session.user)
          const prof = await ensureProfile(session.user)
          if (event === 'SIGNED_IN' && prof)
            processDailyLogin(session.user.id).catch(console.error)
        } else {
          setUser(null)
          setProfile(null)
        }
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [ensureProfile])

  const signUp = async (email, password, username) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { username } },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id, email, username,
          points: 0, level: 1, posts_created: 0, comments_made: 0,
          likes_received: 0, login_streak: 0, last_login_date: null,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id', ignoreDuplicates: true })
      }
      return { data, error: null }
    } catch (err) {
      setAuthError(err.message)
      return { data: null, error: err }
    }
  }

  const signIn = async (email, password) => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setAuthError(err.message)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
