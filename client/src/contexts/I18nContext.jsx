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
    'help.q4': 'Tôi xem nhiệm vụ của mình ở đâu và nộp file như thế nào?',
    'help.a4':
      'Vào trang ứng viên (`/candidate`). Ở mục “Nhiệm vụ của tôi” bạn sẽ thấy danh sách task. Bấm từng dòng để mở chi tiết, chọn loại giấy tờ và tải lên file để nộp.',
    'help.q5': 'Tôi xem lịch phỏng vấn / thông tin cập nhật mới ở đâu?',
    'help.a5':
      'Theo dõi chuông thông báo trên thanh menu. Bấm vào thông báo để chuyển tới trang “Xem lại đơn đăng ký” và cuộn tới đúng khu vực có cập nhật (trạng thái hoặc lịch phỏng vấn).',
    'help.q6': 'Tôi có thể nhắn HR qua kênh nào?',
    'help.a6':
      'Trên trang “Xem lại đơn đăng ký”, bạn có thể nhắn HR bằng bong bóng chat ở góc dưới bên phải màn hình (tin nhắn gắn với đúng hồ sơ ứng tuyển).',
    'help.q7': 'Tôi được phép tải những loại file nào cho task?',
    'help.a7': 'Hiện hệ thống chấp nhận các định dạng: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`.',
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
    'help.q4': 'Where can I see my tasks and upload documents?',
    'help.a4':
      'Open the Candidate page (`/candidate`). In “My Tasks”, click a task row to expand details, choose the document type, then upload the file to submit.',
    'help.q5': 'Where do I find interview schedules / latest updates?',
    'help.a5':
      'Use the notification bell in the top menu. Click a notification to go to “Review Application” and scroll to the exact updated section (status or interview schedule).',
    'help.q6': 'How can I message HR?',
    'help.a6':
      'On the “Review Application” page, use the chat bubble at the bottom-right corner to message HR (messages are tied to your application).',
    'help.q7': 'What file types are allowed for task uploads?',
    'help.a7': 'The system currently accepts: `.pdf`, `.doc`, `.docx`, `.png`, `.jpg`, `.jpeg`.',
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

