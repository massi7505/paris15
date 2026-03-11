// app/about/AboutClient.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useWoodizStore } from "@/lib/store";
import Navbar from "@/components/client/Navbar";
import Footer from "@/components/client/Footer";
import FaviconManager from "@/components/client/FaviconManager";
import { MapPin, Phone, Mail, Clock, Star, Award, Leaf, Flame, Users, ChevronRight } from "lucide-react";

/* ---------- animated counter ---------- */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const interval = setInterval(() => {
        start = Math.min(start + step, target);
        setVal(start);
        if (start >= target) clearInterval(interval);
      }, 16);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ---------- JSON-LD structured data ---------- */
function StructuredData({ settings }: { settings: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "@id": "https://woodiz.fr/#restaurant",
        name: settings.siteName || "WOODIZ",
        description: settings.metaDescription || "Pizzeria artisanale au cœur de Paris 15ème. Pâte maison fermentée 48h, four à bois 450°C.",
        url: "https://woodiz.fr",
        telephone: settings.phone || "+33 1 00 00 00 00",
        email: settings.email || "contact@woodiz.fr",
        address: {
          "@type": "PostalAddress",
          streetAddress: "93 Rue Lecourbe",
          addressLocality: "Paris",
          postalCode: "75015",
          addressCountry: "FR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 48.8416,
          longitude: 2.3009,
        },
        openingHoursSpecification: [
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "11:30", closes: "22:30" },
          { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "11:30", closes: "23:00" },
        ],
        servesCuisine: ["Italian", "Neapolitan", "Pizza"],
        priceRange: "€€",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=80",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: settings.googleRating || "4.4",
          reviewCount: settings.googleReviewCount || "127",
          bestRating: "5",
        },
        hasMenu: "https://woodiz.fr/#menu-section",
        paymentAccepted: "Cash, Credit Card",
        currenciesAccepted: "EUR",
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Takeaway", value: true },
          { "@type": "LocationFeatureSpecification", name: "Delivery", value: true },
          { "@type": "LocationFeatureSpecification", name: "Wood-fired oven", value: true },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://woodiz.fr/about",
        url: "https://woodiz.fr/about",
        name: "À propos de WOODIZ | Pizzeria Artisanale Paris 15ème",
        isPartOf: { "@id": "https://woodiz.fr/#website" },
        about: { "@id": "https://woodiz.fr/#restaurant" },
        description: "Histoire, valeurs et équipe de WOODIZ, pizzeria artisanale fondée en 2018 à Paris 15ème.",
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://woodiz.fr" },
            { "@type": "ListItem", position: 2, name: "À propos", item: "https://woodiz.fr/about" },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://woodiz.fr/#website",
        url: "https://woodiz.fr",
        name: settings.siteName || "WOODIZ",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: "https://woodiz.fr/?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        name: "Marco Rossi",
        jobTitle: "Chef Pizzaiolo",
        worksFor: { "@id": "https://woodiz.fr/#restaurant" },
        description: "Pizzaiolo formé à Naples avec 15 ans d'expérience dans la pizza napolitaine traditionnelle.",
        knowsAbout: ["Pizza napolitaine", "Four à bois", "Fermentation longue", "Cuisine italienne"],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function AboutClient() {
  const { settings, categories, t, activeLocale } = useWoodizStore();
  const [mounted, setMounted] = useState(false);
  const [activeCat, setActiveCat] = useState("tomate");
  useEffect(() => setMounted(true), []);

  const primary = settings.primaryColor || "#F59E0B";
  const accent = settings.accentColor || "#2B1408";

  const tr = (key: string, fallback: string) => mounted ? t(key) : fallback;

  const stats = [
    { value: 6, suffix: "", label: tr("about.stats_years", "ans d'expérience"), icon: "🏆" },
    { value: 48000, suffix: "+", label: tr("about.stats_pizzas", "pizzas servies"), icon: "🍕" },
    { value: 4, suffix: ".4★", label: tr("about.stats_rating", "note Google"), icon: "⭐", raw: "4.4★" },
    { value: 5, suffix: "km", label: tr("about.stats_km", "de rayon de livraison"), icon: "🛵" },
  ];

  const values = [
    { icon: <Award size={24} />, title: tr("about.val1_title", "Authenticité"), text: tr("about.val1_text", "Recettes traditionnelles napolitaines, sans compromis.") },
    { icon: <Leaf size={24} />, title: tr("about.val2_title", "Fraîcheur"), text: tr("about.val2_text", "Ingrédients sourcés chaque matin au marché local.") },
    { icon: <Flame size={24} />, title: tr("about.val3_title", "Passion"), text: tr("about.val3_text", "Chaque pizza est préparée avec soin et amour du métier.") },
    { icon: <Users size={24} />, title: tr("about.val4_title", "Proximité"), text: tr("about.val4_text", "Un ancrage fort dans le quartier du 15ème depuis 2018.") },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <FaviconManager />
      {mounted && <StructuredData settings={settings} />}

      <Navbar settings={settings} onSearch={() => {}} searchValue="" />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: accent, minHeight: 480 }}
      >
        {/* Background pizza image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1400&q=80)",
            opacity: 0.18,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

        <div className="relative max-w-screen-xl mx-auto px-4 md:px-6 pt-20 pb-24 z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/40 text-xs mb-8" aria-label="Breadcrumb">
            <a href="/" className="hover:text-white/70 transition-colors">
              {tr("nav.about", "À propos")} →
            </a>
            <span>{settings.siteName || "WOODIZ"}</span>
            <ChevronRight size={12} />
            <span className="text-white/70">{tr("about.title", "Notre Histoire")}</span>
          </nav>

          <div className="max-w-2xl">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6"
              style={{ background: primary, color: accent }}
            >
              🍕 Depuis 2018 · Paris 15ème
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {tr("about.hero_title", "L'Amour de la Pizza\nArtisanale").split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {i === 0 ? line : <span style={{ color: primary }}>{line}</span>}
                </span>
              ))}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
              {tr("about.hero_subtitle", "Depuis 2018, nous perpétuons la tradition napolitaine au cœur de Paris 15ème")}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90"
              style={{ background: primary, color: accent, fontFamily: "Poppins, sans-serif" }}
            >
              {tr("about.cta_button", "Voir la carte →")}
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: primary, fontFamily: "Poppins, sans-serif" }}>
                  {s.raw ? s.raw : <AnimatedNumber target={s.value} suffix={s.suffix} />}
                </div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-screen-xl mx-auto px-4 md:px-6 py-16 space-y-20">

        {/* ── STORY ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: `${primary}20`, color: primary }}
            >
              {tr("about.story_title", "Notre histoire")}
            </span>
            <h2
              className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {settings.siteName || "WOODIZ"},<br />
              <span style={{ color: primary }}>la pizza napolitaine</span><br />
              au cœur de Paris
            </h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>{tr("about.story_p1", "Fondée en 2018 par deux passionnés de cuisine italienne, WOODIZ est née d'un rêve simple : apporter à Paris la vraie pizza napolitaine.")}</p>
              <p>{tr("about.story_p2", "Notre four à bois, importé directement de Naples, monte à 450°C pour cuire chaque pizza en moins de 90 secondes.")}</p>
              <p>{tr("about.story_p3", "Chaque matin, notre équipe prépare la pâte à la main avec de la farine italienne type 00, de la levure naturelle et une fermentation longue de 48h.")}</p>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
              "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80",
            ].map((src, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${i === 0 ? "col-span-2 h-48" : "h-36"}`}>
                <img src={src} alt={`WOODIZ pizza ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="rounded-3xl p-8 md:p-12" style={{ background: accent }}>
          <h2
            className="text-2xl md:text-3xl font-black text-white text-center mb-10"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Notre processus en <span style={{ color: primary }}>4 étapes</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", icon: "🌾", title: "Farine type 00", desc: "Importée d'Italie, mouture fine pour une pâte légère" },
              { step: "02", icon: "⏱️", title: "48h fermentation", desc: "Levure naturelle, longue pousse pour une digestion facilitée" },
              { step: "03", icon: "🤲", title: "Étalage à la main", desc: "Aucun rouleau, la pâte est étalée à la main pour préserver les alvéoles" },
              { step: "04", icon: "🔥", title: "Four à 450°C", desc: "Cuisson en 60–90 secondes pour une pâte croustillante et fondante" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div
                  className="text-4xl font-black opacity-20 text-white mb-2"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {item.step}
                </div>
                <div className="font-bold text-white mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {item.title}
                </div>
                <div className="text-white/50 text-sm leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALUES ── */}
        <section>
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: `${primary}20`, color: primary }}
            >
              {tr("about.values_title", "Nos valeurs")}
            </span>
            <h2
              className="text-3xl font-black text-slate-900"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Ce qui nous anime
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${primary}18`, color: primary }}
                >
                  {v.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {v.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden h-80">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80"
                alt="Chef Marco Rossi — Pizzaiolo WOODIZ Paris 15"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 rounded-2xl px-5 py-4 shadow-xl"
              style={{ background: primary }}
            >
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={accent} stroke={accent} />)}
              </div>
              <div className="font-black text-sm" style={{ color: accent, fontFamily: "Poppins, sans-serif" }}>
                Formé à Naples
              </div>
            </div>
          </div>
          <div>
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: `${primary}20`, color: primary }}
            >
              {tr("about.team_title", "Notre équipe")}
            </span>
            <h2
              className="text-3xl font-black text-slate-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {tr("about.chef_name", "Marco Rossi")}
            </h2>
            <p className="font-semibold mb-4" style={{ color: primary }}>
              {tr("about.chef_role", "Chef Pizzaiolo")}
            </p>
            <p className="text-slate-600 leading-relaxed mb-6">
              {tr("about.chef_bio", "Formé à Naples, Marco apporte 15 ans d'expérience et une passion dévorante pour la pizza traditionnelle.")}
            </p>
            {/* Skills */}
            <div className="space-y-3">
              {[
                { skill: "Pizza Napolitaine", pct: 98 },
                { skill: "Pâte & Fermentation", pct: 95 },
                { skill: "Four à bois", pct: 99 },
              ].map((s) => (
                <div key={s.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-700">{s.skill}</span>
                    <span style={{ color: primary }}>{s.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${s.pct}%`, background: primary }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT / MAP ── */}
        <section>
          <h2
            className="text-2xl font-black text-slate-900 mb-8"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            📍 {tr("about.map_title", "Nous trouver")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 lg:col-span-1">
              <div className="flex items-start gap-3">
                <MapPin size={18} style={{ color: primary }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Adresse</div>
                  <div className="text-slate-500 text-sm">{settings.address || "93 Rue Lecourbe, Paris 75015"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} style={{ color: primary }} className="flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Téléphone</div>
                  <a href={`tel:${settings.phone}`} className="text-slate-500 text-sm hover:underline">{settings.phone || "+33 1 00 00 00 00"}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} style={{ color: primary }} className="flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Email</div>
                  <a href={`mailto:${settings.email}`} className="text-slate-500 text-sm hover:underline">{settings.email || "contact@woodiz.fr"}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} style={{ color: primary }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-slate-800 text-sm">Horaires</div>
                  <div className="text-slate-500 text-sm whitespace-pre-line">{settings.openHours || "Lun–Ven 11h30–22h30\nSam–Dim 11h30–23h00"}</div>
                </div>
              </div>
              {/* Google rating */}
              <div className="pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#FFB800" stroke="#FFB800" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {settings.googleRating || "4.4"}/5
                  </span>
                  <span className="text-slate-400 text-xs">
                    ({settings.googleReviewCount || "127"} avis Google)
                  </span>
                </div>
              </div>
            </div>

            {/* Embedded map */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-100 shadow-sm" style={{ minHeight: 320 }}>
              <iframe
                title="WOODIZ Pizzeria — 93 Rue Lecourbe Paris 75015"
                src="https://www.openstreetmap.org/export/embed.html?bbox=2.2909%2C48.8316%2C2.3109%2C48.8516&layer=mapnik&marker=48.8416%2C2.3009"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 320 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="rounded-3xl p-10 md:p-16 text-center"
          style={{ background: `linear-gradient(135deg, ${primary}18 0%, ${primary}08 100%)`, border: `1.5px solid ${primary}30` }}
        >
          <div className="text-5xl mb-4">🍕</div>
          <h2
            className="text-2xl md:text-3xl font-black text-slate-900 mb-3"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {tr("about.cta_title", "Prêt à découvrir nos pizzas ?")}
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            {tr("about.cta_subtitle", "Commander en ligne ou venez nous rendre visite au 93 Rue Lecourbe, Paris 15ème.")}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-4 rounded-full shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: primary, color: accent, fontFamily: "Poppins, sans-serif" }}
          >
            {tr("about.cta_button", "Voir la carte →")}
          </a>
        </section>

      </main>

      <Footer
        settings={settings}
        categories={categories}
        onCategorySelect={(id) => { window.location.href = `/?cat=${id}`; }}
      />
    </div>
  );
}
