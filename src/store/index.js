import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Domain config ──────────────────────────────────────────────
export const AREAS = {
  Academic: { icon: '📚', color: '#00CFFF',  bg: 'rgba(0,207,255,0.1)' },
  Finance:  { icon: '💰', color: '#FFD700',  bg: 'rgba(255,215,0,0.1)' },
  Mindset:  { icon: '🧠', color: '#FF2D78',  bg: 'rgba(255,45,120,0.1)' },
  Skill:    { icon: '⚡', color: '#A78BFA',  bg: 'rgba(167,139,250,0.1)' },
  Project:  { icon: '🚀', color: '#00FF88',  bg: 'rgba(0,255,136,0.1)' },
}

// ── Store ──────────────────────────────────────────────────────
const INITIAL = {
  onboardingDone: false,
  profile: null,
  plan: null,           // Full AI-generated plan
  completedTasks: {},   // { "w0_t0": true, ... }
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  activeScreen: 'plan', // plan | analytics | settings
  expandedWeeks: [0],   // Week indices that are expanded
}

export const useStore = create(
  persist(
    (set, get) => ({
      ...INITIAL,

      // ── Onboarding ──────────────────────────────────────────
      completeOnboarding: (profile) => set({
        onboardingDone: true,
        profile,
        activeScreen: 'plan',
      }),

      // ── Plan ────────────────────────────────────────────────
      setPlan: (plan) => set({ plan }),

      // ── Task toggle ─────────────────────────────────────────
      toggleTask: (weekIdx, taskIdx) => {
        const key = `w${weekIdx}_t${taskIdx}`
        const wasCompleted = get().completedTasks[key] || false
        const newCompleted = {
          ...get().completedTasks,
          [key]: !wasCompleted,
        }

        // XP
        const xpChange = wasCompleted ? -25 : 25
        const newXp = Math.max(0, get().xp + xpChange)

        // Streak
        const today = new Date().toDateString()
        const lastDate = get().lastActiveDate
        let newStreak = get().streak
        if (!wasCompleted) {
          if (lastDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toDateString()
            newStreak = lastDate === yesterday ? newStreak + 1 : 1
          }
        }

        set({
          completedTasks: newCompleted,
          xp: newXp,
          streak: newStreak,
          lastActiveDate: !wasCompleted ? today : lastDate,
        })

        return !wasCompleted ? 25 : 0
      },

      // ── Week expand/collapse ─────────────────────────────────
      toggleWeek: (weekIdx) => {
        const expanded = get().expandedWeeks
        set({
          expandedWeeks: expanded.includes(weekIdx)
            ? expanded.filter(i => i !== weekIdx)
            : [...expanded, weekIdx],
        })
      },

      expandWeek: (weekIdx) => {
        if (!get().expandedWeeks.includes(weekIdx)) {
          set({ expandedWeeks: [...get().expandedWeeks, weekIdx] })
        }
      },

      // ── Navigation ──────────────────────────────────────────
      setScreen: (screen) => set({ activeScreen: screen }),

      // ── Stats helpers ────────────────────────────────────────
      getStats: () => {
        const s = get()
        const plan = s.plan
        if (!plan) return { total: 0, done: 0, pct: 0, level: 1, xpNext: 500 }

        let total = 0, done = 0
        plan.weeks?.forEach((week, wi) => {
          week.tasks?.forEach((_, ti) => {
            total++
            if (s.completedTasks[`w${wi}_t${ti}`]) done++
          })
        })

        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const level = Math.floor(s.xp / 500) + 1
        const xpNext = 500 - (s.xp % 500)

        return { total, done, pct, level, xpNext }
      },

      getWeekStats: (weekIdx) => {
        const s = get()
        const week = s.plan?.weeks?.[weekIdx]
        if (!week) return { total: 0, done: 0, pct: 0 }
        const total = week.tasks?.length || 0
        let done = 0
        week.tasks?.forEach((_, ti) => {
          if (s.completedTasks[`w${weekIdx}_t${ti}`]) done++
        })
        return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
      },

      // ── Reset ────────────────────────────────────────────────
      resetAll: () => set(INITIAL),
    }),
    {
      name: 'lifeos-v2-final',
      // Persist everything
      partialize: (s) => ({
        onboardingDone: s.onboardingDone,
        profile: s.profile,
        plan: s.plan,
        completedTasks: s.completedTasks,
        xp: s.xp,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        expandedWeeks: s.expandedWeeks,
      }),
    }
  )
)
