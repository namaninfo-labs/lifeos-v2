import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import OnboardingFlow from './onboarding/OnboardingFlow'
import PlanView from './components/PlanView'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import { addRipple } from './lib/celebrations'

const NAV = [
  { id: 'plan',      icon: '🗺️',  label: 'My Plan' },
  { id: 'analytics', icon: '📊',  label: 'Analytics' },
  { id: 'settings',  icon: '⚙️',  label: 'Settings' },
]

function NavItem({ item, active, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.88 }}
      onClick={(e) => { addRipple(e); onClick(item.id) }}
      className={`ripple-container flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        active ? 'bg-cyan-400/10 border border-cyan-400/20' : 'border border-transparent'
      }`}>
      <span className="text-xl">{item.icon}</span>
      <span className={`text-xs font-display font-700 ${active ? 'text-cyan-400' : 'text-white/30'}`}>
        {item.label}
      </span>
    </motion.button>
  )
}

// Desktop/Tablet sidebar nav item
function SideNavItem({ item, active, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }}
      onClick={(e) => { addRipple(e); onClick(item.id) }}
      className={`ripple-container w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
        active ? 'bg-cyan-400/10 border border-cyan-400/20' : 'border border-transparent glass-hover'
      }`}>
      <span className="text-xl">{item.icon}</span>
      <span className={`text-sm font-display font-700 ${active ? 'text-cyan-400' : 'text-white/40'}`}>
        {item.label}
      </span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />}
    </motion.button>
  )
}

const views = {
  plan: <PlanView />,
  analytics: <Analytics />,
  settings: <Settings />,
}

const viewAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
}

export default function App() {
  const { onboardingDone, activeScreen, setScreen, profile, xp, streak } = useStore()

  if (!onboardingDone) return <OnboardingFlow />

  const level = Math.floor(xp / 500) + 1

  return (
    <div className="space-bg stars min-h-dvh app-layout">

      {/* ── SIDEBAR (Tablet + Desktop) ── */}
      <aside className="sidebar border-r border-white/5 p-4 relative z-10">
        <div className="space-y-6">
          {/* Logo */}
          <div className="px-2 pt-2">
            <div className="font-display font-900 text-xl neon-text tracking-widest">LIFE OS</div>
            <div className="text-xs text-white/25 mt-0.5 font-display">EXECUTION SYSTEM</div>
          </div>

          {/* Profile mini */}
          <div className="glass rounded-xl p-3 neon-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{profile?.avatar}</span>
              <div className="min-w-0">
                <div className="font-display font-700 text-sm text-white/90 truncate">{profile?.name}</div>
                <div className="text-xs text-cyan-400/60">Level {level} · {xp} XP</div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 glass rounded-lg p-1.5 text-center">
                <div className="font-display font-700 text-sm text-rose-400">{streak} 🔥</div>
                <div className="text-xs text-white/25">streak</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="desktop-nav flex-col gap-1 w-full">
            {NAV.map(item => (
              <SideNavItem key={item.id} item={item}
                active={activeScreen === item.id}
                onClick={setScreen} />
            ))}
          </nav>
        </div>

        {/* Watermark bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <div className="watermark text-xs text-center">INNOVATING YOUR LIFE</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content flex flex-col relative z-10">

        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-space/80 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="font-display font-900 text-base neon-text tracking-widest">LIFE OS</div>
          <div className="flex items-center gap-3">
            <div className="glass px-2.5 py-1 rounded-full border border-rose-500/20">
              <span className="text-xs font-display font-700 text-rose-400">{streak} 🔥</span>
            </div>
            <div className="glass px-2.5 py-1 rounded-full border border-cyan-400/20">
              <span className="text-xs font-display font-700 text-cyan-400">Lv.{level}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeScreen} {...viewAnim}>
                {views[activeScreen] || <PlanView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ── BOTTOM NAV (Mobile only) ── */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-50 justify-around
        bg-space/95 backdrop-blur-xl border-t border-white/8 px-4 py-2">
        {NAV.map(item => (
          <NavItem key={item.id} item={item}
            active={activeScreen === item.id}
            onClick={setScreen} />
        ))}
      </nav>
    </div>
  )
}
