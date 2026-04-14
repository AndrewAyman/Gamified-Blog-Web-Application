export default function MissionCard({ mission, userProgress }) {
  const progress = userProgress?.progress || 0
  const completed = userProgress?.completed || false
  const percentage = Math.min(100, Math.round((progress / mission.target) * 100))

  const categoryColors = {
    writing: '#00d4ff',
    social: '#ff006e',
    activity: '#ffd60a',
    progression: '#7c3aed',
  }

  const color = categoryColors[mission.category] || '#00d4ff'

  return (
    <div
      className={`cyber-card p-4 transition-all duration-300 hover-lift
        ${completed ? 'mission-complete' : ''}`}
      style={completed ? { borderColor: `${color}40` } : {}}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          {mission.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-sm font-bold text-cyber-text">
              {mission.title}
            </h3>
            <div
              className="text-xs font-mono px-2 py-0.5 rounded flex-shrink-0"
              style={{
                color,
                background: `${color}15`,
                border: `1px solid ${color}30`,
              }}
            >
              +{mission.reward} XP
            </div>
          </div>

          <p className="text-cyber-muted text-xs font-body mt-0.5 mb-2">
            {mission.description}
          </p>

          {completed ? (
            <div className="flex items-center gap-2">
              <div
                className="w-full h-1.5 rounded-full"
                style={{ background: `${color}30` }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: '100%', background: color }}
                />
              </div>
              <span className="text-xs font-mono flex-shrink-0" style={{ color }}>
                ✓ DONE
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-full h-1.5 rounded-full bg-cyber-border">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%`, background: color }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-cyber-muted font-mono">
                  {progress} / {mission.target}
                </span>
                <span className="text-xs font-mono" style={{ color }}>
                  {percentage}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
