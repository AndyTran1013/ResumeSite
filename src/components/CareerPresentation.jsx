import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './CareerPresentation.css'

const companies = [
  { name: 'BMO', colour: '#086dc2', tint: '#c7e6f7', caption: 'Credit strategy', number: '01' },
  { name: 'CIBC', colour: '#a42b55', tint: '#f1cbd7', caption: 'Insights & leadership', number: '02' },
  { name: 'RBC', colour: '#4c54b2', tint: '#dcdafa', caption: 'Analytics & tools', number: '03' },
]

export default function CareerPresentation({ roles }) {
  const [selectedId, setSelectedId] = useState(null)
  // A company selection includes all its roles; a role ID includes only that job.
  const visibleRoles = roles.filter((role) => role.id === selectedId || role.company === selectedId)
  const selected = visibleRoles[0]
  const reduceMotion = useReducedMotion()
  const heading = useRef(null)
  const origin = useRef(null)
  const transition = { duration: reduceMotion ? 0 : 0.85, ease: [0.76, 0, 0.24, 1] }

  useEffect(() => {
    if (selectedId) heading.current?.focus({ preventScroll: true })
    else origin.current?.focus({ preventScroll: true })
  }, [selectedId])

  function openRole(role, event) {
    origin.current = event.currentTarget
    setSelectedId(role.id)
  }

  return (
    <div className="career-presentation">
      <div className="presentation-intro">
        <p className="presentation-eyebrow">A little curiosity. A lot of data.</p>
        <h3>Connecting the dots.</h3>
        <p>My career in banking, analytics, and making things work better.</p>
      </div>

      <div
        className={`career-stage${selected ? ' career-stage--detail' : ''}`}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && selected) setSelectedId(null)
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
            <div key={company.name} style={{ '--company-colour': company.colour, '--company-tint': company.tint }}>
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
                animate={{ left: selected && active ? '12%' : position, top: selected && active ? 300 : 214, opacity: selected && !active ? 0 : 1 }}
                transition={transition}
                onClick={(event) => {
                  origin.current = event.currentTarget
                  setSelectedId(company.name)
                }}
              >{company.name}</motion.button>
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
          <p className="journey-instruction">Three banks. Many chapters. Pick a role to explore.</p>
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
            <button className="journey-back" onClick={() => setSelectedId(null)}>← Back to career</button>
            {visibleRoles.map((role, index) => (
            <motion.article
              className="role-screen-content"
              key={role.id}
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.5 }}
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
            </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

