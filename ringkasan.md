# JobTracker - Ringkasan Aplikasi

## Apa itu JobTracker?

**JobTracker** adalah platform SaaS (Software as a Service) **dual-purpose** yang membantu pengguna melacak **lamaran pekerjaan** dan **klien/proyek freelance**. Aplikasi ini menggantikan spreadsheet yang berantakan dengan dashboard visual yang canggih, mendukung dua mode: **Job Tracker** untuk pencari kerja dan **Client Tracker** untuk freelancer.

---

## Fitur Utama

### 1. Sistem Dual Tracker (Job Tracker + Client Tracker)

Aplikasi memiliki **mode ganda** yang bisa dialihkan melalui `TrackerModeSwitcher` di sidebar atau floating button di mobile:

| Mode | Fungsi | Target User |
|------|--------|-------------|
| **Job Tracker** | Melacak lamaran pekerjaan | Pencari kerja |
| **Client Tracker** | Melacak klien & proyek freelance | Freelancer |

Navigasi sidebar dan bottom nav berubah otomatis sesuai mode:
- Job Mode: Dashboard → Applications → Profile → Settings
- Client Mode: Dashboard → Clients → Profile → Settings

---

### 2. Client Tracker (Fitur Terbaru)

#### A. Dashboard Statistik Klien

| Fitur | Deskripsi |
|-------|-----------|
| **Total Income** | Jumlah seluruh `actual_price` (atau `potential_price` jika belum deal) dari semua proyek |
| **Total Clients** | Jumlah klien unik (berdasarkan `client_name` distinct) |
| **Average Rate** | Rata-rata income per proyek |
| **Monthly Income Chart** | Bar chart income 6 bulan terakhir (Recharts) |
| **Recent Projects** | 4 proyek terakhir dengan nama klien, tipe layanan, dan status |
| **Empty State** | Tampilan "Track Your Clients" dengan tombol tambah jika belum ada proyek |

#### B. Manajemen Proyek Freelance

| Fitur | Deskripsi |
|-------|-----------|
| **Daftar Proyek** | Tampilan lengkap proyek dengan pencarian dan filter status (All/Ongoing/Completed/Cancelled) |
| **Tambah Proyek** | Form 2 langkah (Step 1: Client & Service, Step 2: Pricing & Timeline) |
| **Edit Proyek** | Update data proyek yang sudah ada |
| **Hapus Proyek** | Hapus dengan dialog konfirmasi |
| **Real-time Updates** | Perubahan data langsung ter-update via Supabase subscriptions |

#### C. Form Tambah Proyek (2 Langkah)

**Step 1 - Client & Service:**
| Field | Tipe | Keterangan |
|-------|------|-----------|
| Client Name | Text (required) | Nama klien |
| Client Contact | Text (optional) | Email/telepon klien |
| Service Type | Searchable Dropdown | 60+ preset: Web Dev, Mobile App, UI/UX Design, Content Writing, Video Editing, Consulting, dll. + opsi "Other" untuk custom |
| Product/Deliverable | Searchable Dropdown | 60+ preset: Landing Page, E-commerce, Mobile App, Logo, Brand Identity, dll. + opsi "Other" untuk custom |

**Step 2 - Pricing & Timeline:**
| Field | Tipe | Keterangan |
|-------|------|-----------|
| Potential Price | Number (IDR) | Estimasi harga |
| Actual/Deal Price | Number (optional) | Harga deal, diisi saat deal closed |
| Status | Radio button | Ongoing / Completed / Cancelled |
| Start Date | Date picker | Tanggal mulai proyek |
| End Date | Date picker | Tanggal selesai proyek |
| Duration | Auto-calculated | Dihitung otomatis dari start & end date |

#### D. Kartu Proyek (FreelanceJobCard)

Setiap proyek menampilkan:
- Nama klien dengan ikon Building
- Tag tipe layanan & produk
- Badge status (Ongoing= kuning, Completed= hijau, Cancelled= merah)
- Harga (actual dengan coret potential jika ada actual)
- Rentang tanggal & durasi
- Info kontak klien
- Tombol Edit & Hapus

#### E. Statistik Freelance Detail (FreelanceStats)

| Statistik | Deskripsi |
|-----------|-----------|
| **Total Income / Total Clients / Average Rate** | Kartu statistik ringkasan |
| **Monthly Income Chart** | Bar chart 12 bulan |
| **Project Status Breakdown** | Distribusi Ongoing/Completed/Cancelled dengan indikator warna |

---

### 3. Job Tracker (Manajemen Lamaran Kerja)

| Fitur | Deskripsi |
|-------|-----------|
| **Tambah/Edit/Hapus Lowongan** | Buat entri pekerjaan dengan judul, perusahaan, gaji, email recruiter, tipe pekerjaan, lokasi, dan sumber lowongan |
| **Tracking Status** | Lacak progres: Applied → Emailed → CV Responded → Interview → Contract/Offer |
| **Tandai Ditolak** | Tandai lamaran sebagai rejected sambil tetap menyimpan riwayat progres |
| **Sumber Lowongan** | LinkedIn, Indeed, Glassdoor, Kalibrr, Glints, Upwork, dll. |
| **Tipe Pekerjaan** | Full Time, Part Time, Contract, Internship |
| **Tipe Lokasi** | Remote/WFH, On-site/WFO, Hybrid |
| **Pencarian & Filter** | Filter berdasarkan status, cari berdasarkan judul/perusahaan |
| **Paginasi** | 6 lowongan per halaman |

### 4. Dashboard & Statistik (Job Mode)

| Fitur | Deskripsi |
|-------|-----------|
| **Interview Rate** | Persentase lamaran yang mencapai tahap interview |
| **Total Lamaran** | Jumlah semua lowongan yang dilacak |
| **Daily Streak** | Gamifikasi - lacak hari berturut-turut aktivitas |
| **Grafik Pertumbuhan** | Area chart tren lamaran (harian/mingguan/bulanan) |
| **Aktivitas Terbaru** | 5 penambahan lowongan terakhir |
| **Statistik Lowongan** | Pie chart sumber lowongan, bar chart tipe pekerjaan, distribusi lokasi, funnel tahapan |

---

### 5. Sistem Subscription & Pricing

#### Detail Pricing Plans

| Plan | Harga USD | Harga IDR | Harga Asli | Diskon | Periode |
|------|-----------|-----------|------------|--------|---------|
| **Free** | $0 | Rp 0 | - | - | Selamanya |
| **Monthly Pro** | $2.66/bulan | Rp 31,988/bulan | $2.99 / Rp 36,000 | 11.13% | Bulanan (auto-renewal) |
| **Lifetime Pro** | $7.16 | Rp 51,988 | $7.99 / Rp 58,000 | 10.36% | Sekali bayar |

#### Perbandingan Fitur per Plan

| Fitur | Free | Monthly Pro | Lifetime Pro |
|-------|------|-------------|--------------|
| Job applications (lamaran) | Maks 10 | Unlimited | Unlimited |
| Client Tracker (proyek freelance) | Maks 10 | Unlimited | Unlimited |
| Kanban Board | Basic | Smart Filters | Smart Filters |
| Deadline Reminders | - | Auto-Deadline Reminders | Auto-Deadline Reminders |
| Email Support | - | Priority | Priority |
| AI Features (mendatang) | - | - | Included |
| Supporter Badge | - | - | Yes |
| Ownership model | - | Sewa bulanan | Pay Once, Own Forever |

#### Scarcity & Urgency

- **Lifetime Access** dibatasi hanya **20 slot** (`LIFETIME_ACCESS_LIMIT = 20`)
- Progress bar menunjukkan slot yang tersisa
- Warning banner "Lifetime Access Habis" jika slot habis
- Twitter Share diperlukan sebelum pembelian Lifetime (social sharing gate)
- Countdown timer Early Bird pricing

#### Lokalisasi Harga

- Auto-detect lokasi user (Indonesia vs internasional)
- Menampilkan harga IDR untuk user Indonesia
- Menampilkan harga USD untuk user internasional

---

### 6. Sistem Pembayaran

| Fitur | Keterangan |
|-------|-----------|
| **Midtrans** | Payment gateway utama Indonesia - BCA, Mandiri, BNI, GoPay, dll. |
| **Kartu Kredit** | Dengan auto-renewal untuk plan bulanan |
| **Paddle** | Payment provider internasional (terintegrasi) |
| **Webhook Handler** | Konfirmasi pembayaran real-time |
| **Location Detection** | Auto-detect Indonesia untuk menampilkan harga IDR |

### 7. Autentikasi & Manajemen User

- **Google OAuth** - Single sign-on via Firebase Authentication
- **Profil User** - Lihat status subscription, penggunaan, tanggal bergabung
- **Admin Dashboard** - Untuk email admin yang terotorisasi untuk melihat analytics, users, dan purchases

### 8. Analytics & Tracking

| Fitur | Deskripsi |
|-------|-----------|
| **Visitor Tracking** | Kunjungan halaman, session ID, info device, IP/negara |
| **Login Tracking** | Percobaan login dengan timestamp |
| **Micro-Conversions** | Pricing clicks, scroll depth, time on page, CTA clicks |
| **Admin Analytics** | Conversion rates, repeat visitors, active users |

### 9. PWA (Progressive Web App)

- **Installable App** - Tambahkan ke home screen di mobile/desktop
- **Offline-capable** - Berfungsi sebagai aplikasi standalone
- **Instruksi Install iOS** - Modal khusus untuk pengguna iOS

### 10. Internasionalisasi (i18n)

- **Dukungan Dual Bahasa** - English dan Bahasa Indonesia
- **Toggle Bahasa** - Beralih bahasa secara real-time
- **Terjemahan Client Tracker** - Semua string Client Tracker telah diterjemahkan (dashboard, stats, form, empty states, delete confirmation)

### 11. Theme & Kustomisasi

- **Dark/Light Mode** - Beralih antara tema gelap dan terang
- **Color Themes** - 7 pilihan warna: Default, Aurora, Sakura, Meadow, Ocean, Lavender, Warm Sand

### 12. Integrasi Gmail (Beta)

- **Koneksi OAuth** - Hubungkan akun Gmail
- **Parsing Email LinkedIn** - Auto-deteksi lamaran dari email LinkedIn
- **Auto-create Jobs** - Buat kartu lowongan dari email yang di-parse

### 13. Tutorial & Onboarding

- **Tutorial Walkthrough** - Panduan langkah demi langkah untuk user baru
- **Feedback Box** - Form feedback dari user untuk masukan dan laporan bug

### 14. Fitur Marketing

- **Early Bird Countdown** - Harga promosi terbatas waktu
- **Twitter Share Modal** - Berbagi sosial sebelum pembelian
- **Urgency Banner** - Counter slot terbatas untuk lifetime access
- **FAQ Section** - Pertanyaan umum dijawab

---

## Tech Stack

### Frontend

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 16** | React framework dengan App Router |
| **React 19** | Library UI |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling dengan CSS variables |
| **Radix UI** | Headless UI components |
| **Lucide React** | Icon library |
| **Recharts** | Charts dan visualisasi data |
| **date-fns** | Manipulasi tanggal |

### Backend & Database

| Teknologi | Kegunaan |
|-----------|----------|
| **Firebase** | Authentication (Google OAuth), Firestore (analytics), Admin SDK |
| **Supabase** | Database utama (PostgreSQL), Real-time subscriptions |
| **Next.js API Routes** | Server-side logic, webhooks |

### Payment & Services

| Teknologi | Kegunaan |
|-----------|----------|
| **Midtrans** | Payment gateway (Indonesia) |
| **Paddle** | Payment provider (internasional) |
| **Google APIs** | Integrasi Gmail |
| **Google Analytics** | User analytics |

---

## Struktur Aplikasi

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login Google OAuth
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard utama (dual mode)
│   │   └── billing/page.tsx      # Manajemen billing
│   ├── pricing/page.tsx          # Halaman harga
│   ├── admin/page.tsx            # Admin dashboard
│   ├── payment/                  # Halaman pembayaran
│   └── api/                      # API routes
│       ├── jobs/                 # CRUD lowongan
│       ├── freelance/            # CRUD proyek freelance (Client Tracker)
│       ├── payment/midtrans/     # Webhook pembayaran
│       ├── analytics/            # Tracking & stats
│       ├── streaks/              # Streak gamifikasi
│       └── users/                # Manajemen user
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── tracker/                  # Komponen tracking lowongan
│   ├── freelance/                # Komponen Client Tracker
│   │   ├── FreelanceDashboard.tsx    # Daftar proyek klien
│   │   ├── FreelanceJobCard.tsx      # Kartu proyek individual
│   │   ├── FreelanceStats.tsx        # Statistik freelance detail
│   │   └── AddFreelanceModal.tsx     # Form tambah/edit proyek (2 langkah)
│   ├── ClientDashboardSection.tsx    # Dashboard statistik klien
│   ├── TrackerModeSwitcher.tsx       # Switcher mode Job/Client
│   ├── DashboardLayout.tsx           # Layout utama (dual mode)
│   ├── Sidebar.tsx                    # Sidebar dinamis per mode
│   ├── MobileBottomNav.tsx           # Navigasi mobile per mode
│   ├── forms/                    # Form components
│   ├── providers/                # Context providers
│   └── ...                       # Lainnya
│
├── lib/
│   ├── firebase/                 # Integrasi Firebase
│   ├── supabase/
│   │   ├── freelance-jobs.ts     # CRUD & real-time untuk Client Tracker
│   │   └── ...                   # Lainnya
│   ├── language/                 # i18n translations (EN/ID)
│   ├── theme/                    # Theme management
│   └── pricing-config.ts        # Konfigurasi harga plans
│
├── types/
│   └── index.ts                 # TypeScript interfaces (Job, FreelanceJob, dll.)
│
└── actions/                      # Server actions
```

---

## Database Schema (Supabase)

### Tabel Utama

#### `jobs`
Menyimpan data lowongan dengan kolom:
- `id`, `user_id`, `job_title`, `company`, `industry`
- `recruiter_email`, `application_url`, `job_type`, `location`
- `potential_salary`, `currency`
- Status flags: `status_applied`, `status_emailed`, `status_cv_responded`, `status_interview_email`, `status_contract_email`, `status_rejected`
- `created_at`, `updated_at`

#### `freelance_jobs` (BARU - Client Tracker)
Menyimpan data proyek freelance:
- `id` (20-char auto-generated), `user_id`
- `client_name` (required), `client_contact` (email/phone, optional)
- `service_type` (required) - Web Dev, Mobile App, UI/UX, dll.
- `product` (required) - Landing Page, E-commerce, Logo, dll.
- `potential_price` (NUMERIC), `actual_price` (NUMERIC, diisi saat deal)
- `currency` (default 'IDR')
- `start_date`, `end_date`, `duration_days` (auto-calculated)
- `status` (ongoing/completed/cancelled, CHECK constraint)
- `created_at`, `updated_at` (auto-trigger update)
- **Indexes**: `user_id`, `(user_id, status)`, `(user_id, created_at DESC)`, `(user_id, client_name)`, `(user_id, start_date)`
- **RLS**: User hanya bisa akses data miliknya sendiri

#### `users`
Menyimpan data user:
- `id` (Firebase user ID), `email`
- `subscription_plan` (free/monthly/lifetime)
- `subscription_status`, `is_pro`
- `created_at`, `updated_at`

#### `subscriptions`
Menyimpan data subscription:
- `id`, `user_id`, `plan`, `status`
- `renews_at`, `ends_at`
- `midtrans_subscription_id`, `midtrans_subscription_token`

#### `user_streaks`
Gamifikasi streak harian:
- `current_streak`, `best_streak`
- `last_active_date`, `consecutive_days`

#### `analytics_micro_conversions`
Tracking micro-conversions:
- `type` (pricing_click, scroll_depth, dll.)
- `value`, `session_id`, `page`, `timestamp`

---

## API Routes

| Route | Method | Fungsi |
|-------|--------|--------|
| `/api/jobs/add` | POST | Tambah lowongan baru |
| `/api/jobs/update` | POST | Update lowongan |
| `/api/jobs/delete` | POST | Hapus lowongan |
| `/api/freelance/add` | POST | Tambah proyek freelance |
| `/api/freelance/update` | POST | Update proyek freelance |
| `/api/freelance/delete` | POST | Hapus proyek freelance |
| `/api/payment/midtrans/charge` | POST | Buat transaksi pembayaran |
| `/api/payment/midtrans/webhook` | POST | Handle callback pembayaran |
| `/api/analytics/track` | POST | Track event visitor |
| `/api/analytics/stats` | GET | Ambil data analytics |
| `/api/streaks` | GET | Ambil streak user |
| `/api/streaks/increment` | POST | Increment streak |

---

## Logika Bisnis Utama

### Status Subscription
User dianggap "Pro" jika:
1. Email admin (whitelist)
2. Plan lifetime
3. Status subscription aktif
4. Cancelled dengan grace period (ends_at belum terlewati)

### Batas Penggunaan (Free Plan)
- **Job Applications**: Maksimal 10 lowongan
- **Client Tracker**: Maksimal 10 proyek
- Pro/Admin: Unlimited untuk keduanya

### Kalkulasi Streak
- Hari berturut-turut menambahkan lowongan
- Reset jika ada hari yang terlewat
- Track current streak dan best streak

### Client Tracker - Logika Harga
- `actual_price` diisi saat deal closed, jika kosong maka `potential_price` ditampilkan
- Pada kartu proyek, `potential_price` ditampilkan dengan coretan jika `actual_price` sudah ada
- Monthly income dihitung dari `actual_price` (atau `potential_price` sebagai fallback)

---

## Autentikasi & Otorisasi

| Level | Akses | Kriteria |
|-------|-------|----------|
| **Free User** | Maks 10 lowongan + 10 proyek | Plan default |
| **Pro User** | Unlimited semua fitur | Subscription aktif (monthly/lifetime) |
| **Admin** | Full admin dashboard | Email dalam whitelist admin |

---

## Status Aplikasi

JobTracker adalah aplikasi SaaS **production-ready** dengan fitur komprehensif untuk tracking lamaran kerja **dan** klien/proyek freelance, dibangun dengan teknologi web modern dan best practices. Fitur terbaru **Client Tracker** memungkinkan freelancer mengelola klien, proyek, dan pendapatan dalam satu platform yang sama.