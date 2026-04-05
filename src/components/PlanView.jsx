import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useStore, AREAS } from '../store'
import { fireConfetti, showXPFloat, addRipple } from '../lib/celebrations'

function TaskItem({ task, weekIdx, taskIdx, completed, onToggle }) {
  const area = AREAS[task.area] || AREAS.Academic
  const [expanded, setExpanded] = useState(false)

  const handleCheck = (e) => {
    addRipple(e)
    const rect = e.currentTarget.getBoundingClientRect()
    const gained = onToggle(weekIdx, taskIdx)
    if (gained) {
      showXPFloat(gained, rect.left, rect.top)
      if (gained > 0) fireConfetti()
    }
  }

  return (
    <motion.div layout className={`rounded-xl border transition-all overflow-hidden ${
      completed ? 'border-white/5 opacity-60' : 'border-white/8 glass'
    }`}>
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <motion.button whileTap={{ scale: 0.85 }} onClick={handleCheck}
          className={`ripple-container flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center mt-0.5 transition-all ${
            completed ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20 hover:border-cyan-400/60'
          }`}>
          {completed && <Check size={12} className="text-cyan-400" />}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base">{area.icon}</span>
            <span className="text-xs font-700 px-2 py-0.5 rounded-full"
              style={{ background: area.bg, color: area.color }}>{task.area}</span>
            {task.duration && (
              <span className="text-xs text-white/30">⏱ {task.duration}m</span>
            )}
          </div>

          <p className={`text-sm font-600 leading-snug ${
            completed ? 'line-through text-white/30' : 'text-white/85'
          }`}>{task.title}</p>

          {/* Expand detail */}
          {(task.detail || task.resource) && (
            <button onClick={() => setExpanded(e => !e)}
              className="mt-1.5 flex items-center gap-1 text-xs text-cyan-500/70 hover:text-cyan-400 transition-colors">
              {expanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
              {expanded ? 'Less' : 'How to do this'}
            </button>
          )}

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="mt-2 space-y-2">
                  {task.detail && (
                    <p className="text-xs text-white/50 leading-relaxed">{task.detail}</p>
                  )}
                  {task.resource && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-amber-400">📌</span>
                      <span className="text-amber-400/80">{task.resource}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

function WeekCard({ week, weekIdx }) {
  const { completedTasks, toggleTask, expandedWeeks, toggleWeek, getWeekStats } = useStore()
  const isExpanded = expandedWeeks.includes(weekIdx)
  const stats = getWeekStats(weekIdx)

  const handleToggle = (wi, ti) => {
    return toggleTask(wi, ti)
  }

  // Color based on completion
  const pctColor = stats.pct >= 100 ? '#00FF88' : stats.pct >= 50 ? '#00CFFF' : '#7B2FFF'

  return (
    <motion.div layout className="glass rounded-2xl border border-white/8 overflow-hidden">
      {/* Week header */}
      <motion.button whileTap={{ scale: 0.99 }}
        onClick={() => toggleWeek(weekIdx)}
        className="ripple-container w-full p-4 flex items-start gap-3 text-left">

        {/* Week number */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-display font-800 text-sm"
          style={{ background: `${pctColor}20`, color: pctColor, border: `1px solid ${pctColor}40` }}>
          W{weekIdx + 1}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-700 text-sm text-white/90 truncate">{week.theme}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-white/30">{stats.done}/{stats.total}</span>
              {isExpanded ? <ChevronUp size={14} className="text-white/30"/> : <ChevronDown size={14} className="text-white/30"/>}
            </div>
          </div>

          {week.focus && (
            <p className="text-xs text-white/40 mt-0.5 truncate">{week.focus}</p>
          )}

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: pctColor }}
              animate={{ width: `${stats.pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }} />
          </div>
        </div>
      </motion.button>

      {/* Tasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-2">
              {week.tasks?.map((task, ti) => (
                <TaskItem key={ti} task={task} weekIdx={weekIdx} taskIdx={ti}
                  completed={!!completedTasks[`w${weekIdx}_t${ti}`]}
                  onToggle={handleToggle} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PlanView() {
  const { plan, profile, getStats, xp, streak } = useStore()
  const stats = getStats()
  const level = Math.floor(xp / 500) + 1

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center text-white/30 space-y-2">
          <div className="text-4xl">📡</div>
          <p className="text-sm">No plan found. Please restart onboarding.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="glass rounded-2xl p-4 neon-border overflow-hidden relative">
        {/* Watermark */}
        <div className="absolute bottom-0 right-0 watermark text-right leading-none opacity-50 overflow-hidden">
          EXECUTE
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-display text-cyan-400/60 uppercase tracking-widest mb-1">
                {profile?.avatar} {profile?.name}
              </div>
              <h2 className="font-display font-800 text-base text-white leading-tight">
                {plan.planTitle}
              </h2>
              {plan.northStar && (
                <p className="text-xs text-white/40 mt-1 italic">"{plan.northStar}"</p>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <div className="font-display font-900 text-3xl neon-text">{stats.pct}%</div>
              <div className="text-xs text-white/30">complete</div>
            </div>
          </div>

          {/* Overall progress */}
          <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-3">
            <motion.div className="h-full rounded-full progress-glow"
              style={{ background: 'linear-gradient(90deg, #00CFFF, #7B2FFF)' }}
              animate={{ width: `${stats.pct}%` }} transition={{ duration: 0.8 }} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: 'Tasks', v: `${stats.done}/${stats.total}`, c: '#00CFFF' },
              { l: 'XP', v: xp, c: '#FFD700' },
              { l: 'Streak 🔥', v: streak, c: '#FF2D78' },
              { l: `Lv.${level}`, v: `${xp % 500}/500`, c: '#A78BFA' },
            ].map(({ l, v, c }) => (
              <div key={l} className="glass rounded-xl p-2 text-center" style={{ borderColor: `${c}20` }}>
                <div className="font-display font-800 text-sm" style={{ color: c }}>{v}</div>
                <div className="text-xs text-white/30 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weeks */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-display font-700 text-sm text-white/60 uppercase tracking-wider">
            Week by Week Plan
          </h3>
          <span className="text-xs text-white/30">{plan.totalWeeks} weeks</span>
        </div>

        <div className="space-y-2">
          {plan.weeks?.map((week, wi) => (
            <WeekCard key={wi} week={week} weekIdx={wi} />
          ))}
        </div>
      </div>

      {/* Footer watermark */}
      <div className="watermark text-center py-4 text-xs">
        INNOVATING YOUR LIFE
      </div>
    </div>
  )
}
