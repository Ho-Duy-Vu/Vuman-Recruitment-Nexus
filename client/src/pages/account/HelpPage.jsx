import { useI18n } from '../../contexts/I18nContext'

export function HelpPage() {
  const { t } = useI18n()

  return (
    <main className="account-layout ui-page-enter">
      <div className="account-hero">
        <h1 className="account-title">{t('help.title')}</h1>
        <p className="account-subtitle">{t('help.subtitle')}</p>
      </div>

      <section className="account-card account-faq">
        <details className="faq-item" open>
          <summary className="faq-summary">{t('help.q1')}</summary>
          <div className="faq-body">{t('help.a1')}</div>
        </details>

        <details className="faq-item">
          <summary className="faq-summary">{t('help.q2')}</summary>
          <div className="faq-body">{t('help.a2')}</div>
        </details>

        <details className="faq-item">
          <summary className="faq-summary">{t('help.q3')}</summary>
          <div className="faq-body">{t('help.a3')}</div>
        </details>
      </section>
    </main>
  )
}

