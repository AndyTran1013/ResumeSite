import { useEffect, useState } from 'react'

// Keep this threshold aligned with the Career presentation media query.
// Fine-pointer space is required for the wheel/keyboard section controller.
export const presentationMediaQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine)'

export function usesPresentationControls() {
  return window.matchMedia(presentationMediaQuery).matches
}

// Shared subscription for components that must release desktop-only UI on resize.
export function usePresentationLayout() {
  const [isPresentation, setIsPresentation] = useState(usesPresentationControls)

  useEffect(() => {
    const media = window.matchMedia(presentationMediaQuery)
    const update = () => setIsPresentation(media.matches)
    media.addEventListener('change', update)
    update()
    return () => media.removeEventListener('change', update)
  }, [])

  return isPresentation
}

export function sectionScrollDuration() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--motion-section')
  const milliseconds = Number.parseFloat(value)
  return Number.isFinite(milliseconds) ? milliseconds / 1000 : 0
}
