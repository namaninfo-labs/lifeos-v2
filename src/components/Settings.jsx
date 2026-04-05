import { motion } from 'framer-motion'
import { useStore } from '../store'
import { addRipple } from '../lib/celebrations'

export default function Settings() {
  const { profile, plan, xp, streak, completedTasks, getStats, resetAll } = useStore()
  const stats = getStats()
  const level = Math.floor(xp / 500) + 1

  const exportData = () => {
    const exportObj = {
      profile,
      plan: plan ? { title: plan.planTitle, totalWeeks: plan.totalWeeks, northStar: plan.northStar } : null,
      progress: { xp, streak, tasksCompleted: stats.done, totalTasks: stats.total, pct: stats.pct },
      exportedAt: new Date().toLocaleString('en-IN'),
    }
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifeos-progress-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (window.confirm('⚠️ Reset everything? All progress will be lost. This cannot be undone.')) {
      resetAll()
    }
  }

  return (
    <div className="space-y-4">
      <div className="accent-border">
        <h2 className="font-display font-700 text-lg text-white">Profile & Settings</h2>
      </div>

      {/* Profile card */}
      <div className="glass rounded-2xl p-5 neon-border relative overflow-hidden">
        <div className="absolute top-0 right-0 watermark text-right pr-4 pt-2 text-sm opacity-30">OPERATOR</div>

        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl glass neon-border flex items-center justify-center text-3xl">
            {profile?.avatar}
          </div>
          <div>
            <h3 className="font-display font-800 text-xl text-white">{profile?.name}</h3>
            <div className="text-xs text-cyan-400/70 mt-0.5">
              {profile?.class === 'gap' ? 'Gap Year' : `Class ${profile?.class}`} · {profile?.stream}
            </div>
            <div className="text-xs text-white/30">{profile?.target}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { l: 'Level', v: level, c: '#FFD700' },
            { l: 'XP', v: xp, c: '#00CFFF' },
            { l: 'Streak 🔥', v: streak, c: '#FF2D78' },
          ].map(({ l, v, c }) => (
            <div key={l} className="glass rounded-xl p-3 text-center">
              <div className="font-display font-800 text-lg" style={{ color: c }}>{v}</div>
              <div className="text-xs text-white/30">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan info */}
      {plan && (
        <div className="glass rounded-2xl p-4 neon-border">
          <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider mb-3">
            Mission Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Plan</span><span className="text-white/80 font-600 text-right text-xs max-w-48 truncate">{plan.planTitle}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Duration</span><span className="text-white/80 font-600">{plan.totalWeeks} weeks</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Progress</span><span className="text-white/80 font-600">{stats.done}/{stats.total} tasks ({stats.pct}%)</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>North Star</span>
            </div>
            <p className="text-xs text-cyan-400/60 italic">"{plan.northStar}"</p>
          </div>
        </div>
      )}

      {/* Interests + Goals */}
      {profile?.interests?.length > 0 && (
        <div className="glass rounded-2xl p-4 neon-border">
          <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider mb-3">Your Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map(i => (
              <span key={i} className="px-2.5 py-1 rounded-full text-xs font-600 glass border border-cyan-400/20 text-cyan-300">{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Data controls */}
      <div className="glass rounded-2xl p-4 neon-border space-y-3">
        <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider">Data Controls</h3>

        <motion.button whileTap={{ scale: 0.97 }} onClick={(e) => { addRipple(e); exportData() }}
          className="ripple-container w-full py-3 rounded-xl border border-cyan-400/20 glass text-cyan-400 text-sm font-700 font-display">
          📦 Export Progress (JSON)
        </motion.button>

        <motion.button whileTap={{ scale: 0.97 }} onClick={(e) => { addRipple(e); handleReset() }}
          className="ripple-container w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm font-700 font-display">
          🔄 Reset & Start Over
        </motion.button>
      </div>

      <div className="text-center text-xs text-white/15 pb-4 font-display tracking-widest">
        LIFE OS v2.0 · DATA STORED LOCALLY
      </div>
    </div>
  )
}
