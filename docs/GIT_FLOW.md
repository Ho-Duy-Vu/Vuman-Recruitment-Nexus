## Git Flow (Release / Develop / Feature)

Repo này sử dụng Git Flow tối giản để phù hợp phát triển sản phẩm (production) và release theo phiên bản.

### Nhánh chính

- **`main`**: nhánh production. Chỉ nhận code đã sẵn sàng release.
- **`develop`**: nhánh tích hợp (integration). Tất cả feature merge vào đây trước khi tạo release.

### Nhánh làm việc

- **`feature/<slug>`**: phát triển tính năng mới
  - Ví dụ: `feature/hr-job-management`, `feature/workday-job-detail-ui`
- **`release/<version>`**: chuẩn bị release từ `develop`
  - Ví dụ: `release/v0.1.1`
- **`hotfix/<version>-<slug>`**: sửa lỗi khẩn cấp trực tiếp từ `main`
  - Ví dụ: `hotfix/v0.1.1-fix-login-refresh`

### Quy tắc đặt tên

- **slug** dùng `kebab-case`, ngắn gọn, mô tả mục tiêu.
- version theo **SemVer**: `vMAJOR.MINOR.PATCH`
  - `MAJOR`: thay đổi lớn/không tương thích
  - `MINOR`: thêm tính năng (tương thích)
  - `PATCH`: bugfix nhỏ

### Quy trình làm việc (Feature → Develop)

1. Tạo nhánh feature từ `develop`

```bash
git checkout develop
git pull
git checkout -b feature/<slug>
```

2. Commit theo từng phần nhỏ, message rõ ràng.
3. Mở PR về `develop`
4. PR yêu cầu:
   - build/test pass (nếu có)
   - review (ít nhất 1 người)
   - không commit `.env`/secrets

### Quy trình Release (`develop` → `release/*` → `main`)

1. Khi `develop` ổn định, tạo nhánh release:

```bash
git checkout develop
git pull
git checkout -b release/vX.Y.Z
```

2. Chỉ cho phép:
   - bugfix nhỏ
   - cập nhật version/changelog/docs
   - không thêm feature mới

3. Mở PR `release/vX.Y.Z` → `main`
4. Merge vào `main` và tag phiên bản:

```bash
git checkout main
git pull
git tag vX.Y.Z
git push --tags
```

5. Merge ngược `main` → `develop` để đồng bộ:

```bash
git checkout develop
git pull
git merge main
```

### Quy trình Hotfix (`main` → `hotfix/*` → `main` + `develop`)

1. Tạo nhánh hotfix từ `main`

```bash
git checkout main
git pull
git checkout -b hotfix/vX.Y.Z-<slug>
```

2. Fix + test
3. PR hotfix → `main`, sau khi merge thì tag `vX.Y.Z`
4. Merge ngược `main` → `develop`

### Gợi ý cấu hình bảo vệ nhánh (GitHub)

- Protect `main`:
  - Require PR review
  - Require status checks (tests/lints)
  - Disallow force push
- Protect `develop`:
  - Require status checks (tối thiểu tests)

