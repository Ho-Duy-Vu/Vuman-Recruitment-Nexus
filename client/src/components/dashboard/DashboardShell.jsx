import { memo } from 'react'
import { NavLink } from 'react-router-dom'

const EMPTY_NAV = Object.freeze([])

export const DashboardShell = memo(function DashboardShell({ title, navItems, children }) {
  const items = navItems ?? EMPTY_NAV
  return (
    <div className="hybrid-dash-shell">
      <aside className="hybrid-dash-sidebar">
        <div className="hybrid-dash-sidebar-brand">
          <div className="hybrid-dash-sidebar-logo">
            <span>V</span>
          </div>
          <div className="hybrid-dash-sidebar-brand-text">Vuman Dashboard</div>
        </div>

        <nav className="hybrid-dash-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'hybrid-dash-nav-link hybrid-dash-nav-link--active' : 'hybrid-dash-nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="hybrid-dash-main">
        <header className="hybrid-dash-topbar">
          <div className="hybrid-dash-topbar-left">
            <h1 className="hybrid-dash-title">{title}</h1>
          </div>
        </header>

        <main className="hybrid-dash-content">{children}</main>
      </div>
    </div>
  )
})

