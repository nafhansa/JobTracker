"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  setLanguageWithSync: (lang: Language) => Promise<void>;
  t: (key: string) => string;
  mounted: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("language") as Language;
      if (stored === "en" || stored === "id") {
        return stored;
      }
    }
    return "en";
  });
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
      
      if (user) {
        fetch(`/api/onboarding?userId=${user.uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.language && (data.language === 'en' || data.language === 'id')) {
              setLanguageState(data.language);
              localStorage.setItem("language", data.language);
            }
          })
          .catch(err => console.error("Error fetching language:", err));
      }
    });
    return () => unsubscribe();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const setLanguageWithSync = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    
    if (userId) {
      try {
        await fetch("/api/users/language", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, language: lang }),
        });
      } catch (error) {
        console.error("Error syncing language to DB:", error);
      }
    }
  }, [userId]);

  const t = useCallback((key: string): string => {
    if (!mounted) return key;
    return translations[language][key] || key;
  }, [mounted, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, setLanguageWithSync, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

// Translation Object
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    "nav.pricing": "Pricing",
    "nav.dashboard": "Dashboard",
    "nav.login": "Login",
    
    // Landing Page - Hero
    "hero.badge": "Premium Career Management",
    "hero.title.1": "Track Your",
    "hero.title.2": "Job Applications",
    "hero.title.3": "With No Setup",
    "hero.description": "Throw your Spreadsheets and start tracking now. Monitor your application in one",
    "hero.description.2": "dashboard.",
    "hero.cta.primary": "Get Started Now",
    "hero.cta.secondary": "View Pricing",
    
    // Phone Tracker Section
    "phone.badge": "Mobile-First Experience",
    "phone.title": "Zero Setup.\nAll on Your Phone.",
    "phone.subtitle": "Stop losing track of applications across spreadsheets and notes. JobTracker keeps everything organized right from your phone.",
    "phone.feature.1.title": "Real-Time Updates",
    "phone.feature.1.desc": "Move applications between stages instantly",
    "phone.feature.2.title": "Smart Reminders",
    "phone.feature.2.desc": "Never miss a follow-up or interview",
    "phone.feature.3.title": "Full Dashboard",
    "phone.feature.3.desc": "All your stats, always in reach",
    "phone.cta": "Try It Free",
    
    // Early Bird Section
    "early.badge": "Early Bird Special",
    "early.title": "Limited Time: Lifetime Access Only Rp51.988",
    "early.subtitle": "Was Rp58.000 • Save 10% • Pay Once, Own Forever",
    "early.timer": "Offer ends in:",
    "early.days": "Days",
    "early.hours": "Hrs",
    "early.minutes": "Mins",
    "early.seconds": "Secs",
    "early.cta": "Claim Early Bird Offer",
    "early.title.mobile": "Limited Time Offer",
    "early.price.mobile": "Get Lifetime Access for",
    "early.regular": "Regular Price: Rp58.000",
    
    // Comparison Section
    "comparison.title": "Why Use JobTracker App?",
    "comparison.subtitle": "See why JobTracker is the smarter choice",
    "comparison.features": "Features",
    "comparison.jobtracker": "JobTracker",
    "comparison.spreadsheets": "Spreadsheets",
    "comparison.feature.1": "Visual Stage Tracking",
    "comparison.feature.2": "Salary Recording",
    "comparison.feature.3": "Structured Job Details",
    "comparison.feature.4": "Responsive Mobile Experience",
    "comparison.feature.5": "Auto-Follow Up Reminders",
    "comparison.winner": "Winner",
    "comparison.why": "Why switch?",
    "comparison.recommended": "Recommended",
    "comparison.yes": "Yes",
    "comparison.no": "No",
    "comparison.organized": "Organized",
    "comparison.messy": "Messy",
    "comparison.painful": "Painful",
    
    // Social Proof
    "social.title": "A Note from the Founder",
    "social.subtitle": "I built JobTracker because I was too lazy to set up note templates using Google Spreadsheets. Wasting too much time procrastinating on making a really good Google Spreadsheets template.\nI figured my time was better spent sending cold emails to HR departments than setting up Google Spreadsheets to track my job applications.\nJobTracker App is a tool I originally built for myself, and Alhamdulillah I managed to land my first Full Time Remote job as a Full Stack Developer at a startup called sopan.id",
    "social.subtitle.2": "I hope this tool helps you land your dream job too.",
    "social.name": "Nafhan",
    "social.role": "Founder JobTracker App · Full Stack Developer @sopan.id",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Everything you need to know about JobTracker",
    "faq.q1": "Why should I use JobTracker instead of Google Sheets?",
    "faq.a1": "• Visual Kanban board (drag & drop)\n• Smart filters & mobile-friendly\n• No more scrolling sideways\n• Built for job seekers, not accountants",
    "faq.q2": "Is my application data safe and private?",
    "faq.a2": "Yes. Your data is encrypted and secure. We do NOT sell your information to recruiters or third parties. Your job search stays completely private.",
    "faq.q3": "What makes the Lifetime plan worth it?",
    "faq.a3": "Pay $17.99 once, own it forever. Get all future AI features included. That's like 6 months of monthly, but you get lifetime access instead.",
    "faq.q4": "Can I use this on my phone?",
    "faq.a4": "Absolutely! Fully responsive and works great on mobile. Update status after interviews, check reminders, or add jobs on the go.",
    "faq.q5": "What if I want to go back to spreadsheets?",
    "faq.a5": "No problem! Export all your data to CSV anytime with one click. Your data belongs to you, always.",
    "faq.q6": "What happens when I finally land my dream job?",
    "faq.a6": "🎉 Congrats! Archive your board or keep it active. Cancel subscription anytime with one click no questions asked. Your data stays safe.",
    "faq.q7": "Do you offer refunds?",
    "faq.a7": "Yes! 15-days money-back guarantee on Lifetime plan. If it's not working for you, we'll refund no questions asked.",
    
    // Footer
    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
    "footer.refund": "Refund Policy",
    "footer.contact": "Contact Support",
    "footer.rights": "All rights reserved.",
    
    // Pricing Page
    "pricing.title": "Invest in Your Career",
    "pricing.subtitle": "Stop losing track of opportunities. Choose the plan that fits your ambition.",
    "pricing.free.title": "Free",
    "pricing.free.desc": "Perfect for getting started.",
    "pricing.free.feature1": "Track up to 10 Applications",
    "pricing.free.feature2": "Basic Kanban Board",
    "pricing.free.feature3": "Basic Filters",
    "pricing.free.feature4": "View & Track Status",
    "pricing.free.cta": "Get Started Free",
    "pricing.monthly.title": "Monthly",
    "pricing.monthly.desc": "Perfect for active job seekers.",
    "pricing.monthly.feature1": "Track Unlimited Applications",
    "pricing.monthly.feature2": "Kanban Board & Smart Filters",
    "pricing.monthly.feature3": "Auto-Deadline Reminders",
    "pricing.monthly.feature4": "Priority Email Support",
    "pricing.monthly.cta": "Start Monthly",
    "pricing.lifetime.title": "Lifetime Pro",
    "pricing.lifetime.desc": "Pay once, own it forever.",
    "pricing.lifetime.desc.early": "🎉 Early Bird Special - Limited Time!",
    "pricing.lifetime.feature1": "Everything in Monthly Plan",
    "pricing.lifetime.feature2": "Pay Once, Own Forever",
    "pricing.lifetime.feature3": "Future AI Features Included",
    "pricing.lifetime.feature4": "Supporter Badge on Profile",
    "pricing.lifetime.cta": "Get Lifetime Access",
    "pricing.badge.best": "Best Value",
    "pricing.badge.free": "Free",
    "pricing.badge.save": "Save",
    "pricing.guarantee": "30-day money-back guarantee",
    
    // Dashboard
    "dashboard.title": "Your Applications",
    "dashboard.subtitle": "Manage your journey. Filter by status to stay focused.",
    "dashboard.logout": "Logout",
    "dashboard.admin": "Admin",
    "dashboard.loading": "Loading experience...",
    "dashboard.upgrade": "Upgrade to Pro",
    "dashboard.billing": "Manage Billing",
    "dashboard.plan": "Plan:",
    "dashboard.status": "Status:",
    "dashboard.free": "Free",
    "dashboard.pro": "Pro",
    "dashboard.monthly": "Monthly",
    "dashboard.lifetime": "Lifetime",
    "dashboard.active": "Active",
    "dashboard.cancelled": "Cancelled",
    "dashboard.trialing": "Trial",
    "dashboard.incomplete": "Incomplete",
    
    // Job Status
    "status.wishlist": "Wishlist",
    "status.applied": "Applied",
    "status.interview": "Interview",
    "status.offer": "Offer",
    "status.rejected": "Rejected",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.unlimited": "Unlimited",
    
    // Filters & Tabs
    "filter.all": "All Jobs",
    "filter.applied": "Applied",
    "filter.emailed": "Emailed",
    "filter.response": "Responded",
    "filter.interview": "Interview",
    "filter.offer": "Offers",
    "filter.rejected": "Rejected",
    "filter.ongoing": "On Going",
    
    // Search & Add
    "search.placeholder": "Search role or company...",
    "add.button": "Add Application",
    "stats.button": "Stats",
    
    // Empty States
    "empty.noJobs": "No applications in this stage",
    "empty.noMatch": "No matching jobs found",
    "empty.keepPushing": "Keep pushing! Your dream job is waiting.",
    "empty.adjustSearch": "Try adjusting your search terms.",
    
    // Statistics
    "stats.title": "Statistics",
    "stats.topSources": "Top Job Sources",
    "stats.jobTypes": "Job Types",
    "stats.stageFunnel": "Stage Funnel",
    "stats.noStats": "No statistics available yet",
    "stats.addJobs": "Add some jobs to see your stats",
    "stats.percentage": "Percentage:",
    "stats.applications": "Applications:",
    "stats.clickDetails": "Click for more details",
    "stats.totalApps": "Total Applications",
    "stats.sources": "Job Sources",
    "stats.interviewRate": "Interview Invitation Rate",
    "stats.ofApplications": "of",
    "stats.applicationsGrowth": "Applications Growth",
    "stats.last30Days": "Last 30 days",
    "stats.totalApplications": "Total Applications",

    // Profile
    "profile.userInfo": "User Information",
    "profile.memberSince": "Member since",
    "profile.unknown": "Unknown",
    "profile.admin": "Admin",
    "profile.freePlan": "Free Plan",
    "profile.lifetime": "Lifetime Access",
    "profile.monthly": "Monthly Pro",
    "profile.renewsOn": "Renews on",
    "profile.expiresOn": "Expires on",
    "profile.upgrade": "Upgrade to Pro",
    "profile.manage": "Manage Subscription",
    "profile.usage": "Usage",
    "profile.limitReached": "Limit Reached",
    "profile.unlimited": "Unlimited",
    "profile.limitReachedTitle": "Limit Reached",
    "profile.limitReachedDesc": "You've reached the job limit. Upgrade to Pro for unlimited applications.",
    "profile.nearLimitTitle": "Approaching Limit",
    "profile.nearLimitDesc": "You're close to reaching your job limit. Consider upgrading for unlimited access.",
    "profile.unlimitedAccess": "Unlimited access",
    "profile.unlockPro": "Unlock Pro Features",
    "profile.feature1": "Unlimited job applications",
    "profile.feature2": "Smart filters & reminders",
    "profile.feature3": "Priority email support",
    "profile.upgradeNow": "Upgrade Now",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.applications": "Applications",
    "sidebar.clients": "Clients",
    "sidebar.profile": "Profile",
    "sidebar.settings": "Settings",
    "sidebar.connected": "Connected",
    
    // Tracker Mode
    "tracker.job": "Job Tracker",
    "tracker.client": "Client Tracker",
    "tracker.job.subtitle": "{count} applications",
    "tracker.client.subtitle": "{count} clients",
    
    // Client Dashboard
    "client.dashboard": "Client Dashboard",
    "client.dashboard.subtitle": "Track your freelance projects and income metrics",
    "client.subtitle": "Manage your clients and projects",
    "client.totalIncome": "Total Income",
    "client.totalClients": "Total Clients",
    "client.uniqueClients": "Unique clients served",
    "client.avgRate": "Avg Rate",
    "client.avgRateDesc": "Per project average",
    "client.monthlyIncome": "Monthly Income",
    "client.income": "Income",
    "client.recentProjects": "Recent Projects",
    "client.viewAll": "View All",
    "client.ongoing": "Ongoing",
    "client.completed": "Completed",
    "client.all": "All",
    "client.cancelled": "Cancelled",
    "client.searchPlaceholder": "Search by client, service, or project...",
    "client.noProjects": "No projects found",
    "client.addProject": "Add Project",
    "client.add": "Add Client",
    "client.empty.title": "Track Your Clients",
    "client.empty.desc": "Start tracking your freelance projects to see statistics and insights.",
    "client.delete.title": "Delete Project",
    "client.delete.description": "Are you sure you want to delete the project for",
    
    // Job Form Modal
    "form.title.add": "Track New Job",
    "form.title.edit": "Edit Application",
    "form.step": "Step",
    "form.next": "Next",
    "form.back": "Back",
    "form.jobTitle": "Job Title",
    "form.jobTitle.placeholder": "e.g. Frontend Developer",
    "form.company": "Company",
    "form.company.placeholder": "e.g. Google",
    "form.salary": "Potential Salary (Monthly)",
    "form.salary.placeholder": "e.g. 15000000",
    "form.salary.exact": "Exact Amount",
    "form.salary.range": "Salary Range",
    "form.salary.unspecified": "Not Specified",
    "form.salary.min": "Min",
    "form.salary.max": "Max",
    "form.url": "Application URL",
    "form.url.placeholder": "https://...",
    "form.jobSource": "Job Source",
    "form.jobSource.placeholder": "Select source...",
    "form.jobType": "Job Type",
    "form.jobType.placeholder": "Choose Type",
    "form.location": "Location",
    "form.location.placeholder": "Select...",
    "form.recruiterEmail": "Recruiter Email",
    "form.recruiterEmail.placeholder": "recruiter@company.com",
    "form.status.title": "Track Progress",
    "form.status.applied": "Applied",
    "form.status.emailed": "Emailed Recruiter",
    "form.status.response": "CV Responded",
    "form.status.interview": "Interview Email",
    "form.status.offer": "Contract/Offer",
    "form.status.rejected": "Rejected",
    "form.warning.editLocked": "Edit locked for Free Plan",
    "form.warning.editUpgrade": "Upgrade to Pro to edit your job applications.",
    "form.warning.limitReached": "Job limit reached",
    "form.warning.limitUpgrade": "You've reached the limit of {limit} jobs. Upgrade to Pro for unlimited jobs.",
    "form.usage": "Using {current}/{limit} jobs",
    "form.submit.add": "Track Job",
    "form.submit.edit": "Save Changes",
    "form.freeUsage": "Free Plan Usage",
    "form.limitReachedShort": "Limit reached",
    
    // Job Card
    "card.edit": "Edit",
    "card.delete": "Delete",
    "card.salary": "Salary",
    "card.type": "Type",
    "card.unknown": "Unknown",
    "card.confirmDelete": "Are you sure you want to delete this job application?",
    "card.upgradeEdit": "Upgrade to Pro to edit your job applications.\n\nWould you like to upgrade now?",
    "card.upgradeDelete": "Upgrade to Pro to delete your job applications.\n\nWould you like to upgrade now?",
    
    // Tutorial
    "tutorial.welcome.title": "Welcome to JobTracker!",
    "tutorial.welcome.desc": "Start tracking your job applications with ease. Let's take a quick tour.",
    "tutorial.welcome.start": "Start Tour",
    "tutorial.welcome.skip": "Skip",
    "tutorial.addButton.title": "Add Application",
    "tutorial.addButton.desc": "Click this button to track a new job application. Fill in the details and monitor your progress.",
    "tutorial.pipeline.title": "Pipeline Status",
    "tutorial.pipeline.desc": "Filter your applications by status: Applied, Responded, Interview, or Offer. Stay organized!",
    "tutorial.next": "Next",
    "tutorial.skip": "Skip",
    "tutorial.complete.title": "You're all set!",
    "tutorial.complete.desc": "Start tracking your job applications. Good luck with your job search!",
    "tutorial.complete.cta": "Let's Go",
    
    // Milestone Toasts
    "milestone.streak": "Day {n} streak! Active job seekers get interviews faster.",
    "milestone.apps15": "15 applications tracked! Keep the momentum!",
    "milestone.apps30": "30 applications! You're on the right track!",
    "milestone.apps50": "50 applications! Amazing dedication!",
    "milestone.apps70": "70 applications! Consistency is key!",
    "milestone.apps100": "100 applications! Never give up!",
    
    // Feedback
    "feedback.title": "Feedback",
    "feedback.type": "Type",
    "feedback.type.general": "General",
    "feedback.type.bug": "Bug Report",
    "feedback.type.feature": "Feature Request",
    "feedback.rating": "Rating",
    "feedback.message.placeholder": "Tell us what you think...",
    "feedback.submit": "Send Feedback",
    "feedback.success": "Thank you for your feedback!",
    "feedback.error": "Failed to send feedback. Please try again.",
    
    // Onboarding
    "onboarding.step": "Step {{current}}/{{total}}",
    "onboarding.back": "Back",
    "onboarding.next": "Next",
    "onboarding.finish": "Start Tracking",
    "onboarding.skip": "Skip for now",
    
    "onboarding.q1.title": "Where are you in your job search?",
    "onboarding.q1.just_started": "Just started looking",
    "onboarding.q1.applied_some": "Applied to some places",
    "onboarding.q1.actively_interviewing": "Actively interviewing",
    "onboarding.q1.employed_looking": "Employed but looking to switch",
    
    "onboarding.q2.title": "What roles are you targeting?",
    "onboarding.q2.search_placeholder": "Search roles...",
    "onboarding.q2.other": "Other",
    "onboarding.q2.custom_placeholder": "Enter custom role",
    
    "onboarding.q3.title": "Where do you prefer to work?",
    "onboarding.q3.remote": "Remote / WFH",
    "onboarding.q3.onsite": "On-site / WFO",
    "onboarding.q3.hybrid": "Hybrid",
    "onboarding.q3.flexible": "Flexible (no preference)",
    
    "onboarding.q4.title": "What's your current experience level?",
    "onboarding.q4.no_experience": "No experience yet",
    "onboarding.q4.internship": "Internship experience only",
    "onboarding.q4.less_1_year": "Less than 1 year",
    "onboarding.q4.one_to_three": "1-3 years",
    "onboarding.q4.three_plus": "3+ years",
  },
  id: {
    // Navbar
    "nav.pricing": "Harga",
    "nav.dashboard": "Dashboard",
    "nav.login": "Masuk",
    
    // Landing Page - Hero
    "hero.badge": "Premium Career Management",
    "hero.title.1": "Lacak",
    "hero.title.2": "Lamaran Kerja",
    "hero.title.3": "Tanpa Setup",
    "hero.description": "Buang Spreadsheetmu dan mulai lacak sekarang. Pantau lamaranmu dalam satu",
    "hero.description.2": "dashboard.",
    "hero.cta.primary": "Mulai Sekarang",
    "hero.cta.secondary": "Lihat Harga",
    
    // Phone Tracker Section
    "phone.badge": "Pengalaman Mobile-First",
    "phone.title": "Tanpa Setup.\nSemua di HP.",
    "phone.subtitle": "Berhenti kehilangan jejak lamaran di spreadsheet dan catatan. JobTracker bikin semuanya terorganisir langsung dari HP-mu.",
    "phone.feature.1.title": "Update Real-Time",
    "phone.feature.1.desc": "Pindahkan lamaran antar tahap secara instan",
    "phone.feature.2.title": "Pengingat Cerdas",
    "phone.feature.2.desc": "Jangan pernah lewatkan follow-up atau interview",
    "phone.feature.3.title": "Dashboard Lengkap",
    "phone.feature.3.desc": "Semua statistikmu, selalu dalam jangkauan",
    "phone.cta": "Coba Gratis",
    
    // Early Bird Section
    "early.badge": "Promo Early Bird",
    "early.title": "Limited: Akses Seumur Hidup Hanya $7.99",
    "early.subtitle": "Harga Normal $17.99 • Hemat 44% • Bayar Sekali, Milik Selamanya",
    "early.timer": "Promo berakhir dalam:",
    "early.days": "Hari",
    "early.hours": "Jam",
    "early.minutes": "Menit",
    "early.seconds": "Detik",
    "early.cta": "Dapatkan Promo Early Bird",
    "early.title.mobile": "Penawaran Terbatas",
    "early.price.mobile": "Dapatkan Akses Seumur Hidup",
    "early.regular": "Harga Normal: $17.99",
    
    // Comparison Section
    "comparison.title": "Kenapa Harus JobTracker App?",
    "comparison.subtitle": "Lihat mengapa JobTracker pilihan yang lebih cerdas",
    "comparison.features": "Fitur",
    "comparison.jobtracker": "JobTracker",
    "comparison.spreadsheets": "Spreadsheet",
    "comparison.feature.1": "Tracking Visual per Tahap",
    "comparison.feature.2": "Pencatatan Gaji",
    "comparison.feature.3": "Detail Pekerjaan Terstruktur",
    "comparison.feature.4": "Pengalaman Mobile Responsif",
    "comparison.feature.5": "Pengingat Follow-Up Otomatis",
    "comparison.winner": "Pemenang",
    "comparison.why": "Kenapa harus ganti?",
    "comparison.recommended": "Direkomendasikan",
    "comparison.yes": "Ada",
    "comparison.no": "Tidak",
    "comparison.organized": "Rapi",
    "comparison.messy": "Berantakan",
    "comparison.painful": "Menyiksa",
    
    // Social Proof
    "social.title": "Pesan dari Founder",
    "social.subtitle": "Aku bikin JobTracker karena aku mager setup catetan template pake Google Spreadsheets. Terlalu banyak waktu procrastinate untuk membuat template Google Spreadsheets yang bener - bener bagus.\nAku rasa waktunya mending aku alokasikan untuk kirim cold email ke HR company daripada perlu setup Google Spreadsheets untuk nyatet job applications aku.\nJobTracker App ini tools yang aku bikin awalnya untuk diri aku sendiri dan Alhamdulillah aku berhasil dapet pekerjaan pertama aku Full Time Remote sebagai Full Stack Developer di salah satu startup yaitu sopan.id",
    "social.subtitle.2": "Semoga tools ini juga bisa membantu kamu dapet pekerjaan impian kamu.",
    "social.name": "Nafhan",
    "social.role": "Founder JobTracker App · Full Stack Developer @sopan.id",
    
    // FAQ
    "faq.title": "Pertanyaan yang Sering Diajukan",
    "faq.subtitle": "Semua yang perlu kamu tahu tentang JobTracker",
    "faq.q1": "Mengapa saya harus menggunakan JobTracker daripada Google Sheets?",
    "faq.a1": "• Papan Kanban visual (drag & drop)\n• Filter pintar & ramah mobile\n• Tidak perlu scroll ke samping lagi\n• Dibuat untuk pencari kerja, bukan akuntan",
    "faq.q2": "Apakah data lamaran saya aman dan privat?",
    "faq.a2": "Ya. Data Anda dienkripsi dan aman. Kami TIDAK menjual informasi Anda ke perekrut atau pihak ketiga. Pencarian kerja Anda tetap sepenuhnya privat.",
    "faq.q3": "Apa yang membuat paket Lifetime sepadan?",
    "faq.a3": "Bayar $17.99 sekali, milik selamanya. Dapatkan semua fitur AI masa depan termasuk. Itu seperti 6 bulan berlangganan bulanan, tapi Anda mendapat akses seumur hidup.",
    "faq.q4": "Bisakah saya menggunakan ini di ponsel?",
    "faq.a4": "Tentu saja! Sepenuhnya responsif dan bekerja dengan baik di mobile. Update status setelah wawancara, cek pengingat, atau tambah pekerjaan saat bepergian.",
    "faq.q5": "Bagaimana jika saya ingin kembali ke spreadsheet?",
    "faq.a5": "Tidak masalah! Ekspor semua data Anda ke CSV kapan saja dengan satu klik. Data Anda milik Anda, selalu.",
    "faq.q6": "Apa yang terjadi ketika saya akhirnya mendapat pekerjaan impian?",
    "faq.a6": "🎉 Selamat! Arsipkan papan Anda atau tetap aktifkan. Batalkan langganan kapan saja dengan satu klik tanpa pertanyaan. Data Anda tetap aman.",
    "faq.q7": "Apakah Anda menawarkan pengembalian dana?",
    "faq.a7": "Ya! Garansi uang kembali 15 hari untuk paket Lifetime. Jika tidak cocok untuk Anda, kami akan mengembalikan dana tanpa pertanyaan.",
    
    // Footer
    "footer.terms": "Syarat Layanan",
    "footer.privacy": "Kebijakan Privasi",
    "footer.refund": "Kebijakan Pengembalian Dana",
    "footer.contact": "Hubungi Dukungan",
    "footer.rights": "Hak cipta dilindungi.",
    
    // Pricing Page
    "pricing.title": "Investasi untuk Karirmu",
    "pricing.subtitle": "Jangan kehilangan kesempatan. Pilih paket yang sesuai dengan ambisimu.",
    "pricing.free.title": "Gratis",
    "pricing.free.desc": "Sempurna untuk memulai.",
    "pricing.free.feature1": "Lacak hingga 10 Lamaran",
    "pricing.free.feature2": "Papan Kanban Dasar",
    "pricing.free.feature3": "Filter Dasar",
    "pricing.free.feature4": "Lihat & Lacak Status",
    "pricing.free.cta": "Mulai Gratis",
    "pricing.monthly.title": "Bulanan",
    "pricing.monthly.desc": "Sempurna untuk pencari kerja aktif.",
    "pricing.monthly.feature1": "Lacak Lamaran Tak Terbatas",
    "pricing.monthly.feature2": "Papan Kanban & Filter Pintar",
    "pricing.monthly.feature3": "Pengingat Deadline Otomatis",
    "pricing.monthly.feature4": "Dukungan Email Prioritas",
    "pricing.monthly.cta": "Mulai Bulanan",
    "pricing.lifetime.title": "Pro Seumur Hidup",
    "pricing.lifetime.desc": "Bayar sekali, milik selamanya.",
    "pricing.lifetime.desc.early": "🎉 Promo Early Bird - Waktu Terbatas!",
    "pricing.lifetime.feature1": "Semua Fitur Paket Bulanan",
    "pricing.lifetime.feature2": "Bayar Sekali, Milik Selamanya",
    "pricing.lifetime.feature3": "Fitur AI Masa Depan Termasuk",
    "pricing.lifetime.feature4": "Badge Pendukung di Profil",
    "pricing.lifetime.cta": "Dapatkan Akses Seumur Hidup",
    "pricing.badge.best": "Paling Hemat",
    "pricing.badge.free": "Gratis",
    "pricing.badge.save": "Hemat",
    "pricing.guarantee": "Garansi uang kembali 30 hari",
    
    // Dashboard
    "dashboard.title": "Lamaranmu",
    "dashboard.subtitle": "Kelola perjalananmu. Filter berdasarkan status agar tetap fokus.",
    "dashboard.logout": "Keluar",
    "dashboard.admin": "Admin",
    "dashboard.loading": "Memuat pengalaman...",
    "dashboard.upgrade": "Upgrade ke Pro",
    "dashboard.billing": "Kelola Tagihan",
    "dashboard.plan": "Paket:",
    "dashboard.status": "Status:",
    "dashboard.free": "Gratis",
    "dashboard.pro": "Pro",
    "dashboard.monthly": "Bulanan",
    "dashboard.lifetime": "Seumur Hidup",
    "dashboard.active": "Aktif",
    "dashboard.cancelled": "Dibatalkan",
    "dashboard.trialing": "Percobaan",
    "dashboard.incomplete": "Tidak Lengkap",
    
    // Job Status
    "status.wishlist": "Wishlist",
    "status.applied": "Dilamar",
    "status.interview": "Wawancara",
    "status.offer": "Penawaran",
    "status.rejected": "Ditolak",
    
    // Common
    "common.save": "Simpan",
    "common.cancel": "Batal",
    "common.delete": "Hapus",
    "common.edit": "Edit",
    "common.add": "Tambah",
    "common.close": "Tutup",
    "common.loading": "Memuat...",
    "common.error": "Error",
    "common.success": "Berhasil",
    "common.unlimited": "Tak Terbatas",
    
    // Filters & Tabs
    "filter.all": "Semua Lamaran",
    "filter.applied": "Dilamar",
    "filter.emailed": "Email Terkirim",
    "filter.response": "CV Direspon",
    "filter.interview": "Wawancara",
    "filter.offer": "Penawaran",
    "filter.rejected": "Ditolak",
    "filter.ongoing": "Sedang Berjalan",
    
    // Search & Add
    "search.placeholder": "Cari posisi atau perusahaan...",
    "add.button": "Tambah Lamaran",
    "stats.button": "Statistik",
    
    // Empty States
    "empty.noJobs": "Tidak ada lamaran di tahap ini",
    "empty.noMatch": "Tidak ada lamaran yang cocok",
    "empty.keepPushing": "Terus semangat! Pekerjaan impianmu sedang menunggu.",
    "empty.adjustSearch": "Coba sesuaikan kata pencarian.",
    
    // Statistics
    "stats.title": "Statistik",
    "stats.topSources": "Sumber Lowongan Teratas",
    "stats.jobTypes": "Tipe Pekerjaan",
    "stats.stageFunnel": "Tahapan Lamaran",
    "stats.noStats": "Belum ada statistik",
    "stats.addJobs": "Tambah beberapa lamaran untuk melihat statistik",
    "stats.percentage": "Persentase:",
    "stats.applications": "Lamaran:",
    "stats.clickDetails": "Klik untuk detail lebih lanjut",
    "stats.totalApps": "Total Lamaran",
    "stats.sources": "Sumber Lowongan",
    "stats.interviewRate": "Tingkat Undangan Wawancara",
    "stats.ofApplications": "dari",
    "stats.applicationsGrowth": "Pertumbuhan Lamaran",
    "stats.last30Days": "30 hari terakhir",
    "stats.totalApplications": "Total Lamaran",

    // Profile
    "profile.userInfo": "Informasi Pengguna",
    "profile.memberSince": "Anggota sejak",
    "profile.unknown": "Tidak diketahui",
    "profile.admin": "Admin",
    "profile.freePlan": "Paket Gratis",
    "profile.lifetime": "Akses Seumur Hidup",
    "profile.monthly": "Bulanan Pro",
    "profile.renewsOn": "Diperbarui pada",
    "profile.expiresOn": "Kedaluwarsa pada",
    "profile.upgrade": "Upgrade ke Pro",
    "profile.manage": "Kelola Langganan",
    "profile.usage": "Penggunaan",
    "profile.limitReached": "Batas Tercapai",
    "profile.unlimited": "Tak Terbatas",
    "profile.limitReachedTitle": "Batas Tercapai",
    "profile.limitReachedDesc": "Kamu telah mencapai batas lamaran. Upgrade ke Pro untuk lamaran tak terbatas.",
    "profile.nearLimitTitle": "Mendekati Batas",
    "profile.nearLimitDesc": "Kamu hampir mencapai batas lamaran. Pertimbangkan untuk upgrade agar akses tak terbatas.",
    "profile.unlimitedAccess": "Akses tak terbatas",
    "profile.unlockPro": "Buka Fitur Pro",
    "profile.feature1": "Lamaran tak terbatas",
    "profile.feature2": "Filter pintar & pengingat",
    "profile.feature3": "Dukungan email prioritas",
    "profile.upgradeNow": "Upgrade Sekarang",

    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.applications": "Lamaran",
    "sidebar.clients": "Klien",
    "sidebar.profile": "Profil",
    "sidebar.settings": "Pengaturan",
    "sidebar.connected": "Terhubung",
    
    // Tracker Mode
    "tracker.job": "Job Tracker",
    "tracker.client": "Client Tracker",
    "tracker.job.subtitle": "{count} lamaran",
    "tracker.client.subtitle": "{count} klien",
    
    // Client Dashboard
    "client.dashboard": "Dashboard Klien",
    "client.dashboard.subtitle": "Lacak proyek freelance dan metrik penghasilan",
    "client.subtitle": "Kelola klien dan proyek Anda",
    "client.totalIncome": "Total Penghasilan",
    "client.totalClients": "Total Klien",
    "client.uniqueClients": "Klien unik yang dilayani",
    "client.avgRate": "Rata-rata Tarif",
    "client.avgRateDesc": "Rata-rata per proyek",
    "client.monthlyIncome": "Penghasilan Bulanan",
    "client.income": "Penghasilan",
    "client.recentProjects": "Proyek Terbaru",
    "client.viewAll": "Lihat Semua",
    "client.ongoing": "Berjalan",
    "client.completed": "Selesai",
    "client.all": "Semua",
    "client.cancelled": "Dibatalkan",
    "client.searchPlaceholder": "Cari berdasarkan klien, layanan, atau proyek...",
    "client.noProjects": "Tidak ada proyek",
    "client.addProject": "Tambah Proyek",
    "client.add": "Tambah Klien",
    "client.empty.title": "Lacak Klien Anda",
    "client.empty.desc": "Mulai lacak proyek freelance untuk melihat statistik dan insight.",
    "client.delete.title": "Hapus Proyek",
    "client.delete.description": "Apakah kamu yakin ingin menghapus proyek untuk",
    
    // Job Form Modal
    "form.title.add": "Catat Lamaran Baru",
    "form.title.edit": "Edit Lamaran",
    "form.step": "Langkah",
    "form.next": "Lanjut",
    "form.back": "Kembali",
    "form.jobTitle": "Posisi Pekerjaan",
    "form.jobTitle.placeholder": "contoh: Frontend Developer",
    "form.company": "Perusahaan",
    "form.company.placeholder": "contoh: Google",
    "form.salary": "Gaji Potensial (Bulanan)",
    "form.salary.placeholder": "contoh: 15000000",
    "form.salary.exact": "Nilai Pasti",
    "form.salary.range": "Rentang Gaji",
    "form.salary.unspecified": "Tidak Ditentukan",
    "form.salary.min": "Min",
    "form.salary.max": "Maks",
    "form.url": "URL Lamaran",
    "form.url.placeholder": "https://...",
    "form.jobSource": "Sumber Lowongan",
    "form.jobSource.placeholder": "Pilih sumber...",
    "form.jobType": "Tipe Pekerjaan",
    "form.jobType.placeholder": "Pilih Tipe",
    "form.location": "Lokasi",
    "form.location.placeholder": "Pilih...",
    "form.recruiterEmail": "Email Rekruter",
    "form.recruiterEmail.placeholder": "rekruter@perusahaan.com",
    "form.status.title": "Lacak Progres",
    "form.status.applied": "Dilamar",
    "form.status.emailed": "Email ke Rekruter",
    "form.status.response": "CV Direspon",
    "form.status.interview": "Email Wawancara",
    "form.status.offer": "Kontrak/Penawaran",
    "form.status.rejected": "Ditolak",
    "form.warning.editLocked": "Edit dikunci untuk Paket Gratis",
    "form.warning.editUpgrade": "Upgrade ke Pro untuk mengedit lamaran.",
    "form.warning.limitReached": "Batas lamaran tercapai",
    "form.warning.limitUpgrade": "Kamu sudah mencapai batas {limit} lamaran. Upgrade ke Pro untuk lamaran tak terbatas.",
    "form.usage": "Menggunakan {current}/{limit} lamaran",
    "form.submit.add": "Catat Lamaran",
    "form.submit.edit": "Simpan Perubahan",
    "form.freeUsage": "Penggunaan Paket Gratis",
    "form.limitReachedShort": "Batas tercapai",
    
    // Job Card
    "card.edit": "Edit",
    "card.delete": "Hapus",
    "card.salary": "Gaji",
    "card.type": "Tipe",
    "card.unknown": "Tidak Diketahui",
    "card.confirmDelete": "Apakah kamu yakin ingin menghapus lamaran ini?",
    "card.upgradeEdit": "Upgrade ke Pro untuk mengedit lamaran.\n\nApakah kamu ingin upgrade sekarang?",
    "card.upgradeDelete": "Upgrade ke Pro untuk menghapus lamaran.\n\nApakah kamu ingin upgrade sekarang?",
    
    // Tutorial
    "tutorial.welcome.title": "Selamat Datang di JobTracker!",
    "tutorial.welcome.desc": "Mulai tracking lamaran kerjamu dengan mudah. Yuk, kenali fitur-fiturnya.",
    "tutorial.welcome.start": "Mulai Tour",
    "tutorial.welcome.skip": "Lewati",
    "tutorial.addButton.title": "Tambah Lamaran",
    "tutorial.addButton.desc": "Klik tombol ini untuk mencatat lamaran baru. Isi detailnya dan pantau progresmu.",
    "tutorial.pipeline.title": "Status Pipeline",
    "tutorial.pipeline.desc": "Filter lamaran berdasarkan status: Dilamar, Direspon, Wawancara, atau Penawaran. Tetap terorganisir!",
    "tutorial.next": "Lanjut",
    "tutorial.skip": "Lewati",
    "tutorial.complete.title": "Kamu siap mulai!",
    "tutorial.complete.desc": "Mulai catat lamaran kerjamu. Semoga sukses dalam pencarian kerja!",
    "tutorial.complete.cta": "Mulai Sekarang",
    
    // Milestone Toasts
    "milestone.streak": "Streak {n} hari! Pencari kerja aktif lebih cepat dapat interview.",
    "milestone.apps15": "15 lamaran tercatat! Pertahankan momentum!",
    "milestone.apps30": "30 lamaran! Kamu di jalur yang tepat!",
    "milestone.apps50": "50 lamaran! Dedikasi yang luar biasa!",
    "milestone.apps70": "70 lamaran! Konsistensi adalah kunci!",
    "milestone.apps100": "100 lamaran! Semangat pantang menyerah!",
    
    // Feedback
    "feedback.title": "Feedback",
    "feedback.type": "Tipe",
    "feedback.type.general": "Umum",
    "feedback.type.bug": "Laporan Bug",
    "feedback.type.feature": "Permintaan Fitur",
    "feedback.rating": "Rating",
    "feedback.message.placeholder": "Ceritakan pendapatmu...",
    "feedback.submit": "Kirim Feedback",
    "feedback.success": "Terima kasih atas feedbackmu!",
    "feedback.error": "Gagal mengirim feedback. Silakan coba lagi.",
    
    // Onboarding
    "onboarding.step": "Langkah {{current}}/{{total}}",
    "onboarding.back": "Kembali",
    "onboarding.next": "Lanjut",
    "onboarding.finish": "Mulai Tracking",
    "onboarding.skip": "Lewati dulu",
    
    "onboarding.q1.title": "Kamu lagi di tahap mana dalam pencarian kerja?",
    "onboarding.q1.just_started": "Baru mulai cari",
    "onboarding.q1.applied_some": "Udah apply ke beberapa tempat",
    "onboarding.q1.actively_interviewing": "Lagi aktif interview",
    "onboarding.q1.employed_looking": "Mau pindah kerja (masih employed)",
    
    "onboarding.q2.title": "Role atau bidang apa yang kamu incar?",
    "onboarding.q2.search_placeholder": "Cari role...",
    "onboarding.q2.other": "Lainnya",
    "onboarding.q2.custom_placeholder": "Masukkan role lainnya",
    
    "onboarding.q3.title": "Kamu lebih pilih kerja di mana?",
    "onboarding.q3.remote": "Remote / WFH",
    "onboarding.q3.onsite": "On-site / WFO",
    "onboarding.q3.hybrid": "Hybrid",
    "onboarding.q3.flexible": "Fleksibel (tidak ada preferensi)",
    
    "onboarding.q4.title": "Pengalaman kerja kamu saat ini?",
    "onboarding.q4.no_experience": "Belum pernah sama sekali",
    "onboarding.q4.internship": "Baru pernah magang",
    "onboarding.q4.less_1_year": "Kurang dari 1 tahun",
    "onboarding.q4.one_to_three": "1-3 tahun",
    "onboarding.q4.three_plus": "3+ tahun",
  },
};
