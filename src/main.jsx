import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import { siteRoutes } from './siteRoutes.js'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

// Pages serves route entry points from directories, adding a trailing slash on a direct visit.
// Keep the public URL consistent with client-side navigation after the entry point loads.
if (siteRoutes.some(({ path }) => path !== '/' && window.location.pathname === `${basename}${path}/`)) {
  window.history.replaceState(window.history.state, '', `${window.location.pathname.slice(0, -1)}${window.location.search}`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<><App /><Outlet /></>}>
          <Route index element={null} />
          {siteRoutes.filter(({ path }) => path !== '/').map(({ path }) => (
            <Route key={path} path={path.slice(1)} element={null} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
