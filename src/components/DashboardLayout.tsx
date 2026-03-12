"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobApplication } from "@/types";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar, { SidebarSection } from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import DashboardSection from "@/components/DashboardSection";
import DashboardClient from "@/components/tracker/DashboardClient";
import ProfileSection from "@/components/ProfileSection";
import SettingsSection from "@/components/SettingsSection";
import GmailConnect from "@/components/GmailConnect";
import JobFormModal from "@/components/forms/AddJobModal";
import PWAFloatingButton from "@/components/PWAFloatingButton";
import { getPlanLimits, isAdminUser } from "@/lib/supabase/subscriptions";
import { useAuth } from "@/lib/firebase/auth-context";
import { useLanguage } from "@/lib/language/context";
import { FREE_PLAN_JOB_LIMIT } from "@/types";

interface DashboardLayoutProps {
  jobs: JobApplication[];
  userId: string;
  plan?: string;
}

export default function DashboardLayout({ jobs, userId, plan }: DashboardLayoutProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, subscription } = useAuth();
  const [activeSection, setActiveSection] = useState<SidebarSection>("dashboard");

  const isAdmin = isAdminUser(user?.email || "");
  const isPro = subscription?.plan !== "free";
  const isSubscribed = isAdmin || isPro;
  const isFreeUser = plan === "free" && !isAdmin;

  // Shared modal state for Add Job
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);

  const handleAddNew = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handlePlusButtonClick = () => {
    setActiveSection("applications");
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };

  const handleNavigateToApplications = () => {
    setActiveSection("applications");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection jobs={jobs} userId={userId} plan={plan} onAddJob={handleAddNew} onEditJob={handleEditJob} onNavigateToApplications={handleNavigateToApplications} />;
      case "applications":
        return (
          <>
            <DashboardClient
              initialJobs={jobs}
              userId={userId}
              plan={plan}
            />
          </>
        );
      case "profile":
        return <ProfileSection isAdmin={isAdmin} />;
      case "settings":
        return <SettingsSection isAdmin={isAdmin} />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${activeSection === "applications" ? "h-[calc(100vh-40px)]" : "min-h-screen"} pt-0 lg:pt-20 overflow-hidden`}>
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMobileOpen={false}
          onMobileClose={() => {}}
        />
      </div>

      {/* Main Content */}
      <main className={`flex-1 lg:pl-64 w-full min-h-0 ${activeSection === "applications" ? "overflow-hidden" : ""}`}>
        <div className={`${activeSection === "applications" ? "h-full flex flex-col px-4 sm:px-6 md:px-8 lg:px-16 xl:px-18 pt-3 md:pt-4 min-h-0" : "max-w-7xl mx-auto p-4 pt-6 md:pt-6 md:p-6 pb-26 lg:pb-18"}`}>
          {/* Section Header */}
          <div className="mb-0 md:mb-1.5">
            {activeSection === "dashboard" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-0.5 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-4">
                  Track your job search progress and performance metrics
                </p>
              </>
            )}
            {activeSection === "applications" && (
              <>
                <h1 className="text-3xl md:text-4xl pt-0.5 md:pt-2 font-bold text-foreground mb-0.5 tracking-tight">
                  {t("dashboard.title")}
                </h1>
                <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-4">
                  {t("dashboard.subtitle")}
                </p>
              </>
            )}
            {activeSection === "profile" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-0.5 tracking-tight">
                  Profile
                </h1>
                <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-4">
                  View your subscription and account details
                </p>
              </>
            )}
            {activeSection === "settings" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-0.5 tracking-tight">
                  Settings
                </h1>
                <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-4">
                  Customize your app preferences
                </p>
              </>
            )}
          </div>

          {/* Content */}
          <div className={`${activeSection === "applications" ? "h-full flex flex-col min-h-0" : "animate-in fade-in duration-500"}`}>
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={setActiveSection} onPlusButtonClick={handlePlusButtonClick} />

      {/* PWA Floating Install Button */}
      <PWAFloatingButton />

      {/* Shared Job Form Modal */}
      <JobFormModal
        userId={userId}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        jobToEdit={editingJob}
        plan={plan}
        currentJobCount={jobs.length}
        isAdmin={false}
      />
    </div>
  );
}
