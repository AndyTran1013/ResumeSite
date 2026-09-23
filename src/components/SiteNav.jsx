import { Link } from 'react-router'
import { siteRoutes } from '../siteRoutes'

export default function SiteNav({ active, onNavigateCurrent }) {
  return (
    <nav className={`site-navigation${active === '/' ? ' home-navigation' : ''}`} aria-label="Primary navigation">
      {siteRoutes.map(({ path, label }) => (
        <Link
          to={path}
          key={path}
          aria-current={active === path ? 'page' : undefined}
          onClick={(event) => onNavigateCurrent(event, path)}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
