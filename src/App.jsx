import './App.css'
import CareerCard from './components/CareerCard'
import CareerPresentation from './components/CareerPresentation'
import ProjectGallery from './components/ProjectGallery'
import SiteNav from './components/SiteNav'
import {careerRoles} from './data/career'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { scrollWindowTo } from './utils/scrollWindowTo'
import { siteRoutes } from './siteRoutes'

const routeTargets = Object.fromEntries(siteRoutes.map(({ path, targetId }) => [path, targetId]))

function App() {
  const location = useLocation()
  const [expandedRoleId, setExpandedRoleId] = useState(null)
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [isPresentationDetail, setIsPresentationDetail] = useState(false)
  const stopSectionScroll = useRef(null)
  const isInitialRoute = useRef(true)

  const enterSection = useCallback((targetId, { instant = false, focus = true } = {}) => {
    const target = document.getElementById(targetId)
    if (!target) return

    const targetTop = target.getBoundingClientRect().top + window.scrollY
    stopSectionScroll.current?.()
    stopSectionScroll.current = scrollWindowTo(targetTop, {
      instant,
      onComplete: () => {
        if (focus) target.focus({ preventScroll: true })
      },
    })
  }, [])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      stopSectionScroll.current?.()
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useLayoutEffect(() => {
    enterSection(routeTargets[location.pathname], { instant: isInitialRoute.current, focus: !isInitialRoute.current })
    isInitialRoute.current = false
  }, [location.pathname, location.key, enterSection])

  useEffect(() => {
    if (location.pathname === '/projects') return undefined
    const frame = window.requestAnimationFrame(() => setExpandedProjectId(null))
    return () => window.cancelAnimationFrame(frame)
  }, [location.pathname])

  function handleCurrentRouteNavigation(event, path) {
    if (path !== location.pathname || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    enterSection(routeTargets[path])
  }

  function handleProjectToggle(id) {
    setExpandedProjectId((currentId) => currentId === id ? null : id)
  }

  return (
    <div className="site-shell site-shell--career-presentation">
      <section id="center" tabIndex={-1}>
        <SiteNav active="/" onNavigateCurrent={handleCurrentRouteNavigation} />

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
          <h1>Andy Tran<span aria-hidden="true">.</span></h1>

          <p className="intro-lede">
            Risk and analytics leader with a focus on data, automation, and practical tools.
          </p>
          <p>
            Exploring opportunities in data analytics and automation.
          </p>
          
          <Link
            className="explore-link"
            to="/career"
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
        <SiteNav active="/career" onNavigateCurrent={handleCurrentRouteNavigation} />
        <CareerPresentation
          roles={careerRoles}
          routeActive={location.pathname === '/career'}
          onDetailChange={setIsPresentationDetail}
          onReturnToCareer={() => enterSection('career-heading', { instant: true })}
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
        <SiteNav active="/projects" onNavigateCurrent={handleCurrentRouteNavigation} />
        <ProjectGallery expandedProjectId={expandedProjectId} onToggleProject={handleProjectToggle} />
      </section>

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
