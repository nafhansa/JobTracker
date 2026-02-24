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
import GmailConnect from "@/components/GmailConnect";
import JobFormModal from "@/components/forms/AddJobModal";
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
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen pt-16 lg:pt-20"> {/* Pakai min-h-screen, bukan fixed height */}
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
      <main className="flex-1 lg:pl-64 w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-6 pb-24 lg:pb-12"> {/* Tambah pb lebih besar untuk mobile nav */}
          {/* Section Header */}
          <div className="mb-6 md:mb-8">
            {activeSection === "dashboard" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Track your job search progress and performance metrics
                </p>
              </>
            )}
            {activeSection === "applications" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 tracking-tight">
                  {t("dashboard.title")}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {t("dashboard.subtitle")}
                </p>
              </>
            )}
            {activeSection === "profile" && (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1 tracking-tight">
                  Profile
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  View your subscription and account details
                </p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Floating Button & Nav tetap sama */}
      {/* Floating Add Button - Only show on dashboard section */}
      {activeSection === "dashboard" && (
        <>
          {/* Mobile: Top-right button with text */}
          <div className="fixed top-20 right-4 z-50 md:hidden">
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </Button>
          </div>

          {/* Desktop: Bottom-right floating button */}
          <div className="hidden md:block fixed bottom-8 right-8 z-50">
            <Button
              onClick={handleAddNew}
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20 rounded-full h-14 w-14 flex items-center justify-center"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={setActiveSection} />

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
