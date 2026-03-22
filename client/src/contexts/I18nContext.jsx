import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const I18N_STORAGE_KEY = 'vuman_i18n_lang'

const dict = {
  vi: {
    'navbar.about': 'Cuộc sống tại Vuman',
    'navbar.jobs': 'Tìm việc làm',
    'navbar.candidate': 'Trang ứng viên',
    'navbar.kanban': 'Kanban',
    'navbar.manageWork': 'Quản lý công việc',

    'menu.profile': 'Hồ sơ',
    'menu.settings': 'Cài đặt',
    'menu.help': 'Trợ giúp',
    'menu.changePassword': 'Đổi mật khẩu',

    'theme.dark': 'Chế độ tối',
    'theme.light': 'Chế độ sáng',

    'profile.title': 'Hồ sơ của tôi',
    'profile.subtitle': 'Thông tin tài khoản (chỉ đọc)',
    'profile.email': 'Email',
    'profile.fullName': 'Họ và tên',
    'profile.role': 'Vai trò',
    'role.candidate': 'Ứng viên',
    'role.hr': 'HR',
    'role.admin': 'Admin',

    'settings.title': 'Cài đặt',
    'settings.subtitle': 'Tùy chọn giao diện và ngôn ngữ',
    'settings.language': 'Ngôn ngữ',
    'settings.accountInfo': 'Thông tin tài khoản',

    'help.title': 'Trợ giúp (FAQ)',
    'help.subtitle': 'Các câu hỏi thường gặp',
    'help.q1': 'Làm sao để rút đơn ứng tuyển?',
    'help.a1': 'Trên trang ứng viên, chọn vị trí đang ứng tuyển và nhấn “Rút đơn”.',
    'help.q2': 'HR/Admin xem được gì trong trang “Xem lại đơn đăng ký”?',
    'help.a2': 'HR/Admin xem toàn bộ dữ liệu form ứng tuyển và ghi chú HR (read-only đối với HR review).',
    'help.q3': 'Tôi có thể đổi ngôn ngữ không?',
    'help.a3': 'Có. Bạn có thể chuyển giữa VI/EN ở thanh điều hướng.',
    'common.languageVI': 'VI',
    'common.languageEN': 'EN'
  },
  en: {
    'navbar.about': 'Life at Vuman',
    'navbar.jobs': 'Jobs',
    'navbar.candidate': 'Candidate Home',
    'navbar.kanban': 'Kanban',
    'navbar.manageWork': 'Work Management',

    'menu.profile': 'Profile',
    'menu.settings': 'Settings',
    'menu.help': 'Help',
    'menu.changePassword': 'Change password',

    'theme.dark': 'Dark mode',
    'theme.light': 'Light mode',

    'profile.title': 'My Profile',
    'profile.subtitle': 'Account information (read-only)',
    'profile.email': 'Email',
    'profile.fullName': 'Full name',
    'profile.role': 'Role',
    'role.candidate': 'candidate',
    'role.hr': 'hr',
    'role.admin': 'admin',

    'settings.title': 'Settings',
    'settings.subtitle': 'UI and language preferences',
    'settings.language': 'Language',
    'settings.accountInfo': 'Account information',

    'help.title': 'Help (FAQ)',
    'help.subtitle': 'Frequently asked questions',
    'help.q1': 'How can I withdraw an application?',
    'help.a1': 'Go to the Candidate page, select the applied job and click “Withdraw”.',
    'help.q2': 'What can HR/Admin see on “Review Application”?',
    'help.a2': 'HR/Admin can view the full application form data and HR notes (read-only for review).',
    'help.q3': 'Can I change the language?',
    'help.a3': 'Yes. Use the language switch in the navigation bar.',
    'common.languageVI': 'VI',
    'common.languageEN': 'EN'
  }
}

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('vi')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(I18N_STORAGE_KEY)
      if (stored === 'vi' || stored === 'en') setLang(stored)
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback(
    (key) => {
      const v = dict[lang]?.[key]
      if (v !== undefined) return v
      return dict.vi[key] || key
    },
    [lang]
  )

  const setLanguage = useCallback((nextLang) => {
    if (nextLang !== 'vi' && nextLang !== 'en') return
    setLang(nextLang)
    try {
      window.localStorage.setItem(I18N_STORAGE_KEY, nextLang)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(() => ({ lang, t, setLanguage }), [lang, t, setLanguage])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

