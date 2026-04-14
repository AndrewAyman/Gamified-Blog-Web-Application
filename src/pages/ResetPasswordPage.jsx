import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  // Supabase sends the user here with a session already set in the URL hash
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setValidSession(!!session)
      setChecking(false)
    }
    checkSession()

    // Also listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidSession(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to reset password')
    } else {
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    }
  }

  // Strength indicator
  const strength = (() => {
    if (!password) return null
    if (password.length < 6) return { label: 'Too short', color: '#ff006e', w: '20%' }
    if (password.length < 8) return { label: 'Weak', color: '#ff6b35', w: '40%' }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: 'Medium', color: '#ffd60a', w: '65%' }
    return { label: 'Strong', color: '#00ff88', w: '100%' }
  })()

  if (checking) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyber-border border-t-cyber-cyan rounded-full animate-spin" />
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
        <div className="cyber-card p-8 max-w-sm w-full text-center space-y-4">
          <span className="text-4xl">🔗</span>
          <h2 className="font-display text-lg font-bold text-cyber-pink">LINK EXPIRED</h2>
          <p className="text-cyber-muted text-sm font-body">
            This reset link is invalid or has expired.<br />
            Please request a new one.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="btn-primary w-full py-2.5"
          >
            Request New Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cyber-purple/10 border border-cyber-purple/30 items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-cyber-purple" />
          </div>
          <h1 className="font-display text-2xl font-bold neon-purple tracking-widest">XPBLOG</h1>
        </div>

        <div className="cyber-card p-8">
          {!done ? (
            <>
              <div className="mb-6">
                <h2 className="font-display text-lg font-bold text-cyber-text tracking-wider">
                  NEW PASSWORD
                </h2>
                <p className="text-cyber-muted text-sm font-body mt-1">
                  Choose a strong password for your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="cyber-input pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {strength && (
                    <div className="space-y-1 mt-2">
                      <div className="h-1 rounded-full bg-cyber-border overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: strength.w, background: strength.color }}
                        />
                      </div>
                      <p className="text-xs font-mono" style={{ color: strength.color }}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                    Confirm Password
                  </label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    className={`cyber-input ${confirm && confirm !== password ? 'border-cyber-pink/60' : ''}`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-xs text-cyber-pink font-mono">Passwords don't match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="btn-secondary w-full flex items-center justify-center gap-2 py-3 mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/30 items-center justify-center">
                <CheckCircle className="w-8 h-8 text-cyber-green" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-cyber-green tracking-wider">
                  PASSWORD UPDATED!
                </h2>
                <p className="text-cyber-muted text-sm font-body mt-2">
                  Your password has been changed successfully.
                </p>
                <p className="text-cyber-muted text-xs font-mono mt-2 animate-pulse">
                  Redirecting to login...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
