// /home/nafhan/Documents/projek/job/src/app/admin/page.tsx
"use client"; // ✅ Wajib ada karena pakai useEffect

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
// import { getAllUsers } from "@/lib/firebase/admin"; ❌ BARIS INI HAPUS TOTAL!

interface AppUser {
  uid: string;
  email: string | null;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const admins = ["nafhan1723@gmail.com", "nafhan.sh@gmail.com"];
  useEffect(() => {
    if (!loading) {
      // Ganti email ini dengan email admin kamu
      if (user && admins.includes(user.email || "")) {
        setIsAdmin(true);

        // --- BAGIAN INI DIGANTI ---
        const fetchUsers = async () => {
          try {
            // Kita panggil API yang baru kita buat di Langkah 1
            const response = await fetch("/api/users"); 
            const data = await response.json();
            
            if (response.ok) {
              setUsers(data);
            } else {
              console.error("Failed to fetch users");
            }
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        };
        // --------------------------
        
        fetchUsers();
      } else {
        // Kalau bukan admin, tendang ke dashboard biasa
        router.push("/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a0201]">
        <p className="text-[#FFF0C4]">Loading or unauthorized...</p>
      </div>
    );
  }
  
  // Sisa kode tampilan ke bawah SAMA PERSIS, tidak perlu diubah.
  return (
    <div className="min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans">
      <header className="bg-[#3E0703]/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg">
        <h1 className="font-serif font-bold text-xl tracking-widest text-[#FFF0C4]">
          Admin Dashboard
        </h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-bold tracking-widest text-[#FFF0C4] hover:text-[#8C1007]"
        >
          Back to Dashboard
        </button>
      </header>
      <main className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[#2a0401] border border-[#FFF0C4]/10 rounded-xl">
            <thead>
              <tr className="border-b border-[#FFF0C4]/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">User Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#FFF0C4]/60 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FFF0C4]/10">
              {users.map((appUser) => (
                <tr key={appUser.uid}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]">{appUser.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80">{new Date(appUser.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#FFF0C4]/80 capitalize">{appUser.subscription?.plan || "Free"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appUser.subscription?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {appUser.subscription?.status || "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}