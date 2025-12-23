# JobTracker Application Specification

## 1. Project Overview
Build a high-performance, responsive Job Application Tracker using Next.js.
The goal is to replace Google Sheets with a dedicated dashboard where users can track job applications.
**Target Performance:** Google Lighthouse Score >= 95 (Mobile & Desktop).

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS + Shadcn UI.
- **Database:** Firebase Firestore.
- **Auth:** Firebase Authentication (Google Auth).
- **Icons:** Lucide React.

## 3. Data Model (TypeScript Interface)
Each Job Application entry (`jobs` collection) must have:
- `id`: string
- `userId`: string (Owner)
- `jobTitle`: string
- `industry`: string
- `recruiterEmail`: string (optional)
- `applicationUrl`: string (optional)
- `potentialSalary`: number (optional)
- `status`: Object containing booleans:
    - `applied`: boolean
    - `emailed`: boolean
    - `cvResponded`: boolean
    - `interviewEmail`: boolean
    - `contractEmail`: boolean
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## 4. UI Structure
- **/** (Root): Public Landing Page. High performance, static content, SEO friendly.
- **/login**: Auth page.
- **/dashboard**: Protected route. Main app.
  - **Mobile:** Card-based list view with collapsible details.
  - **Desktop:** Table or Kanban view (responsive).

## 5. Performance Guidelines (Strict)
1.  **Server Components First:** Use `use client` only for interactive leaves (buttons, forms).
2.  **Font:** Use `next/font/google` (Inter).
3.  **Images:** Always use `<Image />` with explicit dimensions.
4.  **Bundle:** Avoid heavy libraries (e.g., use `date-fns` instead of moment).

## 6. User Flow
1. User lands on `/` -> clicks "Get Started" -> redirects to `/login`.
2. User logs in with Google -> redirects to `/dashboard`.
3. Dashboard shows list of applications.
4. User clicks "Add Job" -> Modal opens -> Fills form -> Data saved to Firestore.