function CareerCard({ role, isExpanded, onToggle }) {
  const detailsId = `${role.id}-details`

  return (
    <article className="career-entry">
      <h3>{role.title}</h3>
      <p>{role.company} · {role.department}</p>
      <p>
        <time dateTime={role.startDate}>{role.startLabel}</time>
        {' – '}
        <time dateTime={role.endDate}>{role.endLabel}</time>
      </p>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick= {onToggle}
      >
        {isExpanded ? 'Hide details' : 'Show details'}
      </button>

      <div id={detailsId} hidden={!isExpanded}>
        <p className="career-summary">{role.summary}</p>
      </div>
    </article>
  )
}

export default CareerCard