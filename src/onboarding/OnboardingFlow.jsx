import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { generateFullPlan } from '../lib/ai'
import { fireConfetti } from '../lib/celebrations'

const AVATARS = ['🚀','🦊','🐼','🦋','🔥','⚡','🌟','🎯','🧠','🎮']

const INTERESTS = [
  { id: 'tech',     e: '💻', l: 'Technology / Coding' },
  { id: 'finance',  e: '💰', l: 'Finance / Money' },
  { id: 'content',  e: '🎬', l: 'Content Creation' },
  { id: 'design',   e: '🎨', l: 'Design / Art' },
  { id: 'science',  e: '🧪', l: 'Science / Research' },
  { id: 'business', e: '🤝', l: 'Business / Startup' },
  { id: 'writing',  e: '✍️', l: 'Writing / Blogging' },
  { id: 'sports',   e: '🏋️', l: 'Fitness / Sports' },
  { id: 'music',    e: '🎵', l: 'Music / Arts' },
  { id: 'gaming',   e: '🎮', l: 'Gaming / Esports' },
]

const GOALS = [
  { id: 'top_rank',  e: '🏆', l: 'Top rank in exams' },
  { id: 'first_income', e: '💸', l: 'Earn first income' },
  { id: 'build_skill', e: '🔧', l: 'Build real skills' },
  { id: 'consistency', e: '📅', l: 'Build daily habits' },
  { id: 'college',  e: '🎓', l: 'Get into good college' },
  { id: 'startup',  e: '🚀', l: 'Start something own' },
  { id: 'freelance', e: '💻', l: 'Freelancing / Part-time' },
  { id: 'fitness',  e: '💪', l: 'Improve fitness / health' },
]

const slide = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

function Btn({ onClick, children, disabled, variant = 'primary', className = '' }) {
  return (
    <motion.button whileTap={{ scale: 0.96 }} onClick={onClick} disabled={disabled}
      className={`ripple-container px-6 py-3 rounded-xl font-display font-600 text-sm transition-all
        ${variant === 'primary'
          ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed'
          : 'glass text-cyan-400 border border-cyan-500/20'
        } ${className}`}
    >{children}</motion.button>
  )
}

function SelectCard({ emoji, label, sub, selected, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
      className={`ripple-container w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3
        ${selected
          ? 'border-cyan-400/60 bg-cyan-400/10 shadow-lg shadow-cyan-400/10'
          : 'border-white/8 glass glass-hover'}`}>
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div>
        <div className={`font-600 text-sm ${selected ? 'text-cyan-300' : 'text-white/80'}`}>{label}</div>
        {sub && <div className="text-xs text-white/40 mt-0.5">{sub}</div>}
      </div>
      {selected && <span className="ml-auto text-cyan-400 text-lg">✓</span>}
    </motion.button>
  )
}

function MultiChip({ emoji, label, selected, onClick }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} onClick={onClick}
      className={`ripple-container px-3 py-2 rounded-xl border text-xs font-600 transition-all flex items-center gap-1.5
        ${selected
          ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300'
          : 'border-white/8 glass text-white/60 glass-hover'}`}>
      <span>{emoji}</span>{label}
    </motion.button>
  )
}

const LOADING_MSGS = [
  'Reading your profile... 🔍',
  'Designing your journey... 🗺️',
  'Building week by week... 📅',
  'Adding tasks and resources... ⚡',
  'Calibrating AI guidance... 🧠',
  'Almost ready... 🚀',
]

export default function OnboardingFlow() {
  const { completeOnboarding, setPlan } = useStore()
  const [step, setStep] = useState(0)
  const [msgIdx, setMsgIdx] = useState(0)
  const [error, setError] = useState(null)

  const [data, setData] = useState({
    name: '', avatar: '🚀',
    class: '', stream: '', target: '',
    interests: [], goals: [],
    duration: 90,
  })

  const up = (obj) => setData(d => ({ ...d, ...obj }))
  const next = () => { setStep(s => s + 1) }
  const back = () => setStep(s => s - 1)

  const toggleArr = (key, val) => up({
    [key]: data[key].includes(val) ? data[key].filter(x => x !== val) : [...data[key], val]
  })

  const streamOptions = {
    '11': ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts/Humanities'],
    '12': ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts/Humanities'],
    'gap': ['PCM (Science)', 'PCB (Science)', 'Commerce', 'Arts', 'Other'],
  }

  const targetOptions = {
    '11': ['Board Exams', 'JEE Preparation', 'NEET Preparation', 'Foundation + Boards', 'Skill Building'],
    '12': ['JEE Mains/Advanced', 'NEET', 'CUET', 'Board Toppers', 'Skill + Boards'],
    'gap': ['JEE/NEET Dropper', 'CUET', 'Skill Building', 'Startup/Business', 'International Education'],
  }

  const startGeneration = async () => {
    setStep(7) // processing screen
    setError(null)

    let i = 0
    const iv = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setMsgIdx(i) }, 900)

    const plan = await generateFullPlan(data)
    clearInterval(iv)

    if (!plan) {
      setError('Could not generate plan. Check your Gemini API key in Vercel settings.')
      setStep(6)
      return
    }

    setPlan(plan)
    completeOnboarding(data)
    fireConfetti('big')
  }

  const TOTAL = 8

  const screens = [
    // 0 — Welcome
    <motion.div key={0} {...slide} className="flex flex-col items-center text-center gap-6">
      <div className="relative">
        <div className="w-28 h-28 rounded-full glass neon-border flex items-center justify-center text-6xl glow-pulse">
          🚀
        </div>
        <div className="absolute inset-0 orbit-ring scale-125 opacity-40" />
        <div className="absolute inset-0 orbit-ring-2 scale-150 opacity-20" />
      </div>

      <div>
        <h1 className="font-display text-2xl font-800 neon-text tracking-wide mb-1">LIFE OS</h1>
        <p className="text-white/50 text-sm">Your intelligent execution system</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <div>
          <label className="text-xs font-600 text-cyan-400/80 uppercase tracking-widest mb-2 block">Your Name</label>
          <input value={data.name} onChange={e => up({ name: e.target.value })}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 rounded-xl glass neon-border bg-transparent text-white text-center font-display text-lg font-600 outline-none focus:border-cyan-400/60 transition-colors placeholder:text-white/20" />
        </div>

        <div>
          <label className="text-xs font-600 text-cyan-400/80 uppercase tracking-widest mb-2 block">Your Avatar</label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map(a => (
              <motion.button key={a} whileTap={{ scale: 0.88 }} onClick={() => up({ avatar: a })}
                className={`text-2xl p-2 rounded-xl border transition-all ${
                  data.avatar === a ? 'border-cyan-400/60 bg-cyan-400/15' : 'border-white/8 glass'
                }`}>{a}</motion.button>
            ))}
          </div>
        </div>
      </div>

      <Btn onClick={next} disabled={!data.name.trim()} className="px-10 py-3.5">
        Initialize System →
      </Btn>
    </motion.div>,

    // 1 — Class
    <motion.div key={1} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-6">
        <h2 className="font-display text-xl font-700 text-white">Where are you now?</h2>
        <p className="text-white/40 text-sm mt-1">Choose your current level</p>
      </div>

      <div className="space-y-2.5">
        {[
          { id: '11', e: '📖', l: 'Class 11 Student', s: 'Currently in 11th grade' },
          { id: '12', e: '🎓', l: 'Class 12 Student', s: 'Final year of school' },
          { id: 'gap', e: '⚡', l: 'Gap Year (After 12)', s: 'Preparing for next phase' },
        ].map(o => (
          <SelectCard key={o.id} emoji={o.e} label={o.l} sub={o.s}
            selected={data.class === o.id} onClick={() => up({ class: o.id, stream: '', target: '' })} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={next} disabled={!data.class} className="flex-1">Next →</Btn>
      </div>
    </motion.div>,

    // 2 — Stream
    <motion.div key={2} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-6">
        <h2 className="font-display text-xl font-700 text-white">Your Stream</h2>
        <p className="text-white/40 text-sm mt-1">Choose your academic stream</p>
      </div>

      <div className="space-y-2.5">
        {(streamOptions[data.class] || []).map(s => (
          <SelectCard key={s} emoji="📚" label={s} selected={data.stream === s} onClick={() => up({ stream: s })} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={next} disabled={!data.stream} className="flex-1">Next →</Btn>
      </div>
    </motion.div>,

    // 3 — Target
    <motion.div key={3} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-6">
        <h2 className="font-display text-xl font-700 text-white">Primary Target</h2>
        <p className="text-white/40 text-sm mt-1">What are you working towards?</p>
      </div>

      <div className="space-y-2.5">
        {(targetOptions[data.class] || []).map(t => (
          <SelectCard key={t} emoji="🎯" label={t} selected={data.target === t} onClick={() => up({ target: t })} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={next} disabled={!data.target} className="flex-1">Next →</Btn>
      </div>
    </motion.div>,

    // 4 — Interests
    <motion.div key={4} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-4">
        <h2 className="font-display text-xl font-700 text-white">What excites you?</h2>
        <p className="text-white/40 text-sm mt-1">Pick everything that feels true</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(i => (
          <MultiChip key={i.id} emoji={i.e} label={i.l}
            selected={data.interests.includes(i.id)}
            onClick={() => toggleArr('interests', i.id)} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={next} disabled={!data.interests.length} className="flex-1">Next →</Btn>
      </div>
    </motion.div>,

    // 5 — Goals
    <motion.div key={5} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-4">
        <h2 className="font-display text-xl font-700 text-white">Your Goals</h2>
        <p className="text-white/40 text-sm mt-1">What do you want to achieve?</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {GOALS.map(g => (
          <MultiChip key={g.id} emoji={g.e} label={g.l}
            selected={data.goals.includes(g.id)}
            onClick={() => toggleArr('goals', g.id)} />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={next} disabled={!data.goals.length} className="flex-1">Next →</Btn>
      </div>
    </motion.div>,

    // 6 — Duration
    <motion.div key={6} {...slide} className="w-full space-y-4">
      <div className="accent-border mb-4">
        <h2 className="font-display text-xl font-700 text-white">Mission Duration</h2>
        <p className="text-white/40 text-sm mt-1">How long do you commit?</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          { d: 30,  e: '⚡', l: '30 Days', s: '1 month sprint' },
          { d: 60,  e: '🌱', l: '60 Days', s: '2 month grind' },
          { d: 90,  e: '🚀', l: '90 Days', s: '3 month transform' },
          { d: 180, e: '🌟', l: '180 Days', s: '6 month reinvent' },
          { d: 270, e: '💎', l: '270 Days', s: '9 month master' },
          { d: 365, e: '🏆', l: '365 Days', s: 'Full year journey' },
        ].map(({ d, e, l, s }) => (
          <motion.button key={d} whileTap={{ scale: 0.96 }}
            onClick={() => up({ duration: d })}
            className={`ripple-container p-4 rounded-xl border transition-all text-left ${
              data.duration === d
                ? 'border-cyan-400/60 bg-cyan-400/10'
                : 'border-white/8 glass glass-hover'
            }`}>
            <div className="text-2xl mb-1">{e}</div>
            <div className={`font-display font-700 text-sm ${data.duration === d ? 'text-cyan-300' : 'text-white/80'}`}>{l}</div>
            <div className="text-xs text-white/40">{s}</div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Btn onClick={back} variant="secondary">← Back</Btn>
        <Btn onClick={startGeneration} className="flex-1 py-3.5">
          🚀 Generate My Plan
        </Btn>
      </div>
    </motion.div>,

    // 7 — Processing (AI call)
    <motion.div key={7} {...slide} className="flex flex-col items-center text-center gap-8 min-h-64 justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 orbit-ring" />
        <div className="absolute inset-0 orbit-ring-2 scale-75" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="text-5xl">⚙️</motion.div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-xl font-700 neon-text">AI Building Your Plan</h2>
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-white/50 text-sm">{LOADING_MSGS[msgIdx]}</motion.p>
        </AnimatePresence>
      </div>

      <div className="watermark">EXECUTING</div>
    </motion.div>,
  ]

  return (
    <div className="space-bg stars min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-lg font-800 neon-text tracking-widest">LIFE OS</div>
          {step < 7 && (
            <div className="flex items-center gap-2">
              <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                  animate={{ width: `${((step + 1) / 7) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
              <span className="text-xs text-white/30 font-display">{step + 1}/7</span>
            </div>
          )}
        </div>

        {/* Screen */}
        <AnimatePresence mode="wait">
          {screens[step]}
        </AnimatePresence>
      </div>
    </div>
  )
}
