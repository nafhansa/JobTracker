"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { subscribeToAuthChanges, logout } from "@/lib/firebase/auth";
import { subscribeToJobs } from "@/lib/firebase/firestore";
import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { JobApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import DashboardClient from "@/components/tracker/DashboardClient";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const unsubscribeDocs = subscribeToJobs(user.uid, (data) => {
        
        const sanitizedData = data.map((job) => ({
          ...job,
          createdAt: job.createdAt ? (job.createdAt as unknown as Timestamp).toMillis() : Date.now(),
          updatedAt: job.updatedAt ? (job.updatedAt as unknown as Timestamp).toMillis() : Date.now(),
        }));
        setJobs(sanitizedData as unknown as JobApplication[]);
        setLoading(false);
      });
      return () => unsubscribeDocs();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!user) return null; 
  return (
    <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4]">
      {}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#500905] via-[#1a0201] to-[#000000]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      {}
      <nav className="relative z-30 border-b border-[#FFF0C4]/10 bg-[#3E0703]/80 backdrop-blur-md sticky top-0 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <h1 className="font-serif font-bold text-xl tracking-widest text-[#FFF0C4]">
            Job<span className="text-[#8C1007]">Tracker</span>.
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs font-medium tracking-wide text-[#FFF0C4]/60 uppercase">
            {user.email}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-[#FFF0C4] hover:text-[#8C1007] hover:bg-[#FFF0C4]/10 border border-[#FFF0C4]/20 hover:border-[#8C1007]/50 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>
      {}
      <main className="relative z-10 max-w-6xl mx-auto p-6 md:py-10">
        {}
        <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0C4] to-[#ffdca0] mb-2 drop-shadow-sm">
              Your Applications
            </h2>
            <p className="text-[#FFF0C4]/60 text-lg">
              Manage your journey. Filter by status to stay focused.
            </p>
        </div>
        {}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-[#3E0703]/30 border border-[#FFF0C4]/5 rounded-xl" />
            ))}
          </div>
        ) : (
            <DashboardClient initialJobs={jobs} userId={user.uid} />
        )}
      </main>
    </div>
  );
}