import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function TermsPolicyPage() {
  const lastUpdated = "January 6, 2026";

  const sections = [
    { id: "terms", title: "Terms of Service" },
    { id: "acceptable-use", title: "Acceptable Use" },
    { id: "privacy", title: "Privacy Policy" },
    { id: "cookies", title: "Cookie Policy" },
    { id: "refund", title: "No Refund Policy" }, // Updated title
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#1a0201] text-[#FFF0C4] font-sans selection:bg-[#8C1007] selection:text-[#FFF0C4] overflow-x-hidden">
      <Navbar />
      
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#500905] via-[#3E0703] to-[#150201]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 240, 196, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 240, 196, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <main className="flex-1 relative z-10 pt-24 md:pt-32 pb-20">
        <div className="w-full max-w-6xl mx-auto px-6">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4 text-[#FFF0C4] drop-shadow-md">
              Terms & Policies
            </h1>
            <p className="text-[#FFF0C4]/60 text-sm tracking-widest uppercase">
              Last Updated: {lastUpdated}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation (Sticky) */}
            <aside className="lg:col-span-3 hidden lg:block">
              <nav className="sticky top-32 space-y-1">
                <p className="text-xs font-bold text-[#8C1007] uppercase tracking-widest mb-4 pl-3">
                  Contents
                </p>
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm text-[#FFF0C4]/60 hover:text-[#FFF0C4] hover:bg-[#FFF0C4]/5 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-[#8C1007]"
                  >
                    {section.title}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-16 text-[#FFF0C4]/90 leading-relaxed">
              
              {/* 1. Terms of Service */}
              <section id="terms" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Terms of Service
                </h2>
                <div className="space-y-4 text-base md:text-lg text-[#FFF0C4]/80">
                  <p>
                    Welcome to <strong className="text-[#FFF0C4]">JobTracker</strong>. By accessing or using our website and services, you agree to be bound by these terms. If you represent an organization, you agree to these terms on behalf of that organization.
                  </p>
                  <p>
                    We reserve the right to modify these terms at any time. Continued use of the service after any such changes constitutes your acceptance of the new terms.
                  </p>
                  <h3 className="text-xl font-semibold text-[#FFF0C4] mt-6 mb-2">User Accounts</h3>
                  <ul className="list-disc pl-5 space-y-2 marker:text-[#8C1007]">
                    <li>You are responsible for maintaining the security of your account and password.</li>
                    <li>You must provide accurate and complete information when creating an account.</li>
                    <li>We are not liable for any loss or damage from your failure to comply with this security obligation.</li>
                  </ul>
                </div>
              </section>

              {/* 2. Acceptable Use */}
              <section id="acceptable-use" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Acceptable Use Policy
                </h2>
                <div className="space-y-4 text-base md:text-lg text-[#FFF0C4]/80">
                  <p>
                    You agree not to misuse the JobTracker services. For example, you must not:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 marker:text-[#8C1007]">
                    <li>Probe, scan, or test the vulnerability of any system or network.</li>
                    <li>Breach or otherwise circumvent any security or authentication measures.</li>
                    <li>Access, tamper with, or use non-public areas or parts of the Service.</li>
                    <li>Interfere with or disrupt any user, host, or network, for example by sending a virus, overloading, flooding, spamming, or mail-bombing.</li>
                  </ul>
                </div>
              </section>

              {/* 3. Privacy Policy */}
              <section id="privacy" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Privacy Policy
                </h2>
                <div className="space-y-4 text-base md:text-lg text-[#FFF0C4]/80">
                  <p>
                    Your privacy is critically important to us. At JobTracker, we have a few fundamental principles:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 marker:text-[#8C1007]">
                    <li>We don’t ask you for personal information unless we truly need it.</li>
                    <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
                    <li>We don’t store personal information on our servers unless required for the on-going operation of one of our services.</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-[#FFF0C4] mt-6 mb-2">Data Security</h3>
                  <p>
                    We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet is 100% secure.
                  </p>
                </div>
              </section>

              {/* 4. Cookie Policy */}
              <section id="cookies" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Cookie Policy
                </h2>
                <div className="space-y-4 text-base md:text-lg text-[#FFF0C4]/80">
                  <p>
                    JobTracker uses "cookies" to help us identify and track visitors, their usage of our website, and their website access preferences.
                  </p>
                  <p>
                    Visitors who do not wish to have cookies placed on their computers should set their browsers to refuse cookies before using our websites, with the drawback that certain features may not function properly without the aid of cookies.
                  </p>
                </div>
              </section>

              {/* 5. NO REFUND POLICY (UPDATED) */}
              <section id="refund" className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Cancellation & No Refund Policy
                </h2>
                <div className="space-y-4 text-base md:text-lg text-[#FFF0C4]/80">
                  <div className="p-5 border border-[#8C1007]/50 bg-[#8C1007]/20 rounded-lg shadow-[0_0_15px_rgba(140,16,7,0.1)]">
                    <p className="font-bold text-[#FFF0C4] uppercase tracking-wide text-sm mb-2">
                      Please Read Carefully
                    </p>
                    <p className="font-medium text-white/90">
                      All purchases are final. We do not offer refunds for partial subscription periods or unused services.
                    </p>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-[#FFF0C4] mt-4 mb-2">Digital Services</h3>
                  <p>
                    Because JobTracker provides instant access to digital tools and premium features upon purchase, <strong>we do not offer a money-back guarantee</strong>. By subscribing, you acknowledge and agree that you are purchasing a non-refundable digital product.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-[#FFF0C4] mt-4 mb-2">Cancellation</h3>
                  <p>
                    You may cancel your subscription at any time via your account settings. Upon cancellation, you will retain access to premium features until the end of your current billing cycle. After that period ends, you will not be charged again, but no refunds will be issued for the previous payments.
                  </p>
                </div>
              </section>

              {/* 6. Contact */}
              <section id="contact" className="scroll-mt-32 pb-12 border-b border-[#FFF0C4]/10">
                <h2 className="text-2xl font-bold mb-6 text-[#FFF0C4] border-l-4 border-[#8C1007] pl-4">
                  Contact Us
                </h2>
                <p className="text-lg text-[#FFF0C4]/80 mb-4">
                  If you have any questions about these Terms, Privacy Policy, or Cancellation Policy, please contact us at:
                </p>
                <a 
                  href="mailto:official.jobtrackerapp@gmail.com" 
                  className="inline-flex items-center space-x-2 text-[#8C1007] font-bold text-lg hover:text-[#FFF0C4] transition-colors"
                >
                  <span>official.jobtrackerapp@gmail.com</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </a>
              </section>

            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-[#FFF0C4]/10 text-center text-sm text-[#FFF0C4]/40 relative z-10">
        <p>&copy; {new Date().getFullYear()} JobTracker. All rights reserved.</p>
      </footer>
    </div>
  );
}