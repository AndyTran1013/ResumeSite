import { motion, useReducedMotion } from 'motion/react'

function CareerCard({ role, isExpanded, onToggle }) {
  const detailsId = `${role.id}-details`
  const shouldReduceMotion = useReducedMotion()

  return (
    <article className="career-entry">
      <div className="career-heading">
        <button
          className="company-mark"
          type="button"
          aria-label={`${isExpanded ? 'Hide' : 'Show'} details for ${role.title} at ${role.company}`}
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          {role.company}
        </button>
        <h3>{role.title}</h3>
      </div>
      <p>{role.company} · {role.department}</p>
      <p>
        <time dateTime={role.startDate}>{role.startLabel}</time>
        {' – '}
        <time dateTime={role.endDate}>{role.endLabel}</time>
      </p>

      <button
        className="career-toggle"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={onToggle}
      >
        {isExpanded ? 'Hide details' : 'Show details'}
      </button>

      <motion.div
        id={detailsId}
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: 'easeInOut',
        }}
        style={{ overflow: 'hidden' }}
        aria-hidden={!isExpanded}
        inert={!isExpanded}
      >
        <p className="career-summary">{role.summary}</p>

        {role.responsibilities?.length > 0 && (
          <div className="career-detail-section">
            <h4>Responsibilities</h4>
            <ul>
              {role.responsibilities.map((responsibility) => (
                <li key={responsibility}>{responsibility}</li>
              ))}
            </ul>
          </div>
        )}

        {role.achievements?.length > 0 && (
          <div className="career-detail-section">
            <h4>Achievements</h4>
            <ul>
              {role.achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}

        {role.projects?.length > 0 && (
          <div className="career-detail-section">
            <h4>Relevant work</h4>
            <ul>
              {role.projects.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ul>
          </div>
        )}

        {role.skills?.length > 0 && (
          <div className="career-skills">
            <h4>Skills and technologies</h4>
            <ul className="skill-list" role="list">
              {role.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

    </article>
  )
}

export default CareerCard
