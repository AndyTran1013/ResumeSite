import { animate } from 'motion'

export function scrollWindowTo(top, { duration = 0.9, instant = false, onComplete } = {}) {
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const destination = Math.max(0, Math.min(top, maxScroll))
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (instant || reducedMotion || Math.abs(window.scrollY - destination) < 1) {
    window.scrollTo({ top: destination, behavior: 'instant' })
    onComplete?.()
    return () => {}
  }

  const listeners = new AbortController()
  const animation = animate(window.scrollY, destination, {
    duration,
    ease: 'easeInOut',
    onUpdate: (position) => window.scrollTo({ top: position, behavior: 'instant' }),
    onComplete: () => {
      listeners.abort()
      onComplete?.()
    },
  })

  function stop() {
    animation.stop()
    listeners.abort()
  }

  for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
    window.addEventListener(eventName, stop, { passive: true, signal: listeners.signal })
  }

  return stop
}
