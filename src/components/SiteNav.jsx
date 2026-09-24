import { Link, useLocation } from 'react-router'
import { siteRoutes } from '../siteRoutes'
import './SiteNav.css'

export default function SiteNav({ onNavigate, hidden }) {
  const { pathname } = useLocation()
  return (
    <nav className={`site-navigation${pathname === '/' ? ' site-navigation--home' : ''}`} aria-label="Primary navigation" inert={hidden}>
      {siteRoutes.map(({ path, label }) => (
        <Link
          to={path}
          key={path}
          aria-current={pathname === path ? 'page' : undefined}
          onClick={(event) => onNavigate(event, path)}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
