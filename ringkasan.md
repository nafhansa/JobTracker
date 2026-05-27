# JobTracker - Ringkasan Lengkap Aplikasi

## Apa itu JobTracker?

**JobTracker** adalah platform SaaS (Software as a Service) **multi-purpose** yang membantu pengguna melacak **lamaran pekerjaan**, **klien/proyek freelance**, dan menghasilkan dokumen karir menggunakan **AI Writer**. Aplikasi ini menggantikan spreadsheet berantakan dengan dashboard visual canggih, mendukung tiga mode utama: **Job Tracker**, **Client Tracker**, dan **AI Writer (JPS)**.

---

## Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 16.2.5 | React framework dengan App Router |
| **React** | 19.2.3 | Library UI |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Styling dengan CSS variables |
| **Radix UI** | - | Headless UI components (dialog, dropdown, tooltip, dll.) |
| **Lucide React** | - | Icon library |
| **Recharts** | - | Charts dan visualisasi data |
| **Framer Motion** | - | Animasi transisi |
| **TipTap** | - | Rich text editor (AI Writer) |
| **date-fns** | - | Manipulasi tanggal |
| **Sonner** | - | Toast notifications |
| **Canvas Confetti** | - | Animasi perayaan |

### Backend & Database
| Teknologi | Kegunaan |
|-----------|----------|
| **Firebase** | Authentication (Google OAuth), Firestore (analytics), Admin SDK |
| **Supabase** | Database utama (PostgreSQL), polling-based real-time sync |
| **Next.js API Routes** | Server-side logic, webhooks, AI generation |

### AI & Generation
| Teknologi | Kegunaan |
|-----------|----------|
| **Anthropic Claude API** | Engine AI Writer untuk generate dokumen |

### Payment & Services
| Teknologi | Kegunaan |
|-----------|----------|
| **Midtrans** | Payment gateway Indonesia (BCA, Mandiri, GoPay, dll.) |
| **PayPal** | Pembayaran internasional |
| **Google APIs** | OAuth, Gmail integration |
| **PostHog** | Analytics & user tracking |
| **Meta Pixel** | Facebook conversion tracking |

---

## Struktur Aplikasi

```
src/
├── app/                              # Next.js App Router pages
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   ├── login/page.tsx                # Login Google OAuth
│   ├── dashboard/
│   │   ├── page.tsx                  # Dashboard utama (triple mode)
│   │   └── billing/page.tsx          # Manajemen billing & subscription
│   ├── jps-shop/page.tsx             # AI Writer coin shop
│   ├── pricing/page.tsx              # Halaman harga (publik)
│   ├── upgrade/page.tsx              # Halaman upgrade (auth required)
│   ├── admin/page.tsx                # Admin dashboard
│   ├── onboarding/
│   │   ├── page.tsx                  # Redirect ke language selection
│   │   ├── language/page.tsx         # Pilih bahasa
│   │   └── questions/page.tsx        # Kuesioner role & preferensi
│   ├── payment/
│   │   ├── midtrans/page.tsx         # Halaman pembayaran Midtrans
│   │   ├── finish/page.tsx           # Konfirmasi pembayaran berhasil
│   │   ├── error/page.tsx            # Error pembayaran
│   │   └── unfinish/page.tsx         # Pembayaran tidak selesai
│   ├── terms-policy/page.tsx         # ToS, Privacy Policy, Cookie Policy
│   └── api/                          # 45+ API endpoints
│
├── components/
│   ├── ui/                           # 11 base UI components (Shadcn)
│   ├── landing/                      # 10 landing page sections
│   ├── ai-writer/                    # 18 AI Writer components
│   ├── freelance/                    # 4 freelance components
│   ├── tracker/                      # 3 job tracker components
│   ├── forms/                        # AddJobModal
│   ├── tutorial/                     # 3 tutorial components
│   └── [33 shared/layout components]
│
├── lib/
│   ├── firebase/                     # 8 file (auth, sync, admin)
│   ├── supabase/                     # 15 file (CRUD operations)
│   ├── ai/                           # AI generation, types, prompts, export
│   ├── language/context.tsx          # i18n (EN/ID) - 919 baris
│   ├── theme/context.tsx             # Theme management
│   ├── middleware/                   # Auth, rate-limit, webhook verify
│   ├── posthog/                      # Analytics integration
│   ├── meta-pixel/                   # Facebook tracking
│   ├── pricing-config.ts             # Konfigurasi harga & coin
│   └── midtrans-config.ts            # Payment gateway config
│
├── types/index.ts                    # Semua TypeScript interfaces
└── actions/gmail.ts                  # Gmail OAuth integration
```

---

## Halaman & Routing

### Halaman Publik
| Route | Deskripsi |
|-------|-----------|
| `/` | Landing page: hero, fitur, AI Writer showcase, FAQ, social proof, early bird CTA |
| `/login` | Google OAuth login dengan redirect handling |
| `/pricing` | Pricing plans dengan auto-detect currency (USD/IDR) |
| `/terms-policy` | ToS, Privacy Policy, Cookie Policy, Acceptable Use, No Refund |

### Halaman Terautentikasi
| Route | Deskripsi |
|-------|-----------|
| `/dashboard` | Dashboard utama (Job Tracker + Client Tracker + AI Writer) |
| `/dashboard/billing` | Manajemen subscription & billing |
| `/jps-shop` | Beli coin untuk AI Writer |
| `/upgrade` | Halaman upgrade plan |
| `/admin` | Admin panel (whitelist email) |

### Onboarding
| Route | Deskripsi |
|-------|-----------|
| `/onboarding` | Entry point → redirect ke language selection |
| `/onboarding/language` | Pilih bahasa (EN/ID) |
| `/onboarding/questions` | Kuesioner role & preferensi pekerjaan |

### Pembayaran
| Route | Deskripsi |
|-------|-----------|
| `/payment/midtrans` | Halaman proses Midtrans |
| `/payment/finish` | Pembayaran berhasil |
| `/payment/error` | Pembayaran gagal |
| `/payment/unfinish` | Pembayaran dibatalkan |

---

## API Routes (45+ Endpoints)

### AI Writer
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/ai/generate` | POST | Generate cover letter, cold email, DM, dll. (80 coin/generate) |
| `/api/ai/generations` | GET | Ambil riwayat dokumen yang di-generate |
| `/api/ai/credits` | GET | Saldo coin saat ini (weekly + purchased) |
| `/api/ai/credits/purchase` | POST | Beli coin via Midtrans |
| `/api/ai/company-info` | GET | Ekstrak info perusahaan dari URL |
| `/api/ai/profile` | POST | Simpan/update profil profesional user |
| `/api/ai/profile/extract-resume` | POST | Ekstrak data profil dari file resume |
| `/api/ai/export` | GET | Export dokumen ke DOCX/PDF |

### Job Tracker
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/jobs/add` | POST | Tambah lowongan baru |
| `/api/jobs/list` | GET | Ambil daftar lowongan |
| `/api/jobs/update` | POST | Update data lowongan |
| `/api/jobs/delete` | POST | Hapus lowongan |
| `/api/jobs/count` | GET | Jumlah total lowongan |

### Client Tracker
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/freelance/add` | POST | Tambah proyek freelance |
| `/api/freelance/list` | GET | Ambil daftar proyek |
| `/api/freelance/update` | POST | Update proyek |
| `/api/freelance/delete` | POST | Hapus proyek |
| `/api/freelance/count` | GET | Jumlah total proyek |

### Subscription
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/subscription/create` | POST | Mulai subscription bulanan |
| `/api/subscription/status` | GET | Status subscription aktif |
| `/api/subscription/cancel` | POST | Batalkan subscription |
| `/api/subscription/reactivate` | POST | Aktifkan kembali subscription |
| `/api/subscription/ensure-free` | POST | Buat free plan untuk user baru |

### Payment (Midtrans)
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/payment/midtrans/charge` | POST | Buat transaksi pembayaran |
| `/api/payment/midtrans/verify` | POST | Verifikasi pembayaran selesai |
| `/api/payment/midtrans/webhook` | POST | Handle callback Midtrans |
| `/api/payment/lifetime-availability` | GET | Cek ketersediaan slot lifetime |

### Analytics & Tracking
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/analytics/track` | POST | Track kunjungan & event |
| `/api/analytics/stats` | GET | Summary analytics |
| `/api/analytics/micro-conversion` | POST | Track micro-conversion (CTA, scroll, waktu) |

### User & Onboarding
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/users` | GET | Ambil profil user |
| `/api/users/sync` | POST | Sinkronisasi Firebase user ke Supabase |
| `/api/users/language` | POST | Set preferensi bahasa |
| `/api/onboarding` | POST | Simpan jawaban onboarding |
| `/api/onboarding/roles` | GET | Daftar role pekerjaan tersedia |

### Lainnya
| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/streaks` | GET | Streak lamaran user |
| `/api/streaks/increment` | POST | Increment streak |
| `/api/feedback` | POST | Submit feedback user |
| `/api/location/detect` | GET | Deteksi lokasi untuk pricing |
| `/api/admin/lifetime-purchases` | GET | Statistik pembelian lifetime (admin) |
| `/api/cron/reconcile-subscriptions` | POST | Rekonsiliasi status subscription |
| `/api/webhook` | POST | General webhook handler |

---

## Fitur Utama

### 1. Sistem Triple Mode (Job + Client + AI Writer)

Dashboard memiliki **tiga mode** yang bisa dialihkan melalui `TrackerModeSwitcher` di sidebar:

| Mode | Fungsi | Target User |
|------|--------|-------------|
| **Job Tracker** | Melacak lamaran pekerjaan | Pencari kerja |
| **Client Tracker** | Melacak klien & proyek freelance | Freelancer |
| **AI Writer (JPS)** | Generate dokumen karir dengan AI | Semua user |

Sidebar, bottom nav mobile, dan konten dashboard berubah otomatis sesuai mode aktif.

---

### 2. AI Writer (JPS - Job Prescription System)

Fitur paling baru — menghasilkan dokumen karir profesional menggunakan Anthropic Claude.

#### A. Tipe Dokumen yang Bisa Di-generate

| Tipe | Deskripsi |
|------|-----------|
| **Cover Letter** | Surat lamaran kerja profesional |
| **Cold Email** | Email penawaran diri ke recruiter/perusahaan |
| **Cold DM Instagram** | Pesan DM di Instagram untuk networking |
| **Cold Message WhatsApp** | Pesan WhatsApp untuk pendekatan profesional |
| **Cold Message LinkedIn** | InMail atau pesan koneksi LinkedIn |

#### B. Flow AI Writer (Multi-Step)

1. **AIWriterHome** → Tampilkan dokumen tersimpan sebelumnya + tombol buat baru
2. **TypeSelector** → Pilih tipe dokumen (cover letter, cold email, dll.)
3. **ChannelSelector** → Pilih channel komunikasi (email, LinkedIn, Instagram, WhatsApp)
4. **TargetSelector** → Isi nama target, perusahaan, role, URL perusahaan
5. **LanguageSelector** → Pilih bahasa output (EN/ID)
6. **CustomizeStep** → Pilih tone, format, intent pesan
7. **GeneratingView** → Loading state saat AI sedang generate
8. **GenerationOutput** → Tampilkan hasil generate dengan opsi copy/edit/export
9. **CreationDetail** → View & edit dokumen tersimpan

#### C. Fitur Kustomisasi

| Fitur | Pilihan |
|-------|---------|
| **Tone** | Professional, Formal, Friendly, Casual |
| **Format** | Full Letter, Body Only |
| **Intent** | Opportunistic Reach, Follow Up, Quick Call, Interview Thank You, Keep Warm |
| **Bahasa Output** | English, Bahasa Indonesia |

#### D. Rich Text Editor (TipTap)
- Bold, Italic, Underline
- Text alignment (left, center, right, justify)
- Editing penuh hasil generate sebelum copy/export

#### E. Sistem Coin

| Detail | Keterangan |
|--------|-----------|
| **Biaya per generate** | 80 coin |
| **Coin mingguan Free** | 240 coin/minggu (3x generate) |
| **Coin mingguan Pro** | 400 coin/minggu (5x generate) |
| **Reset** | Otomatis tiap minggu |

**Paket Coin (Pembelian Tambahan - IDR):**
| Paket | Coin | Harga | Setara |
|-------|------|-------|--------|
| **Jalur Doa** | 1.000 coin | Rp 10.000 | ~12x generate |
| **Mulai Panik** | 2.200 coin | Rp 20.000 | ~27x generate |
| **Budak Korporat** | 4.500 coin | Rp 40.000 | ~56x generate |

#### F. Fitur Tambahan AI Writer
- **Resume Parsing** — Upload resume, ekstrak data profil otomatis
- **Company Research** — Auto-fetch info perusahaan dari URL (misi, values, produk, berita)
- **Export DOCX/PDF** — Download hasil generate
- **Document History** — Semua dokumen tersimpan di dashboard AI Writer
- **Rate Limiting** — Proteksi per-user dari abuse
- **Professional Profile** — Form simpan data pengalaman, pendidikan, skills untuk konteks generate

---

### 3. Client Tracker (Manajemen Klien Freelance)

#### A. Dashboard Statistik Klien

| Fitur | Deskripsi |
|-------|-----------|
| **Total Income** | Jumlah `actual_price` (atau `potential_price` sebagai fallback) |
| **Total Clients** | Jumlah klien unik berdasarkan `client_name` distinct |
| **Average Rate** | Rata-rata income per proyek |
| **Monthly Income Chart** | Bar chart income 6 bulan terakhir (Recharts) |
| **Recent Projects** | 4 proyek terakhir dengan nama klien, tipe layanan, status |
| **Empty State** | "Track Your Clients" dengan tombol tambah jika belum ada data |

#### B. Manajemen Proyek Freelance

| Fitur | Deskripsi |
|-------|-----------|
| **Daftar Proyek** | Tampilan lengkap dengan pencarian & filter status (All/Ongoing/Completed/Cancelled) |
| **Tambah Proyek** | Form 2 langkah (Step 1: Client & Service, Step 2: Pricing & Timeline) |
| **Edit Proyek** | Update data proyek yang ada |
| **Hapus Proyek** | Konfirmasi dialog sebelum hapus |
| **Real-time Updates** | Polling-based sync untuk update data |

#### C. Form Tambah Proyek (2 Langkah)

**Step 1 — Client & Service:**
| Field | Tipe | Keterangan |
|-------|------|------------|
| Client Name | Text (required) | Nama klien |
| Client Contact | Text (optional) | Email/telepon klien |
| Service Type | Searchable Dropdown | 60+ preset: Web Dev, Mobile App, UI/UX Design, Content Writing, Video Editing, Consulting, dll. + "Other" untuk custom |
| Product/Deliverable | Searchable Dropdown | 60+ preset: Landing Page, E-commerce, Mobile App, Logo, Brand Identity, dll. + "Other" untuk custom |

**Step 2 — Pricing & Timeline:**
| Field | Tipe | Keterangan |
|-------|------|------------|
| Potential Price | Number (IDR) | Estimasi harga |
| Actual/Deal Price | Number (optional) | Harga deal, diisi saat deal closed |
| Status | Radio button | Ongoing / Completed / Cancelled |
| Start Date | Date picker | Tanggal mulai proyek |
| End Date | Date picker | Tanggal selesai proyek |
| Duration | Auto-calculated | Dihitung otomatis dari start & end date |

#### D. Kartu Proyek (FreelanceJobCard)
- Nama klien dengan ikon Building
- Tag tipe layanan & produk deliverable
- Badge status: Ongoing (kuning), Completed (hijau), Cancelled (merah)
- Harga: `actual_price` tampil utama, `potential_price` dicoret jika ada actual
- Rentang tanggal & durasi (hari)
- Info kontak klien
- Tombol Edit & Hapus

#### E. Statistik Freelance Detail (FreelanceStats)
- Total Income / Total Clients / Average Rate
- Monthly Income Chart (12 bulan, Recharts bar chart)
- Project Status Breakdown: distribusi Ongoing/Completed/Cancelled dengan warna

---

### 4. Job Tracker (Manajemen Lamaran Kerja)

| Fitur | Deskripsi |
|-------|-----------|
| **Tambah/Edit/Hapus Lowongan** | Judul, perusahaan, industri, gaji, email recruiter, tipe pekerjaan, lokasi, sumber |
| **Tracking Status** | Applied → Emailed → CV Responded → Interview → Contract/Offer |
| **Tandai Ditolak** | Rejected flag + simpan riwayat progres |
| **Sumber Lowongan** | LinkedIn, Indeed, Glassdoor, Kalibrr, Glints, Upwork, dll. |
| **Tipe Pekerjaan** | Full Time, Part Time, Contract, Internship |
| **Tipe Lokasi** | Remote/WFH, On-site/WFO, Hybrid |
| **Pencarian & Filter** | Filter status, cari judul/perusahaan |
| **Paginasi** | 6 lowongan per halaman |

---

### 5. Dashboard & Statistik (Job Mode)

| Fitur | Deskripsi |
|-------|-----------|
| **Interview Rate** | Persentase lamaran yang mencapai interview |
| **Total Lamaran** | Jumlah semua lowongan tercatat |
| **Daily Streak** | Gamifikasi hari berturut-turut aktivitas |
| **Grafik Pertumbuhan** | Area chart tren lamaran (harian/mingguan/bulanan) |
| **Aktivitas Terbaru** | 5 lowongan terakhir ditambahkan |
| **Statistik Lowongan** | Pie chart sumber lowongan, bar chart tipe pekerjaan, distribusi lokasi, funnel tahapan |

---

### 6. Sistem Subscription & Pricing

#### Detail Pricing Plans

| Plan | Harga USD | Harga IDR | Harga Asli | Diskon | Periode |
|------|-----------|-----------|------------|--------|---------|
| **Free** | $0 | Rp 0 | - | - | Selamanya |
| **Monthly Pro** | $2.66/bulan | Rp 31.988/bulan | $2.99 / Rp 36.000 | 11.13% | Bulanan (auto-renewal) |
| **Lifetime Pro** | $7.16 | Rp 51.988 | $7.99 / Rp 58.000 | 10.36% | Sekali bayar |

#### Perbandingan Fitur per Plan

| Fitur | Free | Monthly Pro | Lifetime Pro |
|-------|------|-------------|--------------|
| Job applications | Maks 10 | Unlimited | Unlimited |
| Client Tracker | Maks 10 | Unlimited | Unlimited |
| AI Writer (weekly coin) | 240/minggu | 400/minggu | 400/minggu |
| Smart Filters | Basic | ✓ | ✓ |
| Deadline Reminders | - | ✓ | ✓ |
| Email Support | - | Priority | Priority |
| Supporter Badge | - | - | ✓ |
| Ownership Model | - | Sewa bulanan | Pay Once, Own Forever |

#### Scarcity & Urgency
- **Lifetime Access** dibatasi **20 slot** (`LIFETIME_ACCESS_LIMIT = 20`)
- Progress bar slot tersisa
- Warning banner "Lifetime Access Habis" jika slot habis
- Twitter Share sebagai gate sebelum pembelian Lifetime
- Countdown timer Early Bird pricing

#### Lokalisasi Harga
- Auto-detect lokasi user (Indonesia vs internasional)
- IDR untuk user Indonesia, USD untuk internasional

---

### 7. Sistem Pembayaran

| Fitur | Keterangan |
|-------|------------|
| **Midtrans** | Payment gateway utama Indonesia (BCA, Mandiri, BNI, GoPay, QRIS, dll.) |
| **PayPal** | Payment provider internasional |
| **Webhook Handler** | Konfirmasi pembayaran real-time |
| **Location Detection** | Auto-detect Indonesia untuk harga IDR |
| **Subscription Management** | Create, cancel, reactivate, cron reconciliation |

---

### 8. Autentikasi & Manajemen User

- **Google OAuth** — Single sign-on via Firebase Authentication
- **Profil User** — Status subscription, penggunaan, tanggal bergabung
- **Admin Dashboard** — Email admin terotorisasi: analytics, users, purchases
- **Onboarding Flow** — Pilih bahasa → kuesioner role → dashboard

---

### 9. Analytics & Tracking

| Fitur | Deskripsi |
|-------|-----------|
| **Visitor Tracking** | Kunjungan halaman, session ID, info device, IP/negara |
| **Login Tracking** | Percobaan login dengan timestamp |
| **Micro-Conversions** | Pricing clicks, scroll depth, time on page, CTA clicks |
| **Admin Analytics** | Conversion rates, repeat visitors, active users |
| **PostHog** | Client-side & server-side analytics events |
| **Meta Pixel** | Facebook/Instagram conversion tracking |

---

### 10. PWA (Progressive Web App)

- **Installable App** — Tambahkan ke home screen di mobile/desktop
- **Splash Screen** — Loading screen animasi saat startup
- **Instruksi Install iOS** — Modal khusus pengguna iOS
- **Offline-capable** — Berfungsi sebagai aplikasi standalone

---

### 11. Internasionalisasi (i18n)

- **Dual Language** — English dan Bahasa Indonesia
- **Language Toggle** — Beralih bahasa real-time
- **Onboarding Language Selection** — Pilih bahasa saat pertama kali masuk
- **Terjemahan Lengkap** — Dashboard, stats, form, empty states, delete confirmation, AI Writer
- **User Language Preference** — Disimpan di database, persisten lintas sesi

---

### 12. Theme & Kustomisasi UI

- **Dark/Light Mode** — Toggle di settings
- **7 Color Themes:**
  | Theme | Emoji | Keterangan |
  |-------|-------|------------|
  | **Ocean Blue** | 🌊 | Default — biru navy modern |
  | **Aurora** | 🌅 | Gradien hangat kemerahan |
  | **Sakura** | 🌸 | Pink lembut japonisme |
  | **Meadow** | 🌿 | Hijau segar alami |
  | **Ocean Mist** | 💨 | Biru-hijau kabut laut |
  | **Lavender** | 💜 | Ungu elegan |
  | **Warm Sand** | 🏜️ | Kuning-cokelat hangat |

---

### 13. Tutorial & Onboarding

- **Tutorial Walkthrough** — `TutorialManager` untuk user baru
- **Welcome Modal** — Sambutan user pertama kali
- **Spotlight Tooltip** — Highlight fitur dengan tooltip langkah demi langkah
- **Feedback Box** — Form feedback: general, bug report, feature request

---

### 14. Fitur Marketing & Growth

- **Early Bird Countdown** — Harga promosi terbatas waktu
- **Twitter Share Modal** — Social sharing sebelum pembelian lifetime
- **Urgency Banner** — Counter slot terbatas
- **FAQ Section** — Di landing page
- **Social Proof Section** — Testimonial pengguna
- **Comparison Section** — Perbandingan vs spreadsheet/alternatif
- **ShaderTransition** — Animasi transisi visual pada landing page

---

### 15. Integrasi Gmail (Beta)

- **Koneksi OAuth** — Hubungkan akun Gmail
- **Parsing Email LinkedIn** — Auto-deteksi lamaran dari email LinkedIn
- **Auto-create Jobs** — Buat kartu lowongan dari email yang di-parse

---

## Desain UI — Detail Visual

### Design System

Aplikasi menggunakan **Tailwind CSS v4** dengan **CSS custom properties** untuk theming. Semua warna dikendalikan via `data-theme` attribute pada root HTML element.

#### Prinsip Desain
- **Glassmorphism** — Card dengan `backdrop-blur` + `bg-white/10` di dark mode
- **Subtle shadows** — `shadow-sm` sampai `shadow-lg` untuk kedalaman
- **Rounded corners** — Dominan `rounded-xl` dan `rounded-2xl`
- **Smooth transitions** — Framer Motion untuk animasi masuk/keluar komponen
- **Consistent spacing** — System 4px base (Tailwind default)

### Layout Utama

```
┌─────────────────────────────────────────────────┐
│ Sidebar (256px)  │  Main Content Area            │
│                  │                               │
│ Logo             │  DashboardSection/            │
│ TrackerMode      │  FreelanceDashboard/          │
│ Switcher         │  AIWriterSection              │
│ ──────────       │                               │
│ Nav Items        │                               │
│ ──────────       │                               │
│ Coins Display    │                               │
│ Settings         │                               │
└─────────────────────────────────────────────────┘
```

**Mobile Layout:**
```
┌───────────────────────┐
│  Content Area          │
│  (full width)          │
│                        │
│                        │
├───────────────────────┤
│  Bottom Nav (5 items)  │
└───────────────────────┘
```

### Komponen UI Utama

#### Sidebar
- Lebar tetap **256px** di desktop
- Collapsible di mobile → disamarkan, diganti bottom nav
- Mode indicator (Job/Client/AI Writer) dengan warna & icon berbeda
- Coin balance display (`CoinsDisplay` / `MobileCoins`)
- User avatar + nama + badge subscription

#### Cards
- `rounded-xl` + `border` + `bg-card`
- Hover state: `hover:shadow-md transition-shadow`
- Stat cards: ikon di kiri, angka besar di tengah, label di bawah

#### Modals / Dialogs
- Radix UI `Dialog` dengan overlay `bg-black/50`
- `rounded-2xl` container
- Animasi fade+scale dari Radix
- Close button di pojok kanan atas

#### Forms
- Input: `rounded-lg border bg-input h-10 px-3`
- Label di atas input, hint text di bawah jika ada
- Error state: border merah + pesan error merah di bawah
- Multi-step form dengan `StepIndicator` di atas (progress dots/bar)

#### Buttons
- **Primary**: `bg-primary text-primary-foreground rounded-lg px-4 py-2`
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Destructive**: `bg-destructive text-destructive-foreground`
- **Ghost**: `hover:bg-accent hover:text-accent-foreground`
- **Outline**: `border border-input bg-background`
- Size variants: `sm`, `default`, `lg`
- Loading state dengan spinner icon

#### Badges / Tags
- Status badges dengan warna semantik:
  - **Ongoing** → `bg-yellow-100 text-yellow-800` (dark: `bg-yellow-900/30 text-yellow-300`)
  - **Completed** → `bg-green-100 text-green-800` (dark: `bg-green-900/30 text-green-300`)
  - **Cancelled** → `bg-red-100 text-red-800` (dark: `bg-red-900/30 text-red-300`)
  - **Pro** → Gradient ungu/biru
- Service type & product tags: `bg-secondary rounded-full px-2 py-0.5 text-xs`

#### Charts (Recharts)
- **Area Chart** — Tren lamaran (Job Dashboard)
- **Bar Chart** — Monthly income (Freelance), tipe pekerjaan
- **Pie Chart** — Sumber lowongan, status breakdown
- Warna charts ikut color theme aktif
- Responsive container dengan `ResponsiveContainer`
- Custom tooltip dengan styling card

#### Toast Notifications (Sonner)
- Posisi: bottom-right
- Variasi: success (hijau), error (merah), loading (spinner)
- Auto-dismiss 4 detik

#### Navigation States
- Active nav item: `bg-primary/10 text-primary font-medium`
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-accent`
- Icon + label untuk semua nav item

### Landing Page Sections

| Section | Visual |
|---------|--------|
| **HeroSection** | Full-width, gradient background, besar, CTA button prominent |
| **ShowcaseSection** | Grid/masonry screenshot app dengan animasi masuk |
| **AIWriterLandingSection** | Dark-toned card, AI feature highlight |
| **ComparisonSection** | Tabel/card perbandingan vs kompetitor |
| **EarlyBirdSection** | Countdown timer, progress bar slot, harga coret |
| **SocialProofSection** | Avatar stack, testimonial quotes, star ratings |
| **FAQSection** | Accordion/expand collapse |
| **FooterSection** | Multi-column links, social icons |
| **ShaderTransition** | GLSL-shader animasi antar-section |

### AI Writer UI Flow

#### Step Indicators
- Bar progress di atas form multi-step
- Step number + label aktif highlighted
- Completed steps: checklist icon

#### GenerationOutput
- Konten dalam `RichTextEditor` (TipTap) dengan `EditorToolbar`
- Toolbar: Bold, Italic, Underline, Align Left/Center/Right/Justify
- Tombol aksi: Copy ke clipboard, Edit mode, Export (DOCX/PDF)
- Coin usage indicator setelah generate

#### JPS Shop (Coin Store)
- Card per paket coin dengan nama jenaka (Jalur Doa, Mulai Panik, Budak Korporat)
- Harga IDR prominent, deskripsi "~Nx generate"
- Tombol beli → Midtrans payment flow

---

## Database Schema (Supabase)

### Tabel Utama

#### `jobs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | Primary key |
| `user_id` | TEXT | Firebase user ID |
| `job_title` | TEXT | Judul pekerjaan |
| `company` | TEXT | Nama perusahaan |
| `industry` | TEXT | Industri |
| `recruiter_email` | TEXT | Email recruiter |
| `application_url` | TEXT | URL lowongan |
| `job_type` | TEXT | Full Time/Part Time/Contract/Internship |
| `location` | TEXT | Remote/On-site/Hybrid |
| `potential_salary` | NUMERIC | Estimasi gaji |
| `currency` | TEXT | Mata uang |
| `status_applied` | BOOLEAN | Status applied |
| `status_emailed` | BOOLEAN | Status emailed |
| `status_cv_responded` | BOOLEAN | CV dibalas |
| `status_interview_email` | BOOLEAN | Undangan interview |
| `status_contract_email` | BOOLEAN | Tawaran kontrak |
| `status_rejected` | BOOLEAN | Ditolak |
| `created_at`, `updated_at` | TIMESTAMPTZ | Timestamp |

#### `freelance_jobs`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | TEXT (20-char) | Auto-generated ID |
| `user_id` | TEXT | Firebase user ID |
| `client_name` | TEXT | Nama klien (required) |
| `client_contact` | TEXT | Email/telepon (optional) |
| `service_type` | TEXT | Tipe layanan |
| `product` | TEXT | Deliverable/produk |
| `potential_price` | NUMERIC | Estimasi harga |
| `actual_price` | NUMERIC | Harga deal aktual |
| `currency` | TEXT | Default 'IDR' |
| `start_date`, `end_date` | DATE | Timeline proyek |
| `duration_days` | INTEGER | Auto-calculated |
| `status` | TEXT | ongoing/completed/cancelled (CHECK constraint) |
| `created_at`, `updated_at` | TIMESTAMPTZ | Auto-trigger update |

Indexes: `user_id`, `(user_id, status)`, `(user_id, created_at DESC)`, `(user_id, client_name)`, `(user_id, start_date)`

#### `users`
| Kolom | Tipe |
|-------|------|
| `id` | TEXT (Firebase UID) |
| `email` | TEXT |
| `subscription_plan` | TEXT (free/monthly/lifetime) |
| `subscription_status` | TEXT |
| `is_pro` | BOOLEAN |
| `language_preference` | TEXT |
| `created_at`, `updated_at` | TIMESTAMPTZ |

#### `subscriptions`
- `id`, `user_id`, `plan`, `status`
- `renews_at`, `ends_at`
- `midtrans_subscription_id`, `midtrans_subscription_token`

#### `user_streaks`
- `current_streak`, `best_streak`
- `last_active_date`, `consecutive_days`

#### `ai_coins` (AI Writer)
- `user_id`, `weekly_coins`, `purchased_coins`
- `weekly_coin_allocation`, `last_weekly_reset`
- `total_coins` (computed: weekly + purchased)

#### `generated_documents` (AI Writer)
- `id`, `user_id`, `generation_type`, `channel`
- `target_name`, `target_company`, `target_role`
- `tone`, `format`, `intent`, `output_language`
- `content` (TEXT — hasil generate)
- `coins_used`, `created_at`

#### `coin_transactions` (AI Writer)
- `id`, `user_id`, `transaction_type` (purchase/deduction)
- `amount`, `package_id`, `midtrans_order_id`
- `created_at`

#### `analytics_micro_conversions`
- `type` (pricing_click, scroll_depth, cta_click, dll.)
- `value`, `session_id`, `page`, `timestamp`

---

## Logika Bisnis

### Status Subscription "Pro"
User dianggap Pro jika memenuhi salah satu:
1. Email dalam whitelist admin
2. Plan lifetime
3. Status subscription aktif (monthly)
4. Subscription cancelled tapi masih dalam grace period (`ends_at` belum lewat)

### Batas Penggunaan (Free Plan)
- **Job Applications**: Maksimal 10
- **Client Tracker**: Maksimal 10 proyek
- **AI Writer**: 240 coin/minggu (3x generate)
- Pro/Admin: Unlimited job + client, 400 coin/minggu

### Kalkulasi Streak
- Streak bertambah setiap hari ada penambahan lowongan baru
- Reset jika ada hari yang terlewat
- Simpan `current_streak` dan `best_streak`

### Client Tracker — Logika Harga
- `actual_price` diisi saat deal closed, jika kosong maka `potential_price` digunakan
- Pada kartu proyek, `potential_price` dicoret jika `actual_price` sudah ada
- Monthly income: prioritas `actual_price`, fallback ke `potential_price`

### AI Coin Weekly Reset
- Setiap minggu, `weekly_coins` direset ke alokasi plan (`free: 240`, `pro: 400`)
- `purchased_coins` tidak direset — persist sampai habis
- Generate mengambil dari `purchased_coins` dulu, baru `weekly_coins`

---

## Autentikasi & Otorisasi

| Level | Akses | Kriteria |
|-------|-------|----------|
| **Free User** | Maks 10 job + 10 proyek + 240 coin/minggu | Plan default |
| **Pro User** | Unlimited + 400 coin/minggu | Subscription aktif |
| **Admin** | Full admin dashboard + unlimited semua | Email dalam whitelist |

---

## Status Aplikasi

JobTracker adalah aplikasi SaaS **production-ready** dibangun dengan Next.js 16 + React 19. Fitur aktif saat ini mencakup **Job Tracker**, **Client Tracker**, dan **AI Writer (JPS)** yang berjalan penuh. Stack Firebase (auth) + Supabase (database) + Anthropic (AI) membentuk backbone yang solid dengan payment melalui Midtrans (IDR) dan PayPal (internasional).
