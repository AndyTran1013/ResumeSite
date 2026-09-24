import './App.css'
import CareerCard from './components/CareerCard'
import CareerPresentation from './components/CareerPresentation'
import AboutChapters from './components/AboutChapters'
import ProjectGallery from './components/ProjectGallery'
import SiteNav from './components/SiteNav'
import {careerRoles} from './data/career'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router'
import { scrollWindowTo } from './utils/scrollWindowTo'
import { siteRoutes } from './siteRoutes'
import { presentationMediaQuery, sectionScrollDuration, usesPresentationControls } from './responsive'

const routeTargets = Object.fromEntries(siteRoutes.map(({ path, targetId }) => [path, targetId]))
const gestureThreshold = 88
const gestureGapMs = 220
const momentumQuietMs = 170

function sectionTop(path) {
  const section = document.getElementById(routeTargets[path])
  return section ? section.getBoundingClientRect().top + window.scrollY : window.scrollY
}

function wheelPixels(event) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 16
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
  return event.deltaY
}

function visibleSectionPath() {
  const threshold = window.scrollY + window.innerHeight * 0.35
  let currentPath = siteRoutes[0].path
  for (const { path, targetId } of siteRoutes) {
    const section = document.getElementById(targetId)
    if (section && section.getBoundingClientRect().top + window.scrollY <= threshold) currentPath = path
  }
  return currentPath
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedRoleId, setExpandedRoleId] = useState(null)
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [isPresentationDetail, setIsPresentationDetail] = useState(false)
  const careerDetailVisible = isPresentationDetail && location.pathname === '/career'
  const shellRef = useRef(null)
  const stopSectionScroll = useRef(null)
  const isInitialRoute = useRef(true)
  const currentPath = useRef(location.pathname)
  const routePath = useRef(location.pathname)
  const pendingScrollRoute = useRef(null)
  const handledRouteKey = useRef(null)
  const pendingRouteFrame = useRef(null)
  const programmaticScroll = useRef(false)
  const sectionScrollId = useRef(0)
  const transitionId = useRef(0)
  const transitioning = useRef(false)
  const wheelLocked = useRef(false)
  const lastWheelAt = useRef(-Infinity)
  const quietTimer = useRef(null)
  const gesture = useRef({ direction: 0, amount: 0, lastAt: -Infinity })

  const enterSection = useCallback((targetId, { instant = false, focus = true, landing = 'start', onComplete, onStop } = {}) => {
    const target = document.getElementById(targetId)
    if (!target) return

    const destination = () => target.getBoundingClientRect().top + window.scrollY
      + (landing === 'end' ? Math.max(0, target.getBoundingClientRect().height - window.innerHeight) : 0)
    const scrollId = ++sectionScrollId.current
    stopSectionScroll.current?.()
    programmaticScroll.current = true
    stopSectionScroll.current = scrollWindowTo(destination, {
      instant,
      duration: sectionScrollDuration(),
      ease: 'easeInOut',
      interruptOnInput: !usesPresentationControls(),
      onComplete: () => {
        if (scrollId !== sectionScrollId.current) return
        programmaticScroll.current = false
        if (focus) target.focus({ preventScroll: true })
        onComplete?.()
      },
      onStop: () => {
        if (scrollId === sectionScrollId.current) {
          programmaticScroll.current = false
          onStop?.()
        }
      },
    })
  }, [])

  const releaseWhenQuiet = useCallback(() => {
    window.clearTimeout(quietTimer.current)
    if (transitioning.current) return
    const remaining = momentumQuietMs - (performance.now() - lastWheelAt.current)
    if (remaining <= 0) {
      wheelLocked.current = false
      return
    }
    quietTimer.current = window.setTimeout(() => {
      if (!transitioning.current && performance.now() - lastWheelAt.current >= momentumQuietMs) {
        wheelLocked.current = false
      }
    }, remaining)
  }, [])

  const moveToSection = useCallback((path, { commit = false, replace = false, instant = false, focus = true, landing = 'start' } = {}) => {
    if (!routeTargets[path]) return
    const presentationMode = usesPresentationControls()
    const shouldCommit = commit && routePath.current !== path
    const id = ++transitionId.current
    transitioning.current = true
    wheelLocked.current = presentationMode
    gesture.current = { direction: 0, amount: 0, lastAt: -Infinity }
    currentPath.current = path

    // Compact navigation commits at the tap; touch input can interrupt its short scroll.
    if (shouldCommit && !presentationMode) {
      pendingScrollRoute.current = path
      routePath.current = path
      navigate(path, { replace })
    }

    enterSection(routeTargets[path], {
      instant,
      focus,
      landing,
      onComplete: () => {
        if (id !== transitionId.current) return
        transitioning.current = false
        if (presentationMode) releaseWhenQuiet()
        else wheelLocked.current = false
        if (shouldCommit && presentationMode) {
          pendingScrollRoute.current = path
          routePath.current = path
          flushSync(() => navigate(path, { replace }))
        }
      },
      onStop: () => {
        if (id !== transitionId.current) return
        transitioning.current = false
        wheelLocked.current = false
        const visiblePath = visibleSectionPath()
        currentPath.current = visiblePath
        if (visiblePath !== routePath.current) {
          pendingScrollRoute.current = visiblePath
          routePath.current = visiblePath
          navigate(visiblePath, { replace: true })
        }
      },
    })
  }, [enterSection, navigate, releaseWhenQuiet])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      stopSectionScroll.current?.()
      window.cancelAnimationFrame(pendingRouteFrame.current)
      window.clearTimeout(quietTimer.current)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useLayoutEffect(() => {
    const nav = shellRef.current?.querySelector('.site-navigation')
    if (!nav) return
    const updateHeight = () => shellRef.current?.style.setProperty('--site-nav-height', `${nav.getBoundingClientRect().height}px`)
    const observer = new ResizeObserver(updateHeight)
    observer.observe(nav)
    updateHeight()
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (careerDetailVisible) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [careerDetailVisible])

  useLayoutEffect(() => {
    const routeKey = `${location.pathname}:${location.key}`
    if (routeKey === handledRouteKey.current) return
    handledRouteKey.current = routeKey
    window.cancelAnimationFrame(pendingRouteFrame.current)

    const fromScroll = pendingScrollRoute.current === location.pathname
    pendingScrollRoute.current = null
    const previousPath = currentPath.current
    currentPath.current = location.pathname
    routePath.current = location.pathname
    const resetProjects = !fromScroll && location.pathname !== '/projects' && expandedProjectId !== null
    if (resetProjects) setExpandedProjectId(null)
    if (!fromScroll) {
      const previousIndex = siteRoutes.findIndex(({ path }) => path === previousPath)
      const targetIndex = siteRoutes.findIndex(({ path }) => path === location.pathname)
      const options = {
        instant: isInitialRoute.current,
        focus: !isInitialRoute.current,
        landing: usesPresentationControls() && !isInitialRoute.current && targetIndex < previousIndex ? 'end' : 'start',
      }
      if (resetProjects) {
        pendingRouteFrame.current = window.requestAnimationFrame(() => {
          pendingRouteFrame.current = null
          moveToSection(location.pathname, options)
        })
      } else {
        moveToSection(location.pathname, options)
      }
    }
    isInitialRoute.current = false
  }, [location.pathname, location.key, expandedProjectId, moveToSection])

  useEffect(() => {
    let frame = null

    function handleScroll() {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        frame = null
        if (programmaticScroll.current || transitioning.current || isPresentationDetail) return
        const path = visibleSectionPath()
        if (path === currentPath.current) return
        currentPath.current = path
        pendingScrollRoute.current = path
        routePath.current = path
        navigate(path, { replace: true })
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [navigate, isPresentationDetail])

  useEffect(() => {
    const media = window.matchMedia(presentationMediaQuery)

    function moveWithinSection(delta, keyboard = false) {
      const path = currentPath.current
      const section = document.getElementById(routeTargets[path])
      if (!section) return
      const top = sectionTop(path)
      const lastViewTop = Math.max(top, top + section.getBoundingClientRect().height - window.innerHeight)
      const direction = Math.sign(delta)
      const current = window.scrollY
      const edge = direction > 0 ? lastViewTop : top

      if ((direction > 0 && current < edge - 1) || (direction < 0 && current > edge + 1)) {
        window.scrollTo({ top: Math.max(top, Math.min(lastViewTop, current + delta)), behavior: 'instant' })
        gesture.current = { direction: 0, amount: 0, lastAt: -Infinity }
        return
      }

      const index = siteRoutes.findIndex((route) => route.path === path)
      const next = siteRoutes[index + direction]
      if (!next) return
      if (keyboard) {
        moveToSection(next.path, { commit: true, landing: direction < 0 ? 'end' : 'start' })
        return
      }
      const now = performance.now()
      const prior = gesture.current
      const amount = prior.direction !== direction || now - prior.lastAt > gestureGapMs ? Math.abs(delta) : prior.amount + Math.abs(delta)
      gesture.current = { direction, amount, lastAt: now }
      if (amount >= gestureThreshold) moveToSection(next.path, { commit: true, landing: direction < 0 ? 'end' : 'start' })
    }

    function handleWheel(event) {
      if (!media.matches || isPresentationDetail || event.ctrlKey) return
      const delta = wheelPixels(event)
      if (!delta) return
      event.preventDefault()
      lastWheelAt.current = performance.now()
      if (wheelLocked.current) {
        if (!transitioning.current) releaseWhenQuiet()
        return
      }
      moveWithinSection(delta)
    }

    function handleKey(event) {
      if (!media.matches || isPresentationDetail || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof Element && event.target.closest('input, textarea, select, button, [contenteditable], [role="tab"]')) return
      const direction = event.key === 'PageDown' || event.key === 'ArrowDown' || event.key === ' ' && !event.shiftKey ? 1
        : event.key === 'PageUp' || event.key === 'ArrowUp' || event.key === ' ' && event.shiftKey ? -1 : 0
      if (!direction) return
      event.preventDefault()
      if (transitioning.current) return
      const distance = event.key.startsWith('Arrow') ? 48 : window.innerHeight * 0.8
      moveWithinSection(direction * distance, true)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('keydown', handleKey)
    }
  }, [isPresentationDetail, moveToSection, releaseWhenQuiet])

  function handleRouteNavigation(event, path) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.cancelAnimationFrame(pendingRouteFrame.current)
    if (path !== '/projects' && expandedProjectId !== null) setExpandedProjectId(null)
    moveToSection(path, { commit: path !== routePath.current })
  }

  function handleProjectToggle(id) {
    setExpandedProjectId((currentId) => currentId === id ? null : id)
  }

  return (
    <div ref={shellRef} className={`site-shell site-shell--career-presentation${careerDetailVisible ? ' site-shell--career-detail' : ''}`}>
      <SiteNav onNavigate={handleRouteNavigation} hidden={isPresentationDetail} />
      <section id="center" tabIndex={-1}>
        <div className="home-art" aria-hidden="true">
          <span className="home-orbit home-orbit--blue"><span /><span /></span>
          <span className="home-orbit home-orbit--rose"><span /><span /></span>
          <span className="home-orbit home-orbit--yellow"><span /><span /></span>
          <svg viewBox="0 0 1000 500" preserveAspectRatio="none">
            <path d="M 40 350 C 210 120 360 430 535 240 S 790 55 965 185" />
          </svg>
          <span className="home-star">✳</span>
          <span className="home-spark">✧</span>
        </div>

        <div className="intro">
          <p className="intro-eyebrow">Banking · Risk · Analytics</p>
          <h1>Andy Tran</h1>

          <p className="intro-lede">
            Risk and analytics leader with a focus on data, automation, and practical tools.
          </p>
          <p>
            Exploring opportunities in data analytics and automation.
          </p>
          
          <Link
            className="explore-link"
            to="/career"
            onClick={(event) => handleRouteNavigation(event, '/career')}
          >
            Explore my career
          </Link>

        </div>
      </section>

      <section
        id="career-heading"
        className={`career career--career-presentation${isPresentationDetail ? ' career--detail' : ''}`}
        tabIndex={-1}
        aria-label="Career"
      >
        <CareerPresentation
          roles={careerRoles}
          routeActive={location.pathname === '/career'}
          onDetailChange={setIsPresentationDetail}
          onReturnToCareer={() => window.requestAnimationFrame(() => {
            if (routePath.current === '/career') enterSection('career-heading', { instant: true })
          })}
        />

      <ol className="career-timeline">
        {careerRoles.map((role) => (
          <li className="timeline-item" key={role.id}>
            <CareerCard
              role={role}
              isExpanded={expandedRoleId === role.id}
              onToggle={() =>
                setExpandedRoleId((previousId) =>
                  previousId === role.id ? null : role.id
                )
              }
            />
          </li>
        ))}
      </ol>

      </section>

      <section id="projects" className="projects-page" tabIndex={-1} aria-labelledby="projects-title">
        <ProjectGallery expandedProjectId={expandedProjectId} onToggleProject={handleProjectToggle} />
      </section>

      <section id="about" className="about-page" tabIndex={-1} aria-label="About">
        <div className="about-page-art" aria-hidden="true">
          <span className="home-orbit home-orbit--blue about-page-orbit about-page-orbit--large"><span /><span /></span>
          <span className="home-orbit home-orbit--rose about-page-orbit about-page-orbit--small"><span /><span /></span>
        </div>
        <AboutChapters />
      </section>

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
