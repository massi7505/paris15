// components/client/FAQSection.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ, useWoodizStore } from "@/lib/store";

interface FAQSectionProps {
  faqs: FAQ[];
  primaryColor: string;
  accentColor?: string;
  title: string;
}

export default function FAQSection({ faqs, primaryColor, title }: FAQSectionProps) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const { activeLocale } = useWoodizStore();
  useEffect(() => setMounted(true), []);

  const activeFaqs = [...faqs].filter(f => f.active).sort((a, b) => a.order - b.order);
  if (activeFaqs.length === 0) return null;

  const locale = mounted ? activeLocale : "fr";

  return (
    <section className="py-16">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10">
          <span className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: primaryColor }}>💬 FAQ</span>
          <h2 className="font-black text-2xl md:text-3xl text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h2>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {activeFaqs.map(faq => {
            const isOpen = openId === faq.id;
            const question = locale !== "fr" && faq.translations?.[locale]?.question
              ? faq.translations[locale].question : faq.question;
            const answer = locale !== "fr" && faq.translations?.[locale]?.answer
              ? faq.translations[locale].answer : faq.answer;
            return (
              <div key={faq.id} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isOpen ? "shadow-md" : "shadow-sm"}`}
                style={{ borderColor: isOpen ? primaryColor : "#E2E8F0" }}>
                <button onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  style={{ background: isOpen ? `${primaryColor}08` : "white" }}>
                  <span className="font-semibold text-slate-800 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                    {question}
                  </span>
                  <ChevronDown size={18} className="flex-shrink-0 transition-transform duration-300"
                    style={{ color: primaryColor, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 bg-white">
                    <div className="w-8 h-0.5 rounded-full mb-3" style={{ background: primaryColor }} />
                    <p className="text-sm text-slate-600 leading-relaxed">{answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
