'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Sparkles, FileText, Send, Globe, Coins } from 'lucide-react';
import { useLanguage } from '@/lib/language/context';

// --- Typewriter Component ---
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const characters = text.split('');
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.02, delayChildren: delay } },
        hidden: {},
      }}
      className="inline"
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// --- Main Section Component ---
export default function AIWriterLandingSection() {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'outreach'>('cover_letter');

  const features = [
    {
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      title: t("aiwriter.feature.1.title"),
      description: t("aiwriter.feature.1.description")
    },
    {
      icon: <Send className="w-5 h-5 text-blue-500" />,
      title: t("aiwriter.feature.2.title"),
      description: t("aiwriter.feature.2.description")
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-500" />,
      title: t("aiwriter.feature.3.title"),
      description: t("aiwriter.feature.3.description")
    },
    {
      icon: <Coins className="w-5 h-5 text-blue-500" />,
      title: t("aiwriter.feature.4.title"),
      description: t("aiwriter.feature.4.description")
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
          >
            {t("aiwriter.title").split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            {t("aiwriter.subtitle")}
          </motion.p>
        </div>

        {/* Two Column Layout - DIUBAH KE items-start DI SINI */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left: Interactive Mockup Window */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-blue-500 rounded-3xl blur-3xl opacity-10 transform -rotate-6"></div>
            
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
              {/* Mockup Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex bg-slate-200/50 rounded-lg p-1">
                  <button 
                    onClick={() => setActiveTab('cover_letter')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'cover_letter' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("aiwriter.mockup.cover_letter_tab")}
                  </button>
                  <button 
                    onClick={() => setActiveTab('outreach')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'outreach' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t("aiwriter.mockup.outreach_tab")}
                  </button>
                </div>
              </div>

              {/* Mockup Body (The Typewriter part) */}
              <div className="p-6 h-[350px] overflow-hidden flex flex-col">
                {/* Scraping Status Bar */}
                <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </motion.div>
                  <span className="font-medium text-slate-700">{t("aiwriter.mockup.generating")}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    - 80 JPs
                  </span>
                </div>

                {/* Animated Text Content */}
                <div className="flex-1 text-sm text-slate-600 leading-relaxed font-serif relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white pointer-events-none z-10"></div>
                  {activeTab === 'cover_letter' ? (
                    <div>
                      <div className="mb-4">Dear Hiring Manager,</div>
                      <div className="mb-4">
                        <TypewriterText key="cl-1" text={t("aiwriter.mockup.cover_letter.p1")} delay={0.5} />
                      </div>
                      <div>
                        <TypewriterText key="cl-2" text={t("aiwriter.mockup.cover_letter.p2")} delay={4} />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <TypewriterText key="dm-1" text={t("aiwriter.mockup.outreach.p1")} delay={0.5} />
                      </div>
                      <div className="mb-4">
                        <TypewriterText key="dm-2" text={t("aiwriter.mockup.outreach.p2")} delay={1.5} />
                      </div>
                      <div>
                        <TypewriterText key="dm-3" text={t("aiwriter.mockup.outreach.p3")} delay={5.5} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Feature Highlights */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="pt-4 flex justify-center lg:justify-start"
            >
              <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors shadow-sm hover:shadow-md mx-auto lg:mx-0">
                {t("aiwriter.cta")}
                <Send className="w-4 h-4" />
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}