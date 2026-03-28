# Fitur Freelance Dashboard - Implementation Plan

## 1. Database Schema (Supabase)

**Table: `freelance_jobs`**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | text | Firebase UID |
| client_name | text | Nama klien |
| client_contact | text | Email/telp klien |
| service_type | text | Dropdown + custom |
| product | text | Dropdown + custom |
| potential_price | numeric | Estimasi harga |
| actual_price | numeric | Harga deal (optional) |
| currency | text | Default IDR |
| start_date | date | Mulai kontrak |
| end_date | date | Selesai kontrak |
| duration_days | integer | Auto-calc atau manual |
| status | text | ongoing/completed/cancelled |
| created_at | timestamp | - |
| updated_at | timestamp | - |

## 2. File Structure

```
src/
├── types/index.ts                     # + FreelanceJob interface
├── app/
│   ├── api/freelance/
│   │   ├── add/route.ts
│   │   ├── update/route.ts
│   │   ├── delete/route.ts
│   │   └── route.ts                   # GET all
│   └── dashboard/freelance/page.tsx
├── components/
│   ├── Sidebar.tsx                    # + Menu Freelance
│   ├── DashboardLayout.tsx            # + Section "freelance"
│   └── freelance/
│       ├── FreelanceDashboard.tsx     # Main container
│       ├── FreelanceStats.tsx         # Stats cards + chart
│       ├── FreelanceJobCard.tsx       # Project card
│       ├── AddFreelanceModal.tsx      # Form input
│       └── FreelanceCalendar.tsx      # Calendar view
├── lib/
│   ├── supabase/freelance.ts          # CRUD operations
│   └── language/context.tsx           # + Translations ID/EN
```

## 3. UI Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  FREELANCE DASHBOARD                              [+ Add Project] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ 💰 TOTAL INCOME │ │ 👥 CLIENTS      │ │ 📊 AVG RATE     │    │
│  │                 │ │                 │ │                 │    │
│  │  Rp 125.000.000 │ │     12          │ │  Rp 10.4M/job   │    │
│  │                 │ │                 │ │                 │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                  │
│  ┌───────────────────────────────┐ ┌───────────────────────────┐│
│  │ 📈 MONTHLY INCOME             │ │ 📋 PROJECT STATUS         ││
│  │                               │ │                           ││
│  │   [Bar/Area Chart]            │ │  ● Ongoing    5 projects  ││
│  │                               │ │  ● Completed  12 projects  ││
│  │                               │ │  ● Cancelled   2 projects  ││
│  └───────────────────────────────┘ └───────────────────────────┘│
│                                                                  │
│  [All] [Ongoing] [Completed] [Cancelled]    🔍 Search...        │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🏢 Tokopedia          Web Development    Rp 25.000.000    │  │
│  │    Landing Page       Ongoing            Jan 15 - Mar 30  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🏢 Gojek              Mobile App        Rp 50.000.000    │  │
│  │    Rider App V2       Completed          Oct 01 - Dec 15  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 4. Form Input (2-Step Modal)

**Step 1 - Client & Service:**
- Client Name *
- Client Contact (Email/Phone)
- Service Type (dropdown + custom)
- Product (dropdown + custom)

**Step 2 - Pricing & Timeline:**
- Potential Price
- Actual Price (optional)
- Status (Ongoing/Completed/Cancelled)
- Start Date (date picker)
- End Date (date picker)
- Duration (auto-calc or manual)

## 5. Dropdown Presets

**Service Types:** Web Development, Mobile App, UI/UX Design, Graphic Design, Content Writing, Video Editing, Consulting, Other

**Products:** Landing Page, E-commerce, Mobile App, Logo, Brand Identity, Social Media, Other

## 6. Implementation Order

1. Types & Database schema
2. Supabase CRUD functions
3. API Routes
4. Freelance components (Stats, Cards, Modal)
5. Dashboard page
6. Sidebar navigation
7. Translations (ID/EN)

## 7. Stats Display

- **Total Income** - Sum of actual_price (or potential_price if no actual)
- **Total Clients** - Count of unique clients
- **Average Rate** - Average income per project
- **Monthly Income** - Bar/Area chart showing income per month
- **Project Status** - Breakdown of ongoing/completed/cancelled projects