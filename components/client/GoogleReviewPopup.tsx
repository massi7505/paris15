// components/client/GoogleReviewPopup.tsx
"use client";
import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { useWoodizStore } from "@/lib/store";

const SHOWN_KEY = "woodiz_popup_shown";

function GoogleLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function GoogleReviewPopup() {
  const { googleReviewPopup, t, activeLocale } = useWoodizStore();
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!googleReviewPopup.enabled) return;
    if (googleReviewPopup.showOnce && localStorage.getItem(SHOWN_KEY)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      setTimeout(() => setAnimIn(true), 40);
    }, googleReviewPopup.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [googleReviewPopup]);

  function close() {
    setAnimIn(false);
    setTimeout(() => setVisible(false), 280);
    if (googleReviewPopup.showOnce) localStorage.setItem(SHOWN_KEY, "1");
  }

  function goReview() {
    window.open(googleReviewPopup.googleReviewUrl, "_blank");
    close();
  }

  if (!visible) return null;

  // Use translated strings if available (from admin GooglePopupTab translations), else fall back to popup config
  const titleText = mounted ? t("popup.title") : googleReviewPopup.title;
  const subtitleText = mounted ? t("popup.subtitle") : googleReviewPopup.subtitle;
  const buttonText = mounted ? t("popup.button") : googleReviewPopup.buttonText;
  const laterText = mounted ? t("popup.later") : "Plus tard";

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/25 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${animIn ? "opacity-100" : "opacity-0"}`}
        onClick={close}
      />

      {/* Card — no external image */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto transition-all duration-300 overflow-hidden ${animIn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`}
        style={{ border: `2px solid ${googleReviewPopup.accentColor}25` }}
      >
        {/* Accent bar */}
        <div className="h-1.5" style={{ background: `linear-gradient(90deg,${googleReviewPopup.accentColor},#FDE68A,${googleReviewPopup.accentColor})` }} />

        <div className="p-6 relative">
          <button onClick={close} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={13} className="text-slate-500" />
          </button>

          {/* Header: Google logo + stars — no external image */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0">
              <GoogleLogo size={28} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">Google Reviews</div>
              <div className="flex gap-0.5 mt-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#FFB800" stroke="#FFB800" />)}
              </div>
            </div>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 mb-2 leading-tight" style={{ fontFamily: "Poppins, sans-serif" }} suppressHydrationWarning>
            {titleText}
          </h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed" suppressHydrationWarning>
            {subtitleText}
          </p>

          <button
            onClick={goReview}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white hover:opacity-90 transition-all shadow-md hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg,${googleReviewPopup.accentColor},${googleReviewPopup.accentColor}CC)` }}
            suppressHydrationWarning
          >
            {buttonText}
          </button>
          <button
            onClick={close}
            className="w-full py-2.5 mt-1.5 rounded-2xl font-medium text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            suppressHydrationWarning
          >
            {laterText}
          </button>
        </div>
      </div>
    </div>
  );
}
