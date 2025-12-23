"use client";

import { loginWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation"; 
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter(); 
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard"); 
    } catch (error) {
      console.error(error);
      alert("Gagal login bro"); 
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] relative overflow-hidden">
      {}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#500905] via-[#1a0201] to-[#000000]"></div>
         {}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
         {}
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      {}
      <div className="relative z-10 w-full max-w-md px-6">
        
        {}
        <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-[#FFF0C4]/60 hover:text-[#FFF0C4] transition-colors duration-300 group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </Link>
        </div>
        <div className="bg-[#3E0703]/60 backdrop-blur-xl border border-[#FFF0C4]/10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-8 md:p-10 text-center relative overflow-hidden group">  
            {}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8C1007]/30 rounded-full blur-[50px]"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#8C1007]/20 rounded-full blur-[50px]"></div>
            {}
            <h2 className="text-3xl font-serif font-bold tracking-wider mb-2 text-[#FFF0C4]">
                Job<span className="text-[#8C1007]">Tracker</span>.
            </h2>
            <p className="text-[#FFF0C4]/60 text-sm mb-8 font-light">
                Manage your professional journey with elegance.
            </p>
            {}
            <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-[#FFF0C4] text-[#3E0703] px-6 py-4 rounded-lg font-bold tracking-wide hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg group-hover:shadow-[#FFF0C4]/20"
            >
                {}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
            </button>
            {}
            <div className="mt-8 pt-6 border-t border-[#FFF0C4]/10 text-xs text-[#FFF0C4]/40">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
        </div>
      </div>
    </div>
  );
}