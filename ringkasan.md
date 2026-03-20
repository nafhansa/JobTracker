# JobTracker - Ringkasan Aplikasi

## Apa itu JobTracker?

**JobTracker** adalah platform SaaS (Software as a Service) untuk **melacak lamaran pekerjaan** yang membantu pencari kerja mengelola perjalanan pencarian kerja mereka. Aplikasi ini menggantikan spreadsheet yang berantakan dengan dashboard visual yang canggih untuk melacak status lamaran kerja, gaji, dan follow-up.

---

## Fitur Utama

### 1. Manajemen Lamaran Kerja

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

### 2. Dashboard & Statistik

| Fitur | Deskripsi |
|-------|-----------|
| **Interview Rate** | Persentase lamaran yang mencapai tahap interview |
| **Total Lamaran** | Jumlah semua lowongan yang dilacak |
| **Daily Streak** | Gamifikasi - lacak hari berturut-turut aktivitas |
| **Grafik Pertumbuhan** | Area chart tren lamaran (harian/mingguan/bulanan) |
| **Aktivitas Terbaru** | 5 penambahan lowongan terakhir |
| **Statistik Lowongan** | Pie chart sumber lowongan, bar chart tipe pekerjaan, distribusi lokasi, funnel tahapan |

### 3. Sistem Subscription & Monetisasi

| Plan | Harga | Fitur |
|------|-------|-------|
| **Free** | $0 | Maksimal 20 lamaran, fitur dasar |
| **Monthly Pro** | $2.66/bulan (~Rp31,988) | Unlimited lamaran, smart filters, reminders |
| **Lifetime Pro** | $7.16 sekali bayar (~Rp51,988) | Semua fitur monthly + fitur AI mendatang, terbatas 20 slot |

### 4. Sistem Pembayaran

- **Integrasi Midtrans** - Payment gateway Indonesia (BCA, Mandiri, BNI, dll.)
- **Kartu Kredit** - Dengan auto-renewal untuk plan bulanan
- **Webhook Handler** - Konfirmasi pembayaran real-time
- **Batas Lifetime Access** - Hanya 20 slot tersedia (scarcity marketing)

### 5. Autentikasi & Manajemen User

- **Google OAuth** - Single sign-on via Firebase Authentication
- **Profil User** - Lihat status subscription, penggunaan, tanggal bergabung
- **Admin Dashboard** - Untuk email admin yang terotorisasi untuk melihat analytics, users, dan purchases

### 6. Analytics & Tracking

| Fitur | Deskripsi |
|-------|-----------|
| **Visitor Tracking** | Kunjungan halaman, session ID, info device, IP/negara |
| **Login Tracking** | Percobaan login dengan timestamp |
| **Micro-Conversions** | Pricing clicks, scroll depth, time on page, CTA clicks |
| **Admin Analytics** | Conversion rates, repeat visitors, active users |

### 7. PWA (Progressive Web App)

- **Installable App** - Tambahkan ke home screen di mobile/desktop
- **Offline-capable** - Berfungsi sebagai aplikasi standalone
- **Instruksi Install iOS** - Modal khusus untuk pengguna iOS

### 8. Internasionalisasi (i18n)

- **Dukungan Dual Bahasa** - English dan Bahasa Indonesia
- **Toggle Bahasa** - Beralih bahasa secara real-time

### 9. Theme & Kustomisasi

- **Dark/Light Mode** - Beralih antara tema gelap dan terang
- **Color Themes** - 7 pilihan warna: Default, Aurora, Sakura, Meadow, Ocean, Lavender, Warm Sand

### 10. Integrasi Gmail (Beta)

- **Koneksi OAuth** - Hubungkan akun Gmail
- **Parsing Email LinkedIn** - Auto-deteksi lamaran dari email LinkedIn
- **Auto-create Jobs** - Buat kartu lowongan dari email yang di-parse

### 11. Fitur Marketing

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
│   │   ├── page.tsx              # Dashboard utama
│   │   └── billing/page.tsx      # Manajemen billing
│   ├── pricing/page.tsx          # Halaman harga
│   ├── admin/page.tsx            # Admin dashboard
│   ├── payment/                  # Halaman pembayaran
│   └── api/                      # API routes
│       ├── jobs/                 # CRUD lowongan
│       ├── payment/midtrans/     # Webhook pembayaran
│       ├── analytics/            # Tracking & stats
│       └── users/                # Manajemen user
│
├── components/
│   ├── ui/                       # Base UI components
│   ├── tracker/                  # Komponen tracking lowongan
│   ├── forms/                    # Form components
│   ├── providers/                # Context providers
│   └── ...                       # Lainnya
│
├── lib/
│   ├── firebase/                 # Integrasi Firebase
│   ├── supabase/                 # Integrasi Supabase
│   ├── language/                 # i18n translations
│   └── theme/                    # Theme management
│
├── types/                        # TypeScript interfaces
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

### Batas Lowongan
- Plan Free: Maksimal 20 lowongan
- Pro/Admin: Unlimited

### Kalkulasi Streak
- Hari berturut-turut menambahkan lowongan
- Reset jika ada hari yang terlewat
- Track current streak dan best streak

---

## Autentikasi & Otorisasi

| Level | Akses | Kriteria |
|-------|-------|----------|
| **Free User** | Terbatas 20 lowongan | Plan default |
| **Pro User** | Unlimited lowongan | Subscription aktif (monthly/lifetime) |
| **Admin** | Full admin dashboard | Email dalam whitelist admin |

---

## Status Aplikasi

JobTracker adalah aplikasi SaaS **production-ready** dengan fitur komprehensif untuk tracking lamaran kerja, dibangun dengan teknologi web modern dan best practices.