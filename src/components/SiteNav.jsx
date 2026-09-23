import { Link, useLocation } from 'react-router'
import { siteRoutes } from '../siteRoutes'

export default function SiteNav({ sectionPath, onNavigateCurrent }) {
  const { pathname } = useLocation()
  return (
    <nav className={`site-navigation${sectionPath === '/' ? ' home-navigation' : ''}`} aria-label="Primary navigation">
      {siteRoutes.map(({ path, label }) => (
        <Link
          to={path}
          key={path}
          aria-current={pathname === path ? 'page' : undefined}
          onClick={(event) => onNavigateCurrent(event, path)}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
