import './App.css'
import CareerCard from './components/CareerCard'
import CareerPresentation from './components/CareerPresentation'
import ProjectGallery from './components/ProjectGallery'
import SiteNav from './components/SiteNav'
import {careerRoles} from './data/career'
import { useCallback, useEffect, useRef, useState } from 'react'
import { scrollWindowTo } from './utils/scrollWindowTo'

const sectionIds = new Set(['center', 'career-heading', 'projects'])

function App() {
  const [expandedRoleId, setExpandedRoleId] = useState(null)
  const [expandedProjectId, setExpandedProjectId] = useState(null)
  const [isPresentationDetail, setIsPresentationDetail] = useState(false)
  const stopSectionScroll = useRef(null)

  const enterSection = useCallback((targetId, { instant = false, focus = true, updateHistory = true } = {}) => {
    const target = document.getElementById(targetId)
    if (!target) return

    const targetTop = target.getBoundingClientRect().top + window.scrollY
    stopSectionScroll.current?.()
    stopSectionScroll.current = scrollWindowTo(targetTop, {
      instant,
      onComplete: () => {
        if (focus) target.focus({ preventScroll: true })
        if (updateHistory && window.location.hash !== `#${targetId}`) {
          window.history.pushState(window.history.state, '', `#${targetId}`)
        }
      },
    })
  }, [])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'

    const initialId = window.location.hash.slice(1)
    const frame = sectionIds.has(initialId)
      ? window.requestAnimationFrame(() => enterSection(initialId, { instant: true, focus: false, updateHistory: false }))
      : null

    function handleHistoryNavigation() {
      const id = window.location.hash.slice(1)
      const targetId = sectionIds.has(id) ? id : 'center'
      if (targetId !== 'projects') setExpandedProjectId(null)
      enterSection(targetId, { updateHistory: false })
    }

    window.addEventListener('popstate', handleHistoryNavigation)
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('popstate', handleHistoryNavigation)
      stopSectionScroll.current?.()
      window.history.scrollRestoration = previousRestoration
    }
  }, [enterSection])

  function handleSectionNavigation(event, targetId) {
    // Preserve modified clicks, such as Ctrl-click.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (targetId !== 'projects') setExpandedProjectId(null)
    enterSection(targetId)
  }

  function handleProjectToggle(id) {
    setExpandedProjectId((currentId) => currentId === id ? null : id)
  }

  return (
    <div className="site-shell site-shell--career-presentation">
      <section id="center" tabIndex={-1}>
        <SiteNav active="center" onNavigate={handleSectionNavigation} />

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
          
          <a
            className="explore-link"
            href="#career-heading"
            onClick={(event) => handleSectionNavigation(event, 'career-heading')}
          >
            Explore my career
          </a>

        </div>
      </section>

      <section
        id="career-heading"
        className={`career career--career-presentation${isPresentationDetail ? ' career--detail' : ''}`}
        tabIndex={-1}
        aria-label="Career"
      >
        <SiteNav active="career-heading" onNavigate={handleSectionNavigation} />
        <CareerPresentation
          roles={careerRoles}
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
        <SiteNav active="projects" onNavigate={handleSectionNavigation} />
        <ProjectGallery expandedProjectId={expandedProjectId} onToggleProject={handleProjectToggle} />
      </section>

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
