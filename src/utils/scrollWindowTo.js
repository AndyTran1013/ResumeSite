import { animate } from 'motion'

export function scrollWindowTo(top, { duration = 0.9, ease = 'easeInOut', instant = false, interruptOnInput = true, onComplete, onStop } = {}) {
  const destination = () => {
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    return Math.max(0, Math.min(typeof top === 'function' ? top() : top, maxScroll))
  }
  const start = window.scrollY
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (instant || reducedMotion || Math.abs(start - destination()) < 1) {
    window.scrollTo({ top: destination(), behavior: 'instant' })
    onComplete?.()
    return () => {}
  }

  const listeners = new AbortController()
  let active = true
  const animation = animate(0, 1, {
    duration,
    ease,
    onUpdate: (progress) => window.scrollTo({ top: start + (destination() - start) * progress, behavior: 'instant' }),
    onComplete: () => {
      if (!active) return
      active = false
      listeners.abort()
      window.scrollTo({ top: destination(), behavior: 'instant' })
      onComplete?.()
    },
  })

  function stop() {
    if (!active) return
    active = false
    animation.stop()
    listeners.abort()
    onStop?.()
  }

  if (interruptOnInput) {
    for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(eventName, stop, { passive: true, signal: listeners.signal })
    }
  }

  return stop
}
