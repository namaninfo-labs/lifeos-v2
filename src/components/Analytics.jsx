import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useStore, AREAS } from '../store'

export default function Analytics() {
  const { plan, completedTasks, xp, streak, getStats, getWeekStats } = useStore()
  const stats = getStats()
  const level = Math.floor(xp / 500) + 1

  // Weekly completion data
  const weekData = useMemo(() => {
    if (!plan?.weeks) return []
    return plan.weeks.map((_, wi) => {
      const ws = getWeekStats(wi)
      return { week: `W${wi + 1}`, pct: ws.pct, done: ws.done, total: ws.total }
    }).slice(0, 12) // Show max 12 weeks on chart
  }, [plan, completedTasks])

  // Area breakdown
  const areaStats = useMemo(() => {
    if (!plan?.weeks) return []
    const counts = {}
    const doneC = {}
    plan.weeks.forEach((week, wi) => {
      week.tasks?.forEach((task, ti) => {
        const area = task.area || 'Academic'
        counts[area] = (counts[area] || 0) + 1
        if (completedTasks[`w${wi}_t${ti}`]) {
          doneC[area] = (doneC[area] || 0) + 1
        }
      })
    })
    return Object.entries(counts).map(([area, total]) => ({
      area, total, done: doneC[area] || 0,
      pct: Math.round(((doneC[area] || 0) / total) * 100),
      color: AREAS[area]?.color || '#00CFFF',
      bg: AREAS[area]?.bg || 'rgba(0,207,255,0.1)',
      icon: AREAS[area]?.icon || '📚',
    }))
  }, [plan, completedTasks])

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass rounded-xl p-3 border border-cyan-400/20 text-xs">
        <div className="text-cyan-400 font-700">{payload[0]?.payload?.week}</div>
        <div className="text-white/70">{payload[0]?.value}% complete</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="accent-border">
        <h2 className="font-display font-700 text-lg text-white">Mission Analytics</h2>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: 'Total Completed', v: stats.done, sub: `of ${stats.total} tasks`, c: '#00CFFF' },
          { l: 'Overall Progress', v: `${stats.pct}%`, sub: 'mission complete', c: '#7B2FFF' },
          { l: 'Current Streak', v: `${streak} 🔥`, sub: 'days in a row', c: '#FF2D78' },
          { l: 'Level', v: level, sub: `${xp} total XP`, c: '#FFD700' },
        ].map(({ l, v, sub, c }) => (
          <div key={l} className="glass rounded-2xl p-4 neon-border">
            <div className="font-display font-900 text-2xl" style={{ color: c }}>{v}</div>
            <div className="text-sm font-600 text-white/60 mt-1">{l}</div>
            <div className="text-xs text-white/30">{sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly progress chart */}
      {weekData.length > 0 && (
        <div className="glass rounded-2xl p-4 neon-border">
          <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider mb-4">
            Weekly Completion %
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={weekData}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00CFFF" />
                  <stop offset="100%" stopColor="#7B2FFF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Exo 2' }} />
              <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Exo 2' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="pct" stroke="url(#lineGrad)" strokeWidth={2.5}
                dot={{ fill: '#00CFFF', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#00CFFF', boxShadow: '0 0 10px #00CFFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Area breakdown */}
      {areaStats.length > 0 && (
        <div className="glass rounded-2xl p-4 neon-border">
          <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider mb-4">
            Area Breakdown
          </h3>
          <div className="space-y-3">
            {areaStats.map(({ area, total, done, pct, color, bg, icon }) => (
              <div key={area}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-sm font-600" style={{ color }}>{area}</span>
                  </div>
                  <span className="text-xs text-white/30">{done}/{total} · {pct}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" style={{ background: color }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP Progress */}
      <div className="glass rounded-2xl p-4 neon-border">
        <h3 className="font-display font-700 text-sm text-cyan-400/80 uppercase tracking-wider mb-3">
          Level Progress
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-800 text-xl" style={{ color: '#FFD700' }}>Level {level}</span>
          <span className="text-xs text-white/30">{xp % 500} / 500 XP to Level {level + 1}</span>
        </div>
        <div className="h-3 bg-white/8 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FFD700, #FF8C00)' }}
            animate={{ width: `${((xp % 500) / 500) * 100}%` }}
            transition={{ duration: 0.8 }} />
        </div>
        <p className="text-xs text-white/30 mt-2">Every completed task = +25 XP</p>
      </div>

      {stats.done === 0 && (
        <div className="text-center py-8 text-white/20 text-sm">
          Complete tasks to see detailed analytics 📊
        </div>
      )}
    </div>
  )
}
