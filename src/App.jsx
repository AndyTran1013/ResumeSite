import './App.css'
import CareerCard from './components/CareerCard'
import CareerPresentation from './components/CareerPresentation'
import {careerRoles} from './data/career'
import { useState } from 'react'
import { animate } from 'motion'

function App() {
  const [expandedRoleId, setExpandedRoleId] = useState(null)
  const [isPresentationDetail, setIsPresentationDetail] = useState(false)
  const showMorphPreview = new URLSearchParams(window.location.search).get('preview') === 'morph'

  function handleExploreClick(event) {
    // Preserve modified clicks, such as Ctrl-click.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return
    }

    // Keep normal link navigation for reduced-motion users.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const heading = document.getElementById('career-heading')
    if (!heading) return

    event.preventDefault()

    const headingTop = heading.getBoundingClientRect().top + window.scrollY
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    )
    const destination = Math.max(0, Math.min(headingTop, maxScroll))
    const listeners = new AbortController()

    const animation = animate(window.scrollY, destination, {
      duration: 0.9,
      ease: 'easeInOut',

      onUpdate: (position) => {
        window.scrollTo({ top: position, behavior: 'instant' })
      },

      onComplete: () => {
        listeners.abort()
        heading.focus({ preventScroll: true })

        if (window.location.hash !== '#career-heading') {
          window.history.pushState(
            window.history.state,
            '',
            '#career-heading'
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

  return (
    <div className={`site-shell${showMorphPreview ? ' site-shell--preview' : ''}`}>
      <section id="center">
        <div className="intro">
          <h1>Andy Tran</h1>

          <p>
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

      <section className={`career${showMorphPreview ? ' career--preview' : ''}${isPresentationDetail ? ' career--detail' : ''}`} aria-labelledby="career-heading">
        <h2
          id="career-heading"
          tabIndex={-1}
          aria-hidden={isPresentationDetail}
        >
          Career experience
        </h2>
        {showMorphPreview && (
          <CareerPresentation
            roles={careerRoles}
            onDetailChange={setIsPresentationDetail}
          />
        )}

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
