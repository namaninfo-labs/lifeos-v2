export async function fireConfetti(type = 'default') {
  try {
    const confetti = (await import('canvas-confetti')).default
    if (type === 'big') {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#00CFFF','#7B2FFF','#FF2D78','#00FF88','#FFD700'] })
    } else if (type === 'side') {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#00CFFF','#7B2FFF'] })
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FF2D78','#00FF88'] }), 150)
    } else {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 }, colors: ['#00CFFF','#7B2FFF','#FF2D78'] })
    }
  } catch {}
}

export function showXPFloat(amount, x, y) {
  if (!amount) return
  const el = document.createElement('div')
  el.className = 'xp-float'
  el.textContent = `+${amount} XP`
  el.style.left = `${x}px`
  el.style.top = `${y - 20}px`
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1300)
}

// ── Touch ripple ─────────────────────────────────────────────────
export function addRipple(e) {
  const el = e.currentTarget
  const rect = el.getBoundingClientRect()
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  const size = Math.max(rect.width, rect.height) * 2

  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px;`
  el.appendChild(ripple)
  setTimeout(() => ripple.remove(), 700)
}
