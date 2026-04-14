import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    if (!form.username.trim()) return 'Username is required'
    if (form.username.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return 'Username: letters, numbers & underscores only'
    if (!form.email) return 'Email is required'
    if (!form.password) return 'Password is required'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    if (form.password !== form.confirm) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { toast.error(err); return }
    setLoading(true)
    const { data, error } = await signUp(form.email, form.password, form.username)
    setLoading(false)
    if (error) {
      toast.error(error.message || 'Sign up failed')
    } else {
      toast.success('🎉 Account created! Check your email to verify.')
      navigate('/login')
    }
  }

  const XP_PERKS = [
    { icon: '✍️', text: '+10 XP per post' },
    { icon: '💬', text: '+5 XP per comment' },
    { icon: '❤️', text: '+2 XP per like' },
    { icon: '🌅', text: '+3 XP daily login' },
  ]

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6 animate-fade-in-up">
        {/* Left: Form */}
        <div>
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 rounded-xl bg-cyber-purple/10 border border-cyber-purple/30 items-center justify-center mb-3 shadow-neon-purple">
              <Zap className="w-7 h-7 text-cyber-purple" />
            </div>
            <h1 className="font-display text-xl font-bold neon-purple tracking-widest">JOIN XPBLOG</h1>
            <p className="text-cyber-muted text-xs font-mono mt-1">Start your journey</p>
          </div>

          <div className="cyber-card p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { id: 'username', label: 'Username', type: 'text', placeholder: 'cyber_writer', auto: 'username' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'you@xpblog.io', auto: 'email' },
              ].map(({ id, label, type, placeholder, auto }) => (
                <div key={id} className="space-y-1.5">
                  <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">{label}</label>
                  <input
                    type={type}
                    value={form[id]}
                    onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
                    placeholder={placeholder}
                    className="cyber-input"
                    autoComplete={auto}
                  />
                </div>
              ))}

              {['password', 'confirm'].map((field) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                    {field === 'password' ? 'Password' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form[field]}
                      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      placeholder="••••••••"
                      className="cyber-input pr-10"
                      autoComplete={field === 'password' ? 'new-password' : 'new-password'}
                    />
                    {field === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-3 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-cyber-border text-center">
              <p className="text-cyber-muted text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-cyber-purple hover:text-cyber-purple/80 font-mono transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: XP info */}
        <div className="hidden md:flex flex-col justify-center space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold text-cyber-text mb-2">
              🎮 Level Up Your Writing
            </h2>
            <p className="text-cyber-muted text-sm font-body leading-relaxed">
              XP Blog turns blogging into an RPG. Write posts, earn XP, unlock badges,
              and climb the leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {XP_PERKS.map((p, i) => (
              <div key={i} className="cyber-card p-4">
                <span className="text-2xl block mb-1">{p.icon}</span>
                <span className="text-cyber-green text-sm font-mono font-bold">{p.text}</span>
              </div>
            ))}
          </div>

          <div className="cyber-card p-4 border-cyber-yellow/20 bg-cyber-yellow/5">
            <p className="text-cyber-yellow text-sm font-mono font-bold">
              🏆 Compete on the Leaderboard
            </p>
            <p className="text-cyber-muted text-xs mt-1 font-body">
              Top writers get featured. Start posting today!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
