import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MiniLevel } from '../gamification/LevelProgress'
import {
  Home, PenSquare, Trophy, Target, User, LogOut,
  Menu, X, Zap, Search
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            label: 'Feed',        icon: Home },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/missions',    label: 'Missions',    icon: Target },
]

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="sticky top-0 z-50 bg-cyber-bg/90 backdrop-blur-xl border-b border-cyber-border">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center group-hover:shadow-neon-cyan transition-all duration-300">
            <Zap className="w-4 h-4 text-cyber-cyan" />
          </div>
          <span className="font-display text-sm font-bold tracking-widest neon-cyan hidden sm:block">
            XPBLOG
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-medium tracking-wider uppercase transition-all duration-200
                  ${isActive(to)
                    ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          {user && (
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search posts..."
                    className="cyber-input text-xs py-1.5 w-40 sm:w-56"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}>
                    <X className="w-4 h-4 text-cyber-muted hover:text-cyber-text transition-colors" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 rounded-lg text-cyber-muted hover:text-cyber-cyan hover:bg-cyber-surface transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {user ? (
            <>
              {/* Write button */}
              <Link
                to="/create"
                className="hidden sm:flex btn-primary items-center gap-1.5 py-1.5 text-xs"
              >
                <PenSquare className="w-3.5 h-3.5" />
                Write
              </Link>

              {/* Profile dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cyber-surface transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyber-cyan/30 to-cyber-purple/30 border border-cyber-border flex items-center justify-center text-xs font-display font-bold text-cyber-cyan">
                    {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-display font-medium text-cyber-text leading-none">
                      {profile?.username || 'User'}
                    </p>
                    {profile && <MiniLevel points={profile.points} />}
                  </div>
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-cyber-card border border-cyber-border rounded-xl shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-cyber-border">
                    <p className="font-display text-xs font-bold text-cyber-text">
                      {profile?.username}
                    </p>
                    <p className="text-cyber-muted text-xs font-mono truncate">{user.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-cyber-yellow text-xs font-mono font-bold">
                        {profile?.points?.toLocaleString() || 0} XP
                      </span>
                    </div>
                  </div>

                  <div className="p-1">
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface transition-all duration-150 font-body"
                    >
                      <User className="w-3.5 h-3.5" />
                      My Profile
                    </Link>
                    <Link
                      to="/create"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface transition-all duration-150 font-body sm:hidden"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      Write Post
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-cyber-pink hover:bg-cyber-pink/10 transition-all duration-150 font-body"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-1.5 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface transition-all"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost py-1.5 text-xs">Login</Link>
              <Link to="/signup" className="btn-primary py-1.5 text-xs">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {user && menuOpen && (
        <div className="md:hidden border-t border-cyber-border bg-cyber-surface/95 backdrop-blur-xl">
          <div className="p-3 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-display tracking-wider transition-all
                  ${isActive(to)
                    ? 'text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/20'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-card'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
