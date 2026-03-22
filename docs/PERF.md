# Hiệu năng FE — checklist A / B / C

## A — Debounce + Deferred

| Vị trí | Debounce 280ms | `useDeferredValue` | Ghi chú |
|--------|----------------|-------------------|---------|
| `JobListPage` (từ khóa) | `useDebouncedValue` | Trên giá trị đã debounce | Lọc client; API `/jobs` vẫn 1 lần khi vào trang |
| `JobManagementPage` (bộ phận) | `useDebouncedValue(filters.department)` | Trên `debouncedDepartment` | `GET /jobs/all` **không** gọi theo từng ký tự |

Hook: `client/src/hooks/useDebouncedValue.js`.

## B — Virtualization

- Trang demo: **`/demo/virtualization`** (lazy load).
- Thư viện: `react-window` v2 (`List` + `rowComponent`).
- ~6000 dòng: chế độ **Map** vs **Virtualized** để so sánh scroll / Profiler.

## C — Code splitting theo route

- `AppRouter.jsx`: `React.lazy` + `Suspense` + `RoutePageFallback`.
- Trang chưa mở không tải JS tương ứng (xem `npm run build` — nhiều chunk `*-*.js`).

Liên kết nhanh từ footer danh sách việc làm → demo virtualization.
