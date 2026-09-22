import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react'
import './CareerPresentation.css'

const companies = [
  { name: 'BMO', asset: 'bmo.png', navigationAsset: 'bmo.svg', showName: true, colour: '#0079c8', tint: '#c5eaff', ring: '#78bee8', caption: 'Credit strategy', number: '01' },
  { name: 'CIBC', asset: 'cibc-white.png', navigationAsset: 'cibc.svg', showName: true, colour: '#c41f3e', tint: '#ffd5df', ring: '#ec96a9', caption: 'Insights & leadership', number: '02' },
  { name: 'RBC', asset: 'rbc.svg', navigationAsset: 'rbc.svg', colour: '#0059b3', tint: '#f8e5a0', ring: '#e9cc6f', caption: 'Analytics & tools', number: '03' },
]

export default function CareerPresentation({ roles, onDetailChange }) {
  const [selectedId, setSelectedId] = useState(null)
  const [travelDirection, setTravelDirection] = useState(1)
  // A company selection displays all its roles; a role selection also records where to scroll.
  const selectedRole = roles.find((role) => role.id === selectedId)
  const selectedCompanyName = selectedRole?.company ?? selectedId
  const visibleRoles = selectedCompanyName ? roles.filter((role) => role.company === selectedCompanyName) : []
  const selected = visibleRoles[0]
  const selectedCompanyIndex = companies.findIndex((company) => company.name === selected?.company)
  const reduceMotion = useReducedMotion()
  const heading = useRef(null)
  const origin = useRef(null)
  const stage = useRef(null)
  const roleSections = useRef({})
  const pendingRoleId = useRef(null)
  const transition = { duration: reduceMotion ? 0 : 0.85, ease: [0.76, 0, 0.24, 1] }
  const isDetailOpen = Boolean(selected)

  useEffect(() => {
    if (selectedId) heading.current?.focus({ preventScroll: true })
    else origin.current?.focus({ preventScroll: true })
  }, [selectedId])

  useEffect(() => {
    if (!isDetailOpen) return undefined

    const previousBodyOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousRootOverflow
    }
  }, [isDetailOpen])

  useEffect(() => {
    const targetId = pendingRoleId.current
    if (!targetId) return undefined

    const listeners = new AbortController()
    let scrollAnimation
    const delay = window.setTimeout(() => {
      const target = roleSections.current[targetId]
      const detailStage = stage.current
      if (!target || !detailStage) return

      const targetTop = target.getBoundingClientRect().top
        - detailStage.getBoundingClientRect().top
        + detailStage.scrollTop
        - 24
      const destination = Math.max(0, Math.min(targetTop, detailStage.scrollHeight - detailStage.clientHeight))

      if (reduceMotion) {
        detailStage.scrollTo({ top: destination, behavior: 'instant' })
        target.querySelector('h3')?.focus({ preventScroll: true })
        pendingRoleId.current = null
        return
      }

      const stopScroll = () => {
        scrollAnimation?.stop()
        pendingRoleId.current = null
        listeners.abort()
      }

      for (const eventName of ['wheel', 'touchstart', 'pointerdown', 'keydown']) {
        detailStage.addEventListener(eventName, stopScroll, { once: true, signal: listeners.signal })
      }

      scrollAnimation = animate(detailStage.scrollTop, destination, {
        duration: 0.9,
        ease: 'easeInOut',
        onUpdate: (position) => {
          detailStage.scrollTo({ top: position, behavior: 'instant' })
        },
        onComplete: () => {
          listeners.abort()
          target.querySelector('h3')?.focus({ preventScroll: true })
          pendingRoleId.current = null
        },
      })
    }, reduceMotion ? 0 : 450)

    return () => {
      window.clearTimeout(delay)
      scrollAnimation?.stop()
      listeners.abort()
    }
  }, [selectedId, reduceMotion])

  function openRole(role, event) {
    origin.current = event.currentTarget
    pendingRoleId.current = roles.filter((item) => item.company === role.company).length > 1 ? role.id : null
    setTravelDirection(1)
    setSelectedId(role.id)
    onDetailChange(true)
  }

  function openCompany(companyName, event) {
    origin.current = event.currentTarget
    pendingRoleId.current = null
    setTravelDirection(1)
    setSelectedId(companyName)
    onDetailChange(true)
  }

  function navigateCompany(nextIndex) {
    if (nextIndex === selectedCompanyIndex) return

    pendingRoleId.current = null
    setTravelDirection(nextIndex > selectedCompanyIndex ? 1 : -1)
    setSelectedId(companies[nextIndex].name)
    stage.current?.scrollTo({ top: 0, behavior: 'auto' })
  }

  function closeDetail() {
    pendingRoleId.current = null
    setSelectedId(null)
    onDetailChange(false)
  }

  return (
    <div className="career-presentation">
      <motion.div
        className="presentation-intro"
        initial={false}
        animate={{
          height: selected ? 0 : 'auto',
          opacity: selected ? 0 : 1,
        }}
        transition={{ duration: reduceMotion ? 0 : 0.3, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
        aria-hidden={Boolean(selected)}
        inert={Boolean(selected)}
      >
        <p className="presentation-eyebrow">A little curiosity. A lot of data.</p>
        <h3>Connecting the dots.</h3>
        <p>My career in banking, analytics, and making things work better. Pick a role to explore.</p>
      </motion.div>

      <div
        ref={stage}
        className={`career-stage${selected ? ' career-stage--detail' : ''}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && selected) closeDetail()
        }}
      >
        <div className="stage-grain" aria-hidden="true" />
        <motion.div className="journey-decoration" aria-hidden="true" animate={{ opacity: selected ? 0 : 1 }} transition={transition}>
          <svg viewBox="0 0 1000 260" preserveAspectRatio="none">
            <path d="M 70 155 C 220 -20 330 285 500 140 S 800 10 940 145" />
          </svg>
          <span className="journey-star">✳</span>
          <span className="journey-spark">✧</span>
        </motion.div>

        {companies.map((company, index) => {
          const active = selected?.company === company.name
          const position = `${(index + 0.5) * 100 / companies.length}%`
          return (
            <div key={company.name} style={{ '--company-colour': company.colour, '--company-tint': company.tint, '--company-ring': company.ring }}>
              {/* Only decorative geometry changes size; text is never scaled. */}
              <motion.div
                className="company-orbit"
                style={{ x: '-50%', y: '-50%' }}
                aria-hidden="true"
                initial={false}
                animate={{
                  left: selected ? (active ? '0%' : position) : position,
                  top: selected && active ? 190 : 154,
                  width: selected && active ? 590 : 230,
                  height: selected && active ? 590 : 230,
                  opacity: selected && !active ? 0 : 1,
                  rotate: selected && active ? 100 : 0,
                }}
                transition={transition}
              ><span /><span /><span /></motion.div>
              <motion.button
                className="presentation-company"
                type="button"
                aria-label={`Explore all roles at ${company.name}`}
                tabIndex={selected ? -1 : 0}
                aria-hidden={Boolean(selected)}
                inert={Boolean(selected)}
                initial={false}
                style={{ x: '-50%', y: '-50%' }}
                animate={{
                  left: selected && active ? '12%' : position,
                  top: selected && active ? 240 : 154,
                  width: selected && active ? 250 : 100,
                  height: selected && active ? 250 : 100,
                  opacity: selected && !active ? 0 : 1,
                }}
                transition={transition}
                onClick={(event) => openCompany(company.name, event)}
              >
                <motion.span
                  className="company-logo-lockup"
                  initial={false}
                  animate={{ scale: selected && active ? 2 : 1 }}
                  transition={transition}
                >
                  <img
                    className={`company-logo company-logo--${company.name.toLowerCase()}`}
                    src={`${import.meta.env.BASE_URL}assets/companies/${company.asset}`}
                    alt=""
                  />
                  {company.showName && <span className="company-logo-name">{company.name}</span>}
                </motion.span>
              </motion.button>
            </div>
          )
        })}

        <motion.div
          className="journey-overview"
          animate={{ opacity: selected ? 0 : 1, y: selected && !reduceMotion ? 16 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, delay: selected || reduceMotion ? 0 : 0.55 }}
          aria-hidden={Boolean(selected)}
          inert={Boolean(selected)}
        >
          <div className="journey-companies">
            {companies.map((company) => (
              <div className="journey-company" key={company.name}>
                <p className="chapter-number">{company.number} / {company.caption}</p>
                {roles.filter((role) => role.company === company.name).map((role) => (
                  <button className="journey-role" key={role.id} onClick={(event) => openRole(role, event)}>
                    <span>{role.title}</span>
                    <span className="journey-dates">{role.startLabel} – {role.endLabel} <span aria-hidden="true">↗</span></span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {selected && (
          <div className="role-screen">
            <button className="journey-back" onClick={closeDetail}>← Back to career</button>
            <nav className="company-navigation" aria-label="Career company navigation">
              {companies.map((company, index) => {
                const isActive = index === selectedCompanyIndex
                return (
                  <button
                    type="button"
                    className={`company-navigation-button${isActive ? ' company-navigation-button--active' : ''}`}
                    key={company.name}
                    onClick={() => navigateCompany(index)}
                    aria-label={`View ${company.name} career experience`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <img src={`${import.meta.env.BASE_URL}assets/companies/${company.navigationAsset}`} alt="" />
                  </button>
                )
              })}
            </nav>
            <AnimatePresence mode="wait" custom={travelDirection}>
              <motion.div
                className="role-screen-content-group"
                key={selected.company}
                custom={travelDirection}
                initial={(direction) => ({ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : direction * 36 })}
                animate={{ opacity: 1, x: 0 }}
                exit={(direction) => ({ opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : direction * -36 })}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeInOut' }}
              >
                {visibleRoles.map((role, index) => (
                  <article
                    className="role-screen-content"
                    key={role.id}
                    ref={(element) => {
                      if (element) roleSections.current[role.id] = element
                      else delete roleSections.current[role.id]
                    }}
                  >
                    <p className="presentation-eyebrow">{role.company} / {role.department}{visibleRoles.length > 1 && ` · Role ${index + 1} of ${visibleRoles.length}`}</p>
                    <h3 ref={index === 0 ? heading : null} tabIndex={-1}>{role.title}</h3>
                    <p className="role-screen-dates"><time dateTime={role.startDate}>{role.startLabel}</time> – <time dateTime={role.endDate}>{role.endLabel}</time></p>
                    <p className="role-screen-summary">{role.summary}</p>
                    <div className="role-screen-sections">
                      {[
                        ['Responsibilities', role.responsibilities],
                        ['Achievements', role.achievements],
                        ['Relevant work', role.projects],
                      ].map(([title, items]) => items?.length > 0 && (
                        <section key={title}>
                          <h4>{title}</h4>
                          <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                      ))}
                    </div>
                    {role.skills?.length > 0 && <ul className="presentation-skills" aria-label="Skills and technologies">{role.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>}
                  </article>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

