// components/client/HeroSlider.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SliderSlide, useWoodizStore } from "@/lib/store";
import { getImage } from "@/lib/imageDb";

const titleSizeMap: Record<string, string> = {
  sm: "text-xl md:text-2xl", md: "text-2xl md:text-3xl", lg: "text-3xl md:text-4xl",
  xl: "text-3xl md:text-4xl lg:text-5xl", "2xl": "text-4xl md:text-5xl lg:text-6xl",
};
const subtitleSizeMap: Record<string, string> = {
  xs: "text-xs", sm: "text-sm", md: "text-sm md:text-base", lg: "text-base md:text-lg",
};

interface HeroSliderProps {
  slides: SliderSlide[];
  primaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
  accentColor: string;
  ctaLabel: string;
}

function isValidImgSrc(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:image/")) return true;
  if (src.startsWith("/")) return true;
  try {
    const { protocol } = new URL(src);
    return protocol === "http:" || protocol === "https:";
  } catch { return false; }
}

export default function HeroSlider({ slides, primaryColor, heroTitle, heroSubtitle, accentColor, ctaLabel }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [resolvedSrcs, setResolvedSrcs] = useState<Record<number, string>>({});
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);
  const { activeLocale } = useWoodizStore();

  useEffect(() => {
    slides.forEach((slide, i) => {
      if (slide.type === "image" && slide.value?.startsWith("__idb:")) {
        getImage(slide.value.slice("__idb:".length))
          .then((dataUrl) => { if (dataUrl) setResolvedSrcs((prev) => ({ ...prev, [i]: dataUrl })); })
          .catch(() => {});
      }
    });
  }, [slides]);

  const next = useCallback(() => setCurrent((c) => (c + 1) % (slides.length || 1)), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + (slides.length || 1)) % (slides.length || 1)), [slides.length]);

  // Auto-play (paused while touch)
  useEffect(() => {
    if (isDragging.current) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Touch handlers for swipe
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only handle horizontal swipe (ignore vertical scroll)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isDragging.current = true;
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  }

  const currentSlide = slides[current];
  const titleSize = titleSizeMap[currentSlide?.textSizeTitle ?? "xl"] ?? titleSizeMap.xl;
  const subtitleSize = subtitleSizeMap[currentSlide?.textSizeSubtitle ?? "md"] ?? subtitleSizeMap.md;
  const slideTranslations = (currentSlide as any)?.translations?.[activeLocale];
  const displayTitle = currentSlide?.useCustomText
    ? (slideTranslations?.title || currentSlide?.customTitle || heroTitle)
    : heroTitle;
  const displaySubtitle = currentSlide?.useCustomText
    ? (slideTranslations?.subtitle || currentSlide?.customSubtitle || heroSubtitle)
    : heroSubtitle;

  function getSlideImgSrc(slide: SliderSlide, idx: number): string | null {
    if (slide.type !== "image") return null;
    if (resolvedSrcs[idx]) return resolvedSrcs[idx];
    if (isValidImgSrc(slide.value)) return slide.value;
    return null;
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden select-none"
      style={{ minHeight: 340, background: accentColor }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, i) => {
        const imgSrc = getSlideImgSrc(slide, i);
        return (
          <div key={i} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}>
            {slide.type === "image" ? (
              imgSrc ? (
                <Image src={imgSrc} alt={`Slide ${i + 1}`} fill className="object-cover" style={{ opacity: 0.45 }} priority={i === 0} unoptimized />
              ) : (
                <div className="absolute inset-0" style={{ background: accentColor, opacity: 0.45 }} />
              )
            ) : (
              <div className="absolute inset-0" style={{ background: slide.value }} />
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Hero Text */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <h1 className={`text-white font-black mb-3 leading-tight ${titleSize}`} style={{ fontFamily: "Poppins, sans-serif" }}>
          {displayTitle.split("\n").map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {i === 0 ? line : <span style={{ color: primaryColor }}>{line}</span>}
            </span>
          ))}
        </h1>
        <p className={`text-white/70 mb-6 ${subtitleSize}`}>{displaySubtitle}</p>
        <a href="#menu-section" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
          style={{ background: primaryColor, fontFamily: "Poppins, sans-serif" }}>
          {ctaLabel}
        </a>
      </div>

      {/* Navigation buttons — visible on all devices */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Slide précédent"
            className="absolute left-2 md:left-3 z-30 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-90"
            style={{
              top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40,
              background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); next(); }}
            aria-label="Slide suivant"
            className="hidden md:flex absolute right-2 md:right-3 z-30 rounded-full items-center justify-center shadow-xl transition-transform active:scale-90"
            style={{
              top: "50%", transform: "translateY(-50%)",
              width: 40, height: 40,
              background: "rgba(255,255,255,0.95)", border: "none", cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronRight size={20} className="text-slate-800" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 right-4 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onPointerDown={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? 20 : 7, height: 7,
                  background: i === current ? primaryColor : "rgba(255,255,255,0.5)",
                  border: "none", padding: 0, cursor: "pointer",
                  borderRadius: 99, transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
