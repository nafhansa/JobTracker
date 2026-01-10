'use client'; // Tambahkan ini kalau pakai Next.js App Router
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Why should I use JobTracker instead of Google Sheets?",
    answer: "• Visual Kanban board (drag & drop)\n• Smart filters & mobile-friendly\n• No more scrolling sideways\n• Built for job seekers, not accountants"
  },
  {
    question: "Is my application data safe and private?",
    answer: "Yes. Your data is encrypted and secure. We do NOT sell your information to recruiters or third parties. Your job search stays completely private."
  },
  {
    question: "What makes the Lifetime plan worth it?",
    answer: "Pay $17.99 once, own it forever. Get all future AI features included. That's like 6 months of monthly, but you get lifetime access instead."
  },
  {
    question: "Can I use this on my phone?",
    answer: "Absolutely! Fully responsive and works great on mobile. Update status after interviews, check reminders, or add jobs on the go."
  },
  {
    question: "What if I want to go back to spreadsheets?",
    answer: "No problem! Export all your data to CSV anytime with one click. Your data belongs to you, always."
  },
  {
    question: "What happens when I finally land my dream job?",
    answer: "🎉 Congrats! Archive your board or keep it active. Cancel subscription anytime with one click no questions asked. Your data stays safe."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes! 15-days money-back guarantee on Lifetime plan. If it's not working for you, we'll refund no questions asked."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 w-full max-w-2xl px-6 mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div 
            key={idx} 
            className={`border rounded-lg transition-all duration-300 shadow-sm ${
              openIndex === idx 
                ? "bg-card border-primary/50 shadow-md" 
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
            >
              <span className={`font-medium ${openIndex === idx ? "text-foreground" : "text-foreground"}`}>
                {faq.question}
              </span>
              {openIndex === idx ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 pt-0 text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
