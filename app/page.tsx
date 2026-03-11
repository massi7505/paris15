// app/page.tsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useWoodizStore, Product } from "@/lib/store";
import Navbar from "@/components/client/Navbar";
import HeroSlider from "@/components/client/HeroSlider";
import NotificationBar from "@/components/client/NotificationBar";
import AppBanner from "@/components/client/AppBanner";
import FAQSection from "@/components/client/FAQSection";
import ProductCard from "@/components/client/ProductCard";
import ProductModal from "@/components/client/ProductModal";
import Footer from "@/components/client/Footer";
import ReviewsSection from "@/components/client/ReviewsSection";
import GoogleReviewPopup from "@/components/client/GoogleReviewPopup";
import FaviconManager from "@/components/client/FaviconManager";
import FeaturesStrip from "@/components/client/FeaturesStrip";
import FeaturedProducts from "@/components/client/FeaturedProducts";
import CookieBanner from "@/components/client/CookieBanner";
import ClosingAlert from "@/components/client/ClosingAlert";
import Toast from "@/components/ui/Toast";

export default function Home() {
  const { settings, categories, products, promos, faqs, t, getCategoryName, activeLocale } = useWoodizStore();
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("tomate");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const primary = settings.primaryColor;

  const sortedCats = useMemo(
    () => [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order),
    [categories]
  );

  const activePromos = useMemo(
    () => [...promos].filter((p) => p.active).sort((a, b) => a.order - b.order),
    [promos]
  );

  const displayedProducts = useMemo(() => {
    let list = products.filter((p) => {
      const cat = categories.find((c) => c.id === p.category);
      return cat?.active;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    } else {
      list = list.filter((p) => p.category === activeCat);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }, [products, categories, search, activeCat]);

  const slides = settings.sliderSlides?.length
    ? settings.sliderSlides
    : settings.sliderImages.map((url) => ({ type: "image" as const, value: url, textSizeTitle: "xl" as const, textSizeSubtitle: "md" as const }));



  return (
    <div className="min-h-screen bg-slate-50">
      <FaviconManager />
      <AppBanner />
      <ClosingAlert />
      <NotificationBar />
      <Navbar settings={settings} onSearch={setSearch} searchValue={search} />

      <main className="max-w-screen-xl mx-auto px-4 md:px-6">
        {/* HERO */}
        <section className="pt-5 pb-0">
          <HeroSlider
            slides={slides}
            primaryColor={primary}
            heroTitle={settings.heroTitle}
            heroSubtitle={settings.heroSubtitle}
            accentColor={settings.accentColor}
            ctaLabel={mounted ? t("hero.cta") : "Voir la carte →"}
          />
        </section>

        {/* FEATURES STRIP */}
        <FeaturesStrip />

        {/* FEATURED PRODUCTS */}
        <FeaturedProducts primaryColor={primary} onOpen={setModalProduct} />

        {/* PROMOS */}
        {activePromos.length > 0 && (
          <section className="pb-12">
            <h2 className="font-bold text-xl text-slate-900 mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>
              🔥 <span suppressHydrationWarning>{mounted ? t("section.promotions") : "Promotions du Moment"}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePromos.map((promo) => {
                const locale = mounted ? activeLocale : "fr";
                const promoTitle = locale !== "fr" && promo.translations?.[locale]?.title ? promo.translations[locale].title : promo.title;
                const promoBadge = locale !== "fr" && promo.translations?.[locale]?.badge ? promo.translations[locale].badge : promo.badge;
                const priceColor = (promo as any).priceColor || promo.textColor;

                if (promo.type === "banner") {
                  const BannerWrapper = promo.link ? "a" : "div";
                  const bannerProps = promo.link ? { href: promo.link, target: "_blank", rel: "noopener noreferrer" } : {};
                  const ctaLabel = (locale !== "fr" && promo.translations?.[locale]?.ctaText)
                    ? promo.translations[locale].ctaText
                    : (promo.ctaText || "J'en profite →");
                  return (
                    <BannerWrapper key={promo.id} {...(bannerProps as any)}
                      className="sm:col-span-2 rounded-2xl overflow-hidden relative min-h-[160px] flex items-center cursor-pointer group"
                      style={{ background: promo.bgImage ? "transparent" : promo.bg }}>
                      {promo.bgImage && (
                        <>
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${promo.bgImage})` }} />
                          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
                        </>
                      )}
                      {!promo.bgImage && <div className="absolute inset-0" style={{ background: promo.bg }} />}
                      <div className="relative z-10 flex-1 p-6">
                        {promoBadge && <div className="text-[10px] font-bold uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full inline-block" style={{ background: "rgba(255,255,255,0.2)", color: promo.textColor }}>{promoBadge}</div>}
                        <div className="font-black text-2xl leading-tight mb-1" style={{ color: promo.textColor, fontFamily: "Poppins, sans-serif" }}>{promoTitle}</div>
                        {promo.price && <div className="font-black text-3xl mt-2" style={{ color: priceColor, fontFamily: "Poppins, sans-serif" }}>{promo.price}</div>}
                      </div>
                      <div className="relative z-10 mr-6 flex-shrink-0">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-2.5 text-sm font-bold whitespace-nowrap border border-white/30" style={{ color: promo.textColor }}>
                          {ctaLabel}
                        </div>
                      </div>
                    </BannerWrapper>
                  );
                }

                return (
                  <div key={promo.id} className="rounded-2xl overflow-hidden relative min-h-[150px] flex flex-col justify-between cursor-pointer group" style={{ background: promo.bg }}>
                    {promo.bgImage && (
                      <>
                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${promo.bgImage})` }} />
                        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.38)" }} />
                      </>
                    )}
                    <div className="relative z-10 p-5 flex flex-col justify-between h-full min-h-[150px]">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.18)", color: promo.textColor }}>{promoBadge}</span>
                        <div className="font-bold text-base leading-snug" style={{ color: promo.textColor, fontFamily: "Poppins, sans-serif" }}>{promoTitle}</div>
                      </div>
                      <div className="font-black text-2xl mt-4" style={{ color: priceColor, fontFamily: "Poppins, sans-serif" }}>{promo.price}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* MENU */}
        <section className="pb-16" id="menu-section">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-xl text-slate-900" style={{ fontFamily: "Poppins, sans-serif" }}>
              <span suppressHydrationWarning>
                {search
                  ? `🔍 ${mounted ? t("section.search_results") : "Résultats"}`
                  : `🍕 ${mounted ? t("section.our_menu") : "Notre Carte"}`
                }
              </span>
            </h2>
            {search && (
              <span className="text-slate-400 text-sm" suppressHydrationWarning>
                {displayedProducts.length} {mounted ? t("section.results_for") : "résultat(s) pour"} "{search}"
              </span>
            )}
          </div>

          {!search && (
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
              {sortedCats.map((cat) => {
                const isActive = activeCat === cat.id;
                const hasImage = !!cat.iconUrl;
                if (hasImage) {
                  // Deliveroo-style: image card with label below
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCat(cat.id)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-all ${isActive ? "opacity-100 scale-105" : "opacity-70 hover:opacity-90"}`}
                      style={{ minWidth: 68 }}
                    >
                      <div
                        className={`w-16 h-12 rounded-2xl bg-cover bg-center shadow-sm border-2 transition-all ${isActive ? "border-amber-400 shadow-md" : "border-transparent"}`}
                        style={{ backgroundImage: `url(${cat.iconUrl})` }}
                      />
                      <span className={`text-xs font-semibold leading-tight text-center w-[68px] break-words whitespace-normal ${isActive ? "text-slate-900" : "text-slate-500"}`}>
                        {mounted ? getCategoryName(cat.id) : cat.name}
                      </span>
                    </button>
                  );
                }
                // Default emoji pill
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      isActive ? "text-white shadow-md" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                    }`}
                    style={isActive ? { background: primary } : {}}
                  >
                    <span>{cat.icon}</span>
                    <span suppressHydrationWarning>{mounted ? getCategoryName(cat.id) : cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {settings.productDisplayMode === "vertical" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primary} onOpen={setModalProduct} vertical />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} primaryColor={primary} onOpen={setModalProduct} />
              ))}
            </div>
          )}

          {displayedProducts.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-4xl mb-3">🍕</div>
              <div className="font-semibold">Aucun résultat</div>
            </div>
          )}
        </section>

        <ReviewsSection />
        <FAQSection faqs={faqs} primaryColor={primary} title={mounted ? t("faq.title") : "Questions Fréquentes"} />
      </main>

      <Footer settings={settings} categories={categories} onCategorySelect={(id) => {
        setActiveCat(id);
        document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
      }} />

      {modalProduct && (
        <ProductModal product={modalProduct} primaryColor={primary} onClose={() => setModalProduct(null)} t={t} />
      )}

      <GoogleReviewPopup />
      <Toast />
      <CookieBanner />
    </div>
  );
}
