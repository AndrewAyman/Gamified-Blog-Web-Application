import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Zap, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { toast.error('Please enter your email'); return }
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to send reset email')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/30 items-center justify-center mb-4 shadow-neon-cyan">
            <Zap className="w-8 h-8 text-cyber-cyan" />
          </div>
          <h1 className="font-display text-2xl font-bold neon-cyan tracking-widest">XPBLOG</h1>
        </div>

        <div className="cyber-card p-8">
          {!sent ? (
            <>
              <div className="mb-6">
                <h2 className="font-display text-lg font-bold text-cyber-text tracking-wider">
                  RESET PASSWORD
                </h2>
                <p className="text-cyber-muted text-sm font-body mt-1">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-cyber-muted tracking-widest uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@xpblog.io"
                      className="cyber-input pl-10"
                      autoComplete="email"
                      autoFocus
                    />
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex w-16 h-16 rounded-full bg-cyber-green/10 border border-cyber-green/30 items-center justify-center">
                <CheckCircle className="w-8 h-8 text-cyber-green" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-cyber-green tracking-wider">
                  EMAIL SENT!
                </h2>
                <p className="text-cyber-muted text-sm font-body mt-2 leading-relaxed">
                  We sent a reset link to <br />
                  <span className="text-cyber-cyan font-mono">{email}</span>
                </p>
                <p className="text-cyber-muted text-xs font-mono mt-3">
                  Check your inbox and spam folder.<br />
                  The link expires in 1 hour.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="btn-ghost py-2 text-xs"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-cyber-border">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-cyber-muted text-sm hover:text-cyber-cyan transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
