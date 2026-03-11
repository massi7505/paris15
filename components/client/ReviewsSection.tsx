// components/client/ReviewsSection.tsx
"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13} fill={i<=n?"#FFB800":"#E5E7EB"} stroke={i<=n?"#FFB800":"#E5E7EB"} />
      ))}
    </div>
  );
}

function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

// Generate a consistent color from a name
function nameToColor(name: string) {
  const colors = ["#F59E0B","#EF4444","#8B5CF6","#10B981","#3B82F6","#F97316","#EC4899","#14B8A6"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ReviewsSection() {
  const { reviews, settings, t, googleReviewPopup } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = [...reviews].filter(r => r.active).sort((a, b) => a.order - b.order);
  if (active.length === 0) return null;

  const seeAllUrl = googleReviewPopup?.googleReviewUrl || settings.googleUrl || "#";

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-bold text-2xl text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
            ⭐ <span suppressHydrationWarning>{mounted ? t("reviews.title") : "Ce que nos clients disent"}</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Stars n={Math.round(parseFloat(settings.googleRating || "4.4"))} />
            <span className="font-bold text-slate-700 text-sm">{settings.googleRating || "4.4"}</span>
            <span className="text-slate-400 text-sm">
              · {settings.googleReviewCount || "127"} <span suppressHydrationWarning>{mounted ? t("nav.reviews") : "avis"}</span>
            </span>
          </div>
        </div>
        <a
          href={seeAllUrl} target="_blank" rel="noreferrer"
          className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all shadow-md"
          style={{ background: settings.primaryColor }}
        >
          <GoogleLogo size={16} />
          <span suppressHydrationWarning>{mounted ? t("reviews.see_all") : "Voir tous les avis Google"}</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map(r => (
          <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar: colored initial — no external image */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                  style={{ background: nameToColor(r.name) }}
                >
                  {r.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">{r.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(r.date).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>
              <GoogleLogo size={16} />
            </div>
            <Stars n={r.rating} />
            <p className="text-sm text-slate-600 leading-relaxed mt-3 line-clamp-4">{r.text}</p>
          </div>
        ))}
      </div>

      {/* Mobile see all */}
      <div className="flex justify-center mt-6 md:hidden">
        <a
          href={seeAllUrl} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ background: settings.primaryColor }}
        >
          <GoogleLogo size={14} />
          <span suppressHydrationWarning>{mounted ? t("reviews.see_all") : "Voir tous les avis Google"}</span>
        </a>
      </div>
    </section>
  );
}
