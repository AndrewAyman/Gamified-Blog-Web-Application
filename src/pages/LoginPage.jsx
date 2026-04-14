import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) {
      toast.error(error.message || 'Login failed')
    } else {
      toast.success('Welcome back! 👋')
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 items-center justify-center mb-4 shadow-neon-cyan">
            <Zap className="w-8 h-8 text-cyber-cyan" />
          </div>
          <h1 className="font-display text-2xl font-bold neon-cyan tracking-widest">XPBLOG</h1>
          <p className="text-cyber-muted text-sm font-mono mt-1 tracking-wider">
            Level up your writing
          </p>
        </div>

        {/* Card */}
        <div className="cyber-card p-8">
          <h2 className="font-display text-lg font-bold text-cyber-text tracking-wider mb-6">
            ACCESS TERMINAL
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="operator@xpblog.io"
                className="cyber-input"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="cyber-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyber-cyan/30 border-t-cyber-cyan rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyber-border space-y-3 text-center">
            <Link
              to="/forgot-password"
              className="block text-cyber-muted text-sm hover:text-cyber-cyan transition-colors font-mono"
            >
              Forgot your password?
            </Link>
            <p className="text-cyber-muted text-sm font-body">
              No account?{' '}
              <Link to="/signup" className="text-cyber-cyan hover:text-cyber-cyan/80 font-mono transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* XP hint */}
        <div className="mt-4 text-center">
          <p className="text-cyber-muted text-xs font-mono">
            🎯 Daily login = +3 XP bonus
          </p>
        </div>
      </div>
    </div>
  )
}
