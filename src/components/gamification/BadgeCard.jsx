export default function BadgeCard({ badge, earned = false, small = false }) {
  if (small) {
    return (
      <div
        title={badge.name}
        className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-xl
          transition-all duration-200 cursor-default
          ${earned
            ? 'bg-cyber-surface border border-cyber-border hover:scale-110'
            : 'bg-cyber-surface/30 border border-cyber-border/30 grayscale opacity-30'
          }`}
        style={earned ? { boxShadow: `0 0 10px ${badge.color || '#00d4ff'}40` } : {}}
      >
        {badge.secret && !earned ? '❓' : badge.icon || '🏅'}
      </div>
    )
  }

  return (
    <div
      className={`cyber-card p-4 flex items-start gap-3 transition-all duration-300
        ${earned ? 'hover-lift' : 'opacity-40 grayscale'}`}
      style={earned ? {
        borderColor: `${badge.color || '#00d4ff'}40`,
        boxShadow: `0 0 20px ${badge.color || '#00d4ff'}10`,
      } : {}}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={earned ? {
          background: `${badge.color || '#00d4ff'}15`,
          border: `1px solid ${badge.color || '#00d4ff'}40`,
          boxShadow: `0 0 10px ${badge.color || '#00d4ff'}20`,
        } : { background: '#1a1a2e', border: '1px solid #1e1e3a' }}
      >
        {badge.secret && !earned ? '❓' : badge.icon || '🏅'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold text-cyber-text truncate">
            {badge.secret && !earned ? '????' : badge.name}
          </h3>
          {badge.secret && (
            <span className="text-[9px] font-mono text-cyber-purple border border-cyber-purple/30 px-1 rounded">
              SECRET
            </span>
          )}
          {earned && (
            <span className="text-[9px] font-mono text-cyber-green border border-cyber-green/30 px-1 rounded">
              EARNED
            </span>
          )}
        </div>
        <p className="text-cyber-muted text-xs font-body mt-0.5">
          {badge.secret && !earned ? 'Keep exploring to unlock this secret badge...' : badge.description}
        </p>
      </div>
    </div>
  )
}
