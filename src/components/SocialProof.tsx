'use client'; // Diperlukan jika menggunakan Next.js App Router karena ada interaksi hover

import React from 'react';
import { Quote, Star } from 'lucide-react';
import { useLanguage } from '@/lib/language/context';

// 1. Data Dummy yang Diperluas & Ditambah Rating
const testimonialsData = [
  {
    name: "Arya W.",
    role: "Fresh Graduate",
    content: "I used to track everything in Excel, but scrolling sideways was a pain. Moving cards here feels much more productive.",
    initials: "AW",
    rating: 5
  },
  {
    name: "Nadia P.",
    role: "Career Switcher",
    content: "Honestly, I just needed something simple to remind me which recruiter to email. The visual board is a life saver.",
    initials: "NP",
    rating: 5
  },
  {
    name: "Dimas R.",
    role: "Frontend Dev (Job Hunting)",
    content: "The salary comparison feature helped me negotiate my current offer. Simple tool, but effective.",
    initials: "DR",
    rating: 4
  },
  {
    name: "Budi S.",
    role: "Laid-off (Back in Market)",
    content: "Lost track of dozens of applications during my last layoff. This app keeps me sane this time around.",
    initials: "BS",
    rating: 5
  },
  {
    name: "Sarah K.",
    role: "Marketing Specialist",
    content: "Love the mobile view. I can quickly update status right after an interview even when I'm in a Grab.",
    initials: "SK",
    rating: 4
  },
  {
    name: "Reza M.",
    role: "Final Year Student",
    content: "It's free tier is generous enough for my internship hunt. Better than messy Google Sheets.",
    initials: "RM",
    rating: 5
  }
];

// Duplikasi data untuk efek infinite scroll yang mulus
const infiniteTestimonials = [...testimonialsData, ...testimonialsData];

// 2. Komponen Kecil untuk Render Bintang
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5 mb-3">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

const SocialProof = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 w-full bg-background border-y border-border overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {t("social.title")}
          </h2>
          <p className="text-muted-foreground text-base">
            {t("social.subtitle")}
          </p>
        </div>
      </div>

      {/* 3. Container Marquee/Carousel */}
      {/* 'group' ditambahkan di sini agar saat di-hover, animasinya berhenti (pause) */}
      <div className="relative w-full group">
        {/* Efek Fade di kiri kanan agar kartu terlihat muncul/hilang perlahan */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        {/* Track Animasi */}
        {/* animate-marquee-reverse: Custom animation (lihat CSS di bawah) */}
        {/* group-hover:paused : Fitur UX penting, biar user bisa baca kalo dihover */}
        <div className="flex w-max gap-6 animate-marquee-reverse group-hover:paused">
          {infiniteTestimonials.map((item, idx) => (
            <div 
              key={idx} 
              // Ukuran kartu fix (w-[350px]) agar rapi saat berjalan
              className="w-[350px] flex-shrink-0 bg-card p-6 rounded-xl border border-border shadow-sm relative select-none"
            >
               <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {item.initials}
                </div>
                <div>
                  <div className="text-foreground font-medium text-sm">{item.name}</div>
                  <div className="text-muted-foreground text-xs">{item.role}</div>
                </div>
              </div>

              {/* Tambahkan Rating */}
              <StarRating rating={item.rating} />
              
              <p className="text-muted-foreground text-sm leading-relaxed italic line-clamp-3">
                &quot;{item.content}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
