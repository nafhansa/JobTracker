import Link from "next/link";
import Image from "next/image"; // Import Image dari Next.js
import { ArrowRight, CheckCircle2, LayoutDashboard, ShieldCheck, Star, CreditCard, Check } from "lucide-react";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen justify-center bg-[#1a0201] px-6 text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] overflow-x-hidden">
      <Navbar />
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* --- HERO SECTION --- */}
        <section className="pt-24 md:pt-40 pb-20 px-6 text-center max-w-5xl mx-auto space-y-8 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase border border-[#8C1007]/50 rounded-full text-[#FFF0C4] bg-[#8C1007]/20 shadow-[0_0_15px_rgba(140,16,7,0.4)] backdrop-blur-sm">
            <Star className="w-3 h-3 text-[#8C1007] fill-current" /> Premium Career Management
          </div>
          
          <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] text-[#FFF0C4] drop-shadow-2xl">
            Stop Using Spreadsheets <br/>
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-1 bg-[#8C1007]/20 blur-xl rounded-full"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#FFF0C4] via-[#ffaa99] to-[#8C1007]">
                For Your Future.
              </span>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#FFF0C4]/70 max-w-2xl mx-auto font-light leading-relaxed">
            Track your job search with elegance. Monitor status, salaries, and follow-ups in one <span className="text-[#FFF0C4] font-semibold underline decoration-[#8C1007] decoration-2 underline-offset-4">sophisticated dashboard</span>.
          </p>
          
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <Link 
              href="/login" 
              className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-widest text-[#FFF0C4] bg-[#8C1007] rounded-sm hover:bg-[#a31208] transition-all duration-300 shadow-[0_0_20px_rgba(140,16,7,0.4)] hover:shadow-[0_0_40px_rgba(140,16,7,0.6)] uppercase overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            </Link>
            
            <Link href="#pricing" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold tracking-widest text-[#FFF0C4] border border-[#FFF0C4]/20 rounded-sm hover:bg-[#FFF0C4]/10 transition-all duration-300 uppercase">
              View Pricing
            </Link>
          </div>
        </section>

        {/* --- PRODUCT SHOWCASE (UPDATED: REAL SCREENSHOT) --- */}
        {/* Paddle Point #3: Clear display of product features */}
        <div className="relative w-full max-w-6xl px-4 mt-8 md:mt-16 mb-24 perspective-[2000px] group">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#8C1007] rounded-full blur-[100px] opacity-20"></div>
           
           <div className="relative bg-[#1a0201] border border-[#FFF0C4]/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-sm transform rotate-x-[10deg] group-hover:rotate-x-[0deg] transition-all duration-700 ease-out">
              {/* Browser Bar */}
              <div className="h-8 bg-[#3E0703] flex items-center px-4 space-x-2 border-b border-[#FFF0C4]/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  <div className="ml-4 px-3 py-1 bg-[#1a0201]/50 rounded text-[10px] text-[#FFF0C4]/40 font-mono hidden md:block">jobtrackerapp.site/dashboard</div>
              </div>
              
             
              <div className="relative aspect-video w-full bg-[#1a0201]">
                 <Image 
                  src="/dashboard-preview.png" 
                  alt="JobTracker Dashboard Interface" 
                  fill
                  className="object-cover object-top"
                  priority
                 />
              </div>
           </div>
        </div>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-20 w-full max-w-6xl px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#FFF0C4] mb-4">Why JobTracker?</h2>
              <p className="text-[#FFF0C4]/60">Everything you need to manage your career journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<LayoutDashboard className="w-6 h-6" />}
                title="Kanban Board"
                desc="Visualize your applications from 'Applied' to 'Offer' in a drag-and-drop interface."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-6 h-6" />}
                title="Application History"
                desc="Keep a detailed log of every company, salary offer, and interview date."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-6 h-6" />}
                title="Privacy First"
                desc="Your career data is sensitive. We encrypt it and never share it with recruiters."
              />
            </div>
        </section>
      </main>

      {/* --- FOOTER (UPDATED: EXPLICIT LINKS) --- */}
      {/* Paddle Point #4: Clear navigation to Terms, Privacy, Refund */}
      <footer className="py-12 border-t border-[#FFF0C4]/10 bg-[#150201] relative z-10 text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
           
           <div className="text-center md:text-left">
              <p className="text-[#FFF0C4] font-bold tracking-widest uppercase mb-2">JobTracker</p>
              <p className="text-[#FFF0C4]/40">&copy; {new Date().getFullYear()} All rights reserved.</p>
           </div>

           <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[#FFF0C4]/60">
              <Link href="/terms-policy#terms" className="hover:text-[#8C1007] transition-colors">Terms of Service</Link>
              <Link href="/terms-policy#privacy" className="hover:text-[#8C1007] transition-colors">Privacy Policy</Link>
              <Link href="/terms-policy#refund" className="hover:text-[#8C1007] transition-colors">Refund Policy</Link>
              <Link href="/terms-policy#contact" className="hover:text-[#8C1007] transition-colors">Contact Support</Link>
           </div>

           <div className="text-[#FFF0C4]/40 text-xs">
              <a href="mailto:official.jobtrackerapp@gmail.com" className="hover:text-[#FFF0C4] flex items-center gap-2">
                 official.jobtrackerapp@gmail.com
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-[#2a0401] backdrop-blur-md rounded-xl border border-[#FFF0C4]/5 hover:border-[#8C1007]/50 hover:bg-[#3E0703] transition-all duration-500 group">
      <div className="w-12 h-12 bg-[#3E0703] border border-[#FFF0C4]/10 text-[#8C1007] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-[#FFF0C4] group-hover:border-[#8C1007] transition-all duration-300">
        {icon}
      </div>
      <h3 className="font-serif font-bold text-xl mb-3 text-[#FFF0C4] tracking-wide">{title}</h3>
      <p className="text-[#FFF0C4]/60 leading-relaxed font-light text-sm">{desc}</p>
    </div>
  );
}