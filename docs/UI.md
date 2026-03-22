You are a Senior Fullstack Engineer + UI Developer.

PIXEL-PERFECT REFERENCE: Marvell Careers (Workday ATS)
Rebuild ALL frontend pages to match exactly. Extract and apply every detail below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN TOKENS — Apply globally in index.css
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

:root {
  /* Brand */
  --color-primary: #0d6e56;        /* teal — buttons, links, active */
  --color-primary-hover: #0a5a46;
  --color-secondary: #1a73e8;      /* blue — "Dùng hồ sơ lần trước" button only */

  /* Backgrounds */
  --bg-page: #f3f3f1;              /* light warm gray — page background */
  --bg-white: #ffffff;
  --bg-input-focus: #e8f0fe;       /* blue-tinted — input on focus */
  --bg-nav: #ffffff;
  --bg-hero-overlay: rgba(0,0,0,0.0); /* hero uses real image, no overlay */

  /* Text */
  --text-primary: #1c1c1c;
  --text-secondary: #555555;
  --text-muted: #767676;
  --text-link: #1c1c1c;            /* job title links = dark, underlined */
  --text-link-nav: #1c1c1c;        /* nav links = dark */
  --text-required: #cc0000;        /* required asterisk */

  /* Border */
  --border-light: #e0e0e0;         /* 0.5px dividers between job items */
  --border-input: #cccccc;         /* input borders */
  --border-card: #e0e0e0;          /* card borders */

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-base: 14px;
  --font-size-sm: 13px;
  --font-size-xs: 12px;
  --font-size-nav: 14px;
  --font-size-hero-title: 28px;
  --font-size-job-title: 15px;
  --font-size-section-title: 22px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-input: 4px;
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 1 — Navbar (components/common/Navbar.jsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: flex, space-between, height 56px, bg white, border-bottom 1px solid #e0e0e0
Padding: 0 32px

Left side:
  - Logo: square bracket icon [M] style — use SVG square bracket
  - Brand text: "Vuman Careers" — font-size 16px, font-weight 600, color #1c1c1c
  - Logo + text gap: 10px

Right side (logged out):
  - "Cuộc sống tại Vuman"  font-size 14px, color #1c1c1c
  - "Tìm việc làm"         font-size 14px, color #1c1c1c
  - Gap between links: 32px

Right side (logged in — additional):
  - ⚙ icon + "Cài đặt" text — gray, font-size 13px
  - Separator "|"
  - 👤 icon + email — font-size 13px, color #1c1c1c
  - Then: "Cuộc sống tại Vuman" | "Tìm việc làm" | "Trang ứng viên"
  - All links: no underline, hover: underline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 1 — Login Page (pages/auth/LoginPage.jsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page bg: #f3f3f1

Hero section:
  - Full-width image banner (circuit board photo — use gradient fallback if no image)
  - Fallback: background: linear-gradient(to right, #1a1a2e 50%, #0d6e56)
  - Height: 160px
  - Text overlay right side: "Công nghệ xuất sắc, tầm nhìn vượt trội™"
    font-size: 26px, font-weight: 700, color: white
    position: absolute right 10%, vertically centered

Form card:
  - bg: white
  - border: 1px solid #e0e0e0
  - border-radius: 8px
  - padding: 32px 40px
  - width: 440px
  - margin: 32px auto
  - box-shadow: none (flat)

Form title: "Đăng nhập"
  - font-size: 20px, font-weight: 700, text-align: center, margin-bottom: 24px

Labels:
  - font-size: 13px, font-weight: 400, color: #1c1c1c
  - Required star: color #cc0000, margin-left: 2px

Inputs:
  - height: 40px, padding: 8px 12px
  - border: 1px solid #cccccc
  - border-radius: 4px
  - font-size: 14px
  - bg: white
  - On focus: background: #e8f0fe, border-color: #0d6e56, outline: none

Primary button "Đăng nhập":
  - width: 100%, height: 44px
  - background: #0d6e56
  - color: white
  - border: none, border-radius: 4px
  - font-size: 15px, font-weight: 600
  - cursor: pointer
  - hover: background: #0a5a46

Footer links (centered, below button):
  - "Chưa có tài khoản? Tạo tài khoản" — link color: #0d6e56
  - "Quên mật khẩu?" — color: #0d6e56, margin-top: 8px
  - font-size: 13px

Social section (below card):
  - "Theo dõi chúng tôi" — font-size: 13px, color: #767676, text-align: center
  - Social icons row: YouTube, LinkedIn, Facebook, Glassdoor, X
  - Icons: font-size 20px, color #767676, gap: 16px

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 2 — Job List Page (pages/public/JobListPage.jsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hero: same as login hero (full-width image, 160px height, text overlay)

Search section (nền TRẮNG, không phải hero):
  - bg: white, padding: 20px 32px
  - border-bottom: 1px solid #e0e0e0
  - Search bar row:
    - Search icon (magnifier) inside input left padding
    - Input: "Tìm kiếm việc làm hoặc từ khóa"
      flex: 1, height: 40px, border: 1px solid #cccccc, border-radius: 4px
      padding-left: 36px (for icon)
    - Button "Tìm kiếm": teal, height: 40px, padding: 0 20px,
      border-radius: 4px, font-weight: 600, margin-left: 8px
  - Filter row (margin-top: 12px):
    - Buttons: "Loại hình ▾" "Bộ phận ▾" "Địa điểm ▾" "Thêm ▾"
    - Style: bg white, border: 1px solid #cccccc, border-radius: 4px,
      padding: 6px 12px, font-size: 13px, color: #1c1c1c,
      hover: border-color #0d6e56
    - Gap: 8px between filter buttons

Body layout:
  - Page bg: #f3f3f1
  - Max-width: 1200px, margin: 0 auto, padding: 24px 32px
  - Grid: 2 columns — main content (flex:1) + sidebar (300px fixed)
  - Gap: 24px

Main content (job list):
  - Count label: "468 VỊ TRÍ TÌM THẤY"
    font-size: 13px, font-weight: 600, color: #1c1c1c
    margin-bottom: 8px, text-transform: uppercase, letter-spacing: 0.5px

  - Job list container: bg white, border: 1px solid #e0e0e0, border-radius: 4px
  - Each job item:
    - padding: 16px 20px
    - border-bottom: 1px solid #e0e0e0 (divider, NOT card border)
    - last item: no border-bottom
    - hover: background #f8f8f6

  - Job title: font-size 15px, color #1c1c1c, font-weight 400
    text-decoration: underline (like a link), cursor: pointer
    hover: color #0d6e56

  - Meta items (location, date):
    - Icon + text format, font-size: 13px, color: #767676
    - Location icon: 📍 (or SVG pin)
    - Clock icon: 🕐 (or SVG clock)
    - Display: block, margin-top: 6px each
    - Gap between icon and text: 6px

  - Job ID: font-size: 13px, color: #767676, margin-top: 4px

Sidebar (300px):
  - bg: white, border: 1px solid #e0e0e0, border-radius: 4px, padding: 20px
  - Logo (text or SVG): Vuman logo, margin-bottom: 16px
  - Heading: "Không tìm thấy vị trí phù hợp?"
    font-size: 15px, font-weight: 500, color: #1c1c1c
  - Body text: font-size: 13px, color: #767676, line-height: 1.5
  - Optional: image of team (can be placeholder bg-gray block 120px height)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 3 — Job Detail (right slide panel or full page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: slide-in panel from right OR dedicated page at /jobs/:id
Width: 480px if panel, full-page if route

Top section (sticky):
  - Job title: font-size: 22px, font-weight: 700, color: #1c1c1c
    + external link icon ↗ (gray, 14px)
  - "Ứng tuyển" button: bg #0d6e56, color white, padding: 8px 20px,
    border-radius: 4px, font-weight: 600, margin-top: 8px
  - Divider: 1px solid #e0e0e0 below button

Meta grid (below divider):
  - 2-column grid layout
  - Each item: icon (gray, 16px) + label text
    - 📍 Địa điểm: Hồ Chí Minh
    - 💼 Loại: Toàn thời gian
    - 🕐 Ngày đăng: 18 ngày trước
    - 🗒 Mã JD: 2503821
  - font-size: 14px, color: #555555, gap: 12px
  - Column 1: location | Column 2: type, date, ID

Body (scrollable):
  - font-size: 14px, color: #1c1c1c, line-height: 1.7
  - Section headers: font-weight: 700, margin-top: 20px
  - Paragraphs: margin-bottom: 12px

Close button (top-right):
  - Circle X button: border: 2px solid #cccccc, border-radius: 50%
  - size: 32px, color: #555, hover: border-color #0d6e56

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 4 — Apply Modal (components/application/ApplyModal.jsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overlay: rgba(0,0,0,0.5) full screen
Modal card:
  - bg: white, border-radius: 8px
  - padding: 32px 28px
  - width: 480px, max-width: 90vw

Close button: top-right corner
  - circle, border: 2px solid #1a73e8, color: #1a73e8
  - size: 32px, border-radius: 50%
  - X icon inside, font-size: 16px

Title: "Bắt đầu hồ sơ ứng tuyển"
  font-size: 20px, font-weight: 700, color: #1c1c1c, margin-bottom: 8px

Job name subtitle:
  font-size: 14px, color: #555555, margin-bottom: 24px

Button 1 — "Nộp hồ sơ mới":
  - width: 100%, height: 48px
  - bg: #0d6e56, color: white
  - border-radius: 4px, font-size: 15px, font-weight: 600
  - margin-bottom: 12px

Divider: 1px solid #e0e0e0 full-width

Button 2 — "Dùng hồ sơ lần trước":
  - width: 100%, height: 48px
  - bg: #1a73e8, color: white
  - border-radius: 4px, font-size: 15px, font-weight: 600
  - margin-top: 12px
  - Only show if candidate has previous application

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREEN 5 — Apply Form Stepper (pages/public/ApplyPage.jsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page bg: white (form area is white, NOT gray)
Max-width: 900px, margin: 0 auto, padding: 24px 32px

Back link (top-left):
  - "← Quay lại tin tuyển dụng"
  - font-size: 13px, color: #0d6e56, text-decoration: none
  - ← arrow + text, no underline, hover: underline

Job title: font-size: 20px, font-weight: 400, color: #1c1c1c, margin-bottom: 24px

Stepper:
  - Horizontal line connecting dots: 1px solid #cccccc
  - Dots: circle 12px diameter
    - Default: border: 2px solid #cccccc, bg: white
    - Active: bg: #cc0044 (pink-red), border: #cc0044 — FILLED circle, NO number
    - Completed: bg: #0d6e56, border: #0d6e56
  - Labels below dots:
    - Default: font-size: 12px, color: #767676
    - Active: font-size: 12px, color: #1c1c1c, font-weight: 500
  - Steps: Thông tin của tôi | Kinh nghiệm | Câu hỏi ứng tuyển | Thông tin tự nguyện | Xem lại
  - Stepper takes full width, steps evenly spaced

Section title: "Thông tin của tôi"
  - font-size: 22px, font-weight: 700, text-align: center, margin: 24px 0

Required note: "* Cho biết đây là trường bắt buộc"
  - font-size: 13px, color: #555555
  - * in color: #cc0000

Form fields:
  Labels:
    - font-size: 13px, color: #1c1c1c, font-weight: 400
    - Required *: color #cc0000, font-size: 13px
    - Display: block, margin-bottom: 4px

  Inputs + Selects:
    - height: 40px, width: 400px (NOT full width — match Workday style)
    - border: 1px solid #cccccc
    - border-radius: 4px
    - padding: 8px 12px
    - font-size: 14px, color: #1c1c1c
    - Select: has dropdown arrow ▾ on right side

  Select "Bạn biết đến chúng tôi qua đâu?" options:
    Chọn một | LinkedIn | Facebook | Giới thiệu từ bạn bè | Website công ty | Khác

  Select "Quốc gia" — default: Việt Nam

Section divider: <hr> 1px solid #e0e0e0, margin: 28px 0

Sub-section headers (e.g. "Họ và tên hợp lệ"):
  - font-size: 16px, font-weight: 700, color: #1c1c1c, margin-bottom: 16px

Name fields (show all 4):
  - "Họ (tiếng Việt)" — optional
  - "Tên (tiếng Việt)" — optional
  - "Họ (chữ Latin) *" — required
  - "Tên (chữ Latin) *" — required
  - Each field stacked vertically (NOT 2-column grid), width: 400px

Contact section (below another <hr>):
  - "Thông tin liên hệ" sub-header
  - Email field (pre-filled if logged in), read-only style
  - Phone field

Fixed footer bar:
  - bg: white, border-top: 1px solid #e0e0e0
  - padding: 16px 32px
  - position: sticky, bottom: 0
  - justify-content: flex-end
  - Button "Lưu và tiếp tục":
    - bg: #0d6e56, color: white
    - padding: 10px 24px, border-radius: 4px
    - font-size: 14px, font-weight: 600
    - hover: #0a5a46

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPLEMENTATION NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Page background: #f3f3f1 (warm light gray) for job list page
   White background for login, apply form pages

2. NO card shadows anywhere — completely flat design

3. Job list uses DIVIDERS not individual cards
   → One white container, items separated by border-bottom lines

4. Stepper active dot = PINK-RED #cc0044 (not teal, not blue)
   This is exact Workday behavior — active = where you ARE (pink)
   Completed = where you've BEEN (teal)

5. Input width on apply form = 400px fixed (not 100%)
   This matches Workday's form layout — content-width inputs

6. Hero uses real image when available
   Fallback: linear-gradient(to right, #1a1a2e 55%, #0a6e54)

7. All text Vietnamese per rules.md Section 17
   Do NOT leave any English placeholder text

8. Font: use system font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI')
   NOT Google Fonts — matches Workday's native feel

Update files:
- client/src/index.css (global tokens)
- client/src/App.css (layout)
- client/src/components/common/Navbar.jsx
- client/src/pages/auth/LoginPage.jsx (create if not exists)
- client/src/pages/public/JobListPage.jsx
- client/src/pages/public/JobDetailPage.jsx
- client/src/pages/public/ApplyPage.jsx
- client/src/components/application/ApplyModal.jsx

After implementing: take screenshot or describe what matches/doesn't match
the 5 reference images. Report any deviations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6.8 UI/UX Improvements — Polish Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI/UX (Improvement Phase) ✅
1. Loading states chi tiết
   - Spinner cho nút khi hành động đang chạy (ví dụ: `ApplyPage`)
   - Skeleton screens cho vùng danh sách khi đang tải
2. Skeleton screens
   - Implement `SkeletonText`, `SkeletonCard`, `SkeletonTable`
3. Error boundaries
   - Add `ErrorBoundary` bọc `AppRouter` tại `client/src/App.jsx`
4. Empty states
   - Implement `EmptyState` (icon + title + description) cho các trường hợp rỗng
5. Responsive design hoàn thiện
   - Tôn trọng breakpoint có sẵn trong `client/src/App.css`
6. Dark mode
   - Theme toggle ở `Navbar`
   - Dùng CSS variables với `html[data-theme="dark"]`
7. Animations
   - Entry animation `ui-page-enter`
   - Respect `prefers-reduced-motion` (tắt animation/shimmer/spinner)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Additional Features — Account UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1) Profile page
   - Route: `/profile`
   - Hiển thị thông tin tài khoản (read-only)

2) Settings page
   - Route: `/settings`
   - Hiển thị ngôn ngữ (VI/EN) và tóm tắt tài khoản

3) Help/FAQ page
   - Route: `/help`
   - Hiển thị danh sách FAQ dạng accordion

4) Multi-language support (VI/EN) for:
   - Menu: các link `Profile / Settings / Help`
   - Header: theme/language toggle và menu dropdown
   - Account pages: giữ nguyên tiếng Việt (không đổi theo ngôn ngữ)

Update files:
- client/src/contexts/I18nContext.jsx
- client/src/pages/account/ProfilePage.jsx
- client/src/pages/account/SettingsPage.jsx
- client/src/pages/account/HelpPage.jsx
- client/src/router/AppRouter.jsx
- client/src/components/common/Navbar.jsx