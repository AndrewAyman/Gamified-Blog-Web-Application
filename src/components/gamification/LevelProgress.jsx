import { getLevelInfo } from '../../lib/gamification'

export default function LevelProgress({ points, compact = false }) {
  const { current, next, progress } = getLevelInfo(points || 0)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{current.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-display text-xs font-bold" style={{ color: current.color }}>
              LV.{current.level}
            </span>
            {next && (
              <span className="text-xs text-cyber-muted font-mono">
                {points}/{next.minPoints}
              </span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{current.icon}</span>
          <div>
            <p className="font-display text-sm font-bold" style={{ color: current.color }}>
              Level {current.level}
            </p>
            <p className="text-cyber-muted text-xs font-mono">{current.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold text-cyber-cyan">
            {points?.toLocaleString() || 0}
          </p>
          <p className="text-cyber-muted text-xs font-mono">total XP</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="progress-bar h-3">
          <div
            className="progress-fill transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-cyber-muted font-mono">
            {next ? `${points - current.minPoints} / ${next.minPoints - current.minPoints} XP` : 'MAX LEVEL'}
          </span>
          {next && (
            <span className="text-xs font-display" style={{ color: next.color }}>
              Next: {next.name} {next.icon}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function MiniLevel({ points }) {
  const { current } = getLevelInfo(points || 0)
  return (
    <span
      className="badge-level text-[10px] font-display"
      style={{
        color: current.color,
        background: `${current.color}15`,
        border: `1px solid ${current.color}40`,
      }}
    >
      {current.icon} LV.{current.level}
    </span>
  )
}
