# Admin Dashboard – Implementation Plan

Membangun Admin Dashboard lengkap di atas project Next.js 16 (App Router) + Tailwind CSS v4 yang sudah ada. Dashboard mencakup: Login, Overview, Transactions, dan Device Logs.

## Proposed Changes

---

### 1. Dependencies

Install:
- `axios` – HTTP client
- `lucide-react` – Modern icon set
- `clsx` – Conditional classNames utility

---

### 2. Styling & Global CSS

#### [MODIFY] [globals.css](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/globals.css)
- Extend with CSS custom properties for sidebar width, card shadows, etc.
- Add smooth transitions, scrollbar styles, and animation keyframes.

---

### 3. Auth Layer

#### [NEW] [auth.ts](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/lib/auth.ts)
- `login(username, password)` → hits `POST /login`, stores token in localStorage
- `logout()` → clears token
- `getToken()` / `isAuthenticated()` helpers

#### [NEW] [api.ts](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/lib/api.ts)
- Axios instance with base URL from `process.env.NEXT_PUBLIC_API_URL`
- Request interceptor yang auto-inject Authorization header
- Response interceptor untuk handle 401 → redirect login

#### [NEW] [useAuth.ts](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/hooks/useAuth.ts)
- Hook: `{ user, login, logout, isAuthenticated, loading }`

#### [NEW] [useFetch.ts](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/hooks/useFetch.ts)
- Generic data fetch hook: `{ data, loading, error, refetch }`

#### [NEW] [middleware.ts](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/middleware.ts)
- Proteksi semua route `/dashboard/*`
- Jika tidak ada token di cookie → redirect ke `/login`

---

### 4. Login Page

#### [NEW] [page.tsx](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/login/page.tsx)
- Form login (username + password)
- Validation + error message
- Loading state on submit
- On success → redirect ke `/dashboard`

---

### 5. Dashboard Layout & Components

#### [MODIFY] [layout.tsx](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/layout.tsx)
- Update metadata title → "NanoVest Admin"
- Add dark mode class support

#### [NEW] [Sidebar.tsx](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/components/Sidebar.tsx)
- Logo + nav links (Dashboard, Transactions, Device Logs)
- Active route highlight
- Logout button di bottom

#### [NEW] [Header.tsx](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/components/Header.tsx)
- Page title + breadcrumb
- User avatar + nama
- Dark mode toggle

#### [NEW] [layout.tsx (dashboard)](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/dashboard/layout.tsx)
- Shell: `<Sidebar>` + `<main>`

#### [NEW] UI Components (`src/components/ui/`):
- `Button.tsx` – variant: primary, secondary, ghost, danger
- `Card.tsx` – container dengan shadow + rounded-2xl
- `Badge.tsx` – status badge (success/error/warning/info)
- `Spinner.tsx` – loading spinner
- `Toast.tsx` + `ToastProvider.tsx` – toast notifications
- `StatCard.tsx` – summary card (icon, title, value, change)
- `DataTable.tsx` – reusable table dengan column config, loading skeleton, empty state

---

### 6. Dashboard Overview Page

#### [NEW] [page.tsx (dashboard)](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/dashboard/page.tsx)
- 4 stat cards (total transaksi, device logs hari ini, error logs, active devices)
- Recent transactions preview table
- Quick nav cards ke Transactions & Logs
- Chart sederhana (opsional, Recharts)

---

### 7. Transactions Page

#### [NEW] [page.tsx (transactions)](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/dashboard/transactions/page.tsx)
- Full table: Transaction ID, Amount, Date, Status
- Search bar + status filter dropdown
- Pagination (client-side)
- Loading skeleton
- Error state dengan retry button
- Data dari `POST /data` dengan mock fallback untuk development

---

### 8. Device Logs Page

#### [NEW] [page.tsx (logs)](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/dashboard/logs/page.tsx)
- Tabel: Device ID, Timestamp, Status/Message
- Error rows highlight merah
- Auto-refresh polling tiap 5 detik (dengan countdown indicator)
- Manual refresh button
- Filter by status (all/error/ok)
- Data dari `POST /data` dengan mock fallback

---

### 9. Redirect

#### [MODIFY] [page.tsx (root)](file:///Users/fathoniwasesojati/Documents/nanovest/learn-next/src/app/page.tsx)
- Redirect ke `/dashboard` (atau `/login` jika belum auth)

---

## API Integration

| Endpoint | Method | Digunakan di |
|---|---|---|
| `/login` | POST | Login page |
| `/data` | POST | Transactions & Logs page |

Jika API belum tersedia, mock data akan otomatis digunakan (dev-friendly).

---

## Verification Plan

### Automated (Dev Server Check)
```bash
cd /Users/fathoniwasesojati/Documents/nanovest/learn-next
npm run dev
```
Server harus berjalan di http://localhost:3000 tanpa error.

### Manual Browser Testing
1. **Login flow** – Buka http://localhost:3000 → harus redirect ke `/login` → login dengan credentials dummy → masuk `/dashboard`
2. **Auth protection** – Buka http://localhost:3000/dashboard tanpa login → harus redirect ke `/login`
3. **Dashboard** – Stat cards tampil, quick nav bisa diklik
4. **Transactions** – Table muncul dengan data, search & filter berfungsi, pagination bekerja
5. **Device Logs** – Table muncul, error rows berwarna merah, countdown refresh terlihat, manual refresh berfungsi
6. **Logout** – Klik logout → redirect ke `/login`, akses `/dashboard` kembali di-redirect ke login
