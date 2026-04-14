export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-14 h-14 border-3',
    xl: 'w-20 h-20 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizes[size]} rounded-full border-cyber-border border-t-cyber-cyan animate-spin`}
        />
        <div
          className={`absolute inset-0 rounded-full border-cyber-border/30 ${sizes[size].split(' ')[0]} ${sizes[size].split(' ')[1]}`}
          style={{ border: '2px solid transparent', borderTopColor: 'rgba(0,212,255,0.2)' }}
        />
      </div>
      {text && (
        <p className="text-cyber-muted font-mono text-xs tracking-widest animate-pulse uppercase">
          {text}
        </p>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-cyber-cyan/20 animate-spin"
            style={{ borderTopColor: '#00d4ff', animationDuration: '1s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-cyber-purple/20 animate-spin"
            style={{ borderTopColor: '#7c3aed', animationDuration: '0.7s', animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            ⚡
          </div>
        </div>
        <div>
          <p className="font-display text-cyber-cyan text-sm tracking-[0.3em] uppercase animate-pulse">
            XP Blog
          </p>
          <p className="text-cyber-muted text-xs font-mono mt-1 tracking-wider">
            Loading system...
          </p>
        </div>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="cyber-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-2 w-1/4 rounded" />
        </div>
      </div>
      <div className="skeleton h-40 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="skeleton h-3 w-3/5 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-16 rounded" />
      </div>
    </div>
  )
}
