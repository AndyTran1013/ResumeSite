import './App.css'
import CareerCard from './components/CareerCard'
import CareerPresentation from './components/CareerPresentation'
import {careerRoles} from './data/career'
import { useState } from 'react'
import { animate } from 'motion'

function App() {
  const [expandedRoleId, setExpandedRoleId] = useState(null)
  const [isPresentationDetail, setIsPresentationDetail] = useState(false)

  function handleSectionNavigation(event, targetId) {
    // Preserve modified clicks, such as Ctrl-click.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return
    }

    // Keep normal link navigation for reduced-motion users.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const target = document.getElementById(targetId)
    if (!target) return

    event.preventDefault()

    const targetTop = target.getBoundingClientRect().top + window.scrollY
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    )
    const destination = Math.max(0, Math.min(targetTop, maxScroll))
    const listeners = new AbortController()

    const animation = animate(window.scrollY, destination, {
      duration: 0.9,
      ease: 'easeInOut',

      onUpdate: (position) => {
        window.scrollTo({ top: position, behavior: 'instant' })
      },

      onComplete: () => {
        listeners.abort()
        target.focus({ preventScroll: true })

        if (window.location.hash !== `#${targetId}`) {
          window.history.pushState(
            window.history.state,
            '',
            `#${targetId}`
          )
        }
      },
    })

    function stopScrolling() {
      animation.stop()
      listeners.abort()
    }

    for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
      window.addEventListener(eventName, stopScrolling, {
        passive: true,
        signal: listeners.signal,
      })
    }
  }

  function handleExploreClick(event) {
    handleSectionNavigation(event, 'career-heading')
  }

  function handleHomeClick(event) {
    handleSectionNavigation(event, 'center')
  }

  return (
    <div className="site-shell site-shell--career-presentation">
      <section id="center" tabIndex={-1}>
        <nav className="site-navigation home-navigation" aria-label="Primary navigation">
          <a href="#center" aria-current="page">Home</a>
          <a href="#career-heading" onClick={handleExploreClick}>Career</a>
        </nav>

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
            onClick={handleExploreClick}
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
        <nav className="site-navigation" aria-label="Primary navigation">
          <a href="#center" onClick={handleHomeClick}>Home</a>
          <a href="#career-heading" aria-current="page">Career</a>
        </nav>
        <CareerPresentation
          roles={careerRoles}
          onDetailChange={setIsPresentationDetail}
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

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </div>
  )
}

export default App
