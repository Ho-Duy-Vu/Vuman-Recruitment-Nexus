export function HeroSection({ title, subtitle, children }) {
  return (
    <section className="career-hero">
      <div className="career-hero-inner">
        <div className="career-hero-text">
          <h1 className="career-hero-title">{title}</h1>
          {subtitle && <p className="career-hero-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="career-hero-actions">{children}</div>}
      </div>
    </section>
  )
}

