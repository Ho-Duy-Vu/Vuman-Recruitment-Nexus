import { useSelector } from 'react-redux'

import { selectCurrentUser } from '../../store/authSlice'
import { useI18n } from '../../contexts/I18nContext'

export function SettingsPage() {
  const user = useSelector(selectCurrentUser)
  const { t, lang, setLanguage } = useI18n()

  return (
    <main className="account-layout ui-page-enter">
      <div className="account-hero">
        <h1 className="account-title">{t('settings.title')}</h1>
        <p className="account-subtitle">{t('settings.subtitle')}</p>
      </div>

      <div className="account-card">
        <div className="account-row">
          <div className="account-label">{t('settings.language')}</div>
          <div className="account-value">
            <div className="lang-toggle">
              <button
                type="button"
                className={`lang-toggle-btn ${lang === 'vi' ? 'lang-toggle-btn--active' : ''}`}
                onClick={() => setLanguage('vi')}
              >
                {t('common.languageVI')}
              </button>
              <button
                type="button"
                className={`lang-toggle-btn ${lang === 'en' ? 'lang-toggle-btn--active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                {t('common.languageEN')}
              </button>
            </div>
          </div>
        </div>

        <div className="account-row">
          <div className="account-label">{t('settings.accountInfo')}</div>
          <div className="account-value">
            {user?.fullName || user?.email || '-'}
          </div>
        </div>
      </div>
    </main>
  )
}

