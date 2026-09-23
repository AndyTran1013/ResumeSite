const sections = [
  { id: 'center', label: 'Home' },
  { id: 'career-heading', label: 'Career' },
  { id: 'projects', label: 'Projects' },
]

export default function SiteNav({ active, onNavigate }) {
  return (
    <nav className={`site-navigation${active === 'center' ? ' home-navigation' : ''}`} aria-label="Primary navigation">
      {sections.map(({ id, label }) => (
        <a
          href={`#${id}`}
          key={id}
          aria-current={active === id ? 'page' : undefined}
          onClick={(event) => onNavigate(event, id)}
        >
          {label}
        </a>
      ))}
    </nav>
  )
}
