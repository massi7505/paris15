// lib/store.ts - WOODIZ v5 - Full featured
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationBar { enabled: boolean; text: string; bgColor: string; textColor: string; link?: string; closeable?: boolean; style?: "bar" | "floating"; }
export interface AppBanner { enabled: boolean; icon?: string; iconBg?: string; title: string; subtitle: string; buttonText: string; buttonLink: string; buttonBg?: string; buttonTextColor?: string; bgColor?: string; textColor?: string; closeable?: boolean; }
export interface SliderSlide { type: "image" | "color"; value: string; customTitle?: string; customSubtitle?: string; useCustomText?: boolean; textSizeTitle?: "sm"|"md"|"lg"|"xl"|"2xl"; textSizeSubtitle?: "xs"|"sm"|"md"|"lg"; translations?: Record<string, { title?: string; subtitle?: string }>; }
export interface FAQ { id: number; question: string; answer: string; order: number; active: boolean; translations?: Record<string, { question: string; answer: string }>; }
export interface LegalPage { id: "mentions"|"cgu"|"privacy"; title: string; content: string; enabled: boolean; }
export interface CustomerReview { id: number; name: string; rating: number; text: string; date: string; avatar?: string; active: boolean; order: number; }
export interface GoogleReviewPopup { enabled: boolean; googleReviewUrl: string; title: string; subtitle: string; buttonText: string; delaySeconds: number; showOnce: boolean; bgColor: string; accentColor: string; }
export interface FeatureItem { icon: string; labelKey: string; subKey: string; active: boolean; }

export const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: "🍕", labelKey: "features.dough", subKey: "features.dough_sub", active: true },
  { icon: "🌿", labelKey: "features.fresh", subKey: "features.fresh_sub", active: true },
  { icon: "⚡", labelKey: "features.fast", subKey: "features.fast_sub", active: true },
];

export interface FooterConfig { showCategories: boolean; showSocial: boolean; showContact: boolean; showReviews: boolean; showLegalLinks: boolean; reviewsLabel: string; googleRating: string; googleReviewCount: string; customLinks: { label: string; url: string }[]; }
export interface OrderButton { id: string; enabled: boolean; label: string; url: string; bgColor: string; textColor: string; type: "phone" | "ubereats" | "deliveroo" | "custom"; }
export interface CookieBanner { enabled: boolean; title: string; description: string; acceptText: string; rejectText: string; prefsText: string; translations?: Record<string, { title?: string; description?: string; acceptText?: string; rejectText?: string; prefsText?: string }>; }
export interface ClosingAlert { enabled: boolean; minutesBefore: number; text: string; bgColor: string; textColor: string; }
export interface StoreSchedule {
  lunchEnabled: boolean; lunchOpen: string; lunchClose: string;
  dinnerEnabled: boolean; dinnerOpen: string; dinnerClose: string;
  closedDays: number[]; // 0=Dim, 1=Lun … 6=Sam
}
export interface SiteSettings { siteName: string; tagline: string; address: string; phone: string; email: string; primaryColor: string; accentColor: string; heroTitle: string; heroSubtitle: string; metaTitle: string; metaDescription: string; metaKeywords: string; instagramUrl: string; googleUrl: string; openHours: string; footerText: string; sliderImages: string[]; sliderSlides: SliderSlide[]; faviconEmoji: string; faviconUrl: string; logoText: string; notificationBar: NotificationBar; appBanner?: AppBanner; googleRating: string; googleReviewCount: string; footerConfig: FooterConfig; features: FeatureItem[]; productDisplayMode?: "grid" | "vertical"; orderButtons?: OrderButton[]; cookieBanner?: CookieBanner; closingAlert?: ClosingAlert; storeSchedule?: StoreSchedule; }
export interface Promo { id: number; title: string; price: string; badge: string; bg: string; textColor: string; active: boolean; image?: string; order: number; translations?: Record<string, { title: string; badge?: string; ctaText?: string }>; type?: "card" | "banner"; link?: string; bgImage?: string; ctaText?: string; }
export interface Category { id: string; name: string; icon: string; iconUrl?: string; order: number; active: boolean; description?: string; translations?: Record<string, { name: string; description?: string }>; }
export interface Product { id: number; name: string; category: string; desc: string; price: number; badge: string; badgeColor: string; allergens: string[]; allergenTranslations?: Record<string, string[]>; img: string; inStock: boolean; order: number; featured?: boolean; translations?: Record<string, { name: string; desc: string }>; seoTitle?: string; seoDescription?: string; }
export interface Toast { msg: string; type: "success"|"error"|"info"; }
export type Locale = string;
export interface Translation { locale: Locale; label: string; flag: string; enabled: boolean; strings: Record<string, string>; }

export const DEFAULT_FR_STRINGS: Record<string, string> = {
  "nav.search_placeholder": "Rechercher une pizza...", "nav.reviews": "avis",
  "nav.about": "À propos",
  "hero.cta": "Voir la carte →", "section.promotions": "Promotions du Moment",
  "section.our_menu": "Notre Carte", "section.featured": "Produits en Vedette", "section.search_results": "Résultats de recherche",
  "section.results_for": "résultat(s) pour", "product.out_of_stock": "Rupture de stock",
  "product.add_to_cart": "Ajouter", "product.allergens": "Allergènes", "product.close": "Fermer",
  "footer.rights": "Tous droits réservés.", "footer.follow_us": "Nous suivre",
  "footer.hours": "Horaires", "footer.contact": "Contact",
  "footer.our_menu": "Notre Carte", "footer.reviews_section": "Avis clients",
  "footer.about": "À propos",
  "footer.order": "Commander",
  "faq.title": "Questions Fréquentes",
  "legal.mentions": "Mentions légales", "legal.cgu": "CGU", "legal.privacy": "Politique de confidentialité",
  "reviews.title": "Ce que nos clients disent", "reviews.see_all": "Voir tous les avis Google",
  "popup.title": "Vous avez apprécié votre pizza ?", "popup.subtitle": "Laissez-nous un avis Google, ça nous aide beaucoup !", "popup.button": "Laisser un avis ⭐", "popup.later": "Plus tard",
  "toast.settings_saved": "Paramètres sauvegardés ✓", "toast.product_updated": "Produit mis à jour ✓",
  "toast.product_added": "Produit ajouté ✓", "toast.product_deleted": "Produit supprimé",
  "toast.category_saved": "Catégorie sauvegardée ✓", "toast.category_deleted": "Catégorie supprimée",
  "toast.promo_saved": "Offre sauvegardée ✓", "toast.promo_deleted": "Offre supprimée", "toast.reset_done": "Données réinitialisées ✓",
  "features.dough": "Pâte maison", "features.dough_sub": "Préparée chaque jour",
  "features.fresh": "Ingrédients frais", "features.fresh_sub": "Du marché local",
  "features.fast": "Prête en 15 min", "features.fast_sub": "À emporter",
  "about.title": "Notre Histoire",
  "about.hero_title": "L'Amour de la Pizza\nArtisanale",
  "about.hero_subtitle": "Depuis 2018, nous perpétuons la tradition napolitaine au cœur de Paris 15ème",
  "about.story_title": "Notre histoire",
  "about.story_p1": "Fondée en 2018 par deux passionnés de cuisine italienne, WOODIZ est née d'un rêve simple : apporter à Paris la vraie pizza napolitaine, celle qui se mange debout dans une ruelle de Naples, croustillante à l'extérieur, fondante à l'intérieur.",
  "about.story_p2": "Notre four à bois, importé directement de Naples, monte à 450°C pour cuire chaque pizza en moins de 90 secondes. Cette technique ancestrale est le secret d'une pâte incomparable — légère, alvéolée, légèrement brûlée sur les bords.",
  "about.story_p3": "Chaque matin, notre équipe prépare la pâte à la main avec de la farine italienne type 00, de la levure naturelle et une fermentation longue de 48h. Rien n'est laissé au hasard.",
  "about.values_title": "Nos valeurs",
  "about.val1_title": "Authenticité", "about.val1_text": "Recettes traditionnelles napolitaines, sans compromis.",
  "about.val2_title": "Fraîcheur", "about.val2_text": "Ingrédients sourcés chaque matin au marché local.",
  "about.val3_title": "Passion", "about.val3_text": "Chaque pizza est préparée avec soin et amour du métier.",
  "about.val4_title": "Proximité", "about.val4_text": "Un ancrage fort dans le quartier du 15ème depuis 2018.",
  "about.team_title": "Notre équipe",
  "about.chef_name": "Marco Rossi", "about.chef_role": "Chef Pizzaiolo", "about.chef_bio": "Formé à Naples, Marco apporte 15 ans d'expérience et une passion dévorante pour la pizza traditionnelle.",
  "about.stats_years": "ans d'expérience", "about.stats_pizzas": "pizzas servies", "about.stats_rating": "note Google", "about.stats_km": "de rayon de livraison",
  "about.cta_title": "Prêt à découvrir nos pizzas ?",
  "about.cta_subtitle": "Commander en ligne ou venez nous rendre visite au 93 Rue Lecourbe, Paris 15ème.",
  "about.cta_button": "Voir la carte →",
  "about.map_title": "Nous trouver",
  "about.back_home": "← Retour à l'accueil",
};
export const DEFAULT_EN_STRINGS: Record<string, string> = {
  "nav.search_placeholder": "Search for a pizza...", "nav.reviews": "reviews",
  "nav.about": "About us",
  "hero.cta": "See the menu →", "section.promotions": "Current Promotions",
  "section.our_menu": "Our Menu", "section.featured": "Featured Products", "section.search_results": "Search Results",
  "section.results_for": "result(s) for", "product.out_of_stock": "Out of stock",
  "product.add_to_cart": "Add", "product.allergens": "Allergens", "product.close": "Close",
  "footer.rights": "All rights reserved.", "footer.follow_us": "Follow us",
  "footer.hours": "Opening hours", "footer.contact": "Contact",
  "footer.our_menu": "Our Menu", "footer.reviews_section": "Customer reviews",
  "footer.about": "About us",
  "footer.order": "Order",
  "faq.title": "Frequently Asked Questions",
  "legal.mentions": "Legal notice", "legal.cgu": "Terms of Use", "legal.privacy": "Privacy Policy",
  "reviews.title": "What our customers say", "reviews.see_all": "See all Google reviews",
  "popup.title": "Did you enjoy your pizza?", "popup.subtitle": "Leave us a Google review, it helps us a lot!", "popup.button": "Leave a review ⭐", "popup.later": "Maybe later",
  "toast.settings_saved": "Settings saved ✓", "toast.product_updated": "Product updated ✓",
  "toast.product_added": "Product added ✓", "toast.product_deleted": "Product deleted",
  "toast.category_saved": "Category saved ✓", "toast.category_deleted": "Category deleted",
  "toast.promo_saved": "Offer saved ✓", "toast.promo_deleted": "Offer deleted", "toast.reset_done": "Data reset ✓",
  "features.dough": "Homemade dough", "features.dough_sub": "Made fresh daily",
  "features.fresh": "Fresh ingredients", "features.fresh_sub": "From local market",
  "features.fast": "Ready in 15 min", "features.fast_sub": "Takeaway",
  "about.title": "Our Story",
  "about.hero_title": "The Love of Artisan\nPizza",
  "about.hero_subtitle": "Since 2018, we've been keeping the Neapolitan tradition alive in the heart of Paris 15th",
  "about.story_title": "Our story",
  "about.story_p1": "Founded in 2018 by two Italian cuisine enthusiasts, WOODIZ was born from a simple dream: to bring real Neapolitan pizza to Paris — the kind you eat standing in a Naples alley, crispy on the outside, melting on the inside.",
  "about.story_p2": "Our wood-fired oven, imported directly from Naples, reaches 450°C to cook each pizza in under 90 seconds. This ancestral technique is the secret to an incomparable dough — light, airy, with slightly charred edges.",
  "about.story_p3": "Every morning, our team hand-prepares the dough using Italian 00 flour, natural yeast and a long 48-hour fermentation. Nothing is left to chance.",
  "about.values_title": "Our values",
  "about.val1_title": "Authenticity", "about.val1_text": "Traditional Neapolitan recipes, no compromises.",
  "about.val2_title": "Freshness", "about.val2_text": "Ingredients sourced every morning from the local market.",
  "about.val3_title": "Passion", "about.val3_text": "Every pizza is prepared with care and a love of the craft.",
  "about.val4_title": "Community", "about.val4_text": "Deeply rooted in the 15th arrondissement since 2018.",
  "about.team_title": "Our team",
  "about.chef_name": "Marco Rossi", "about.chef_role": "Head Pizzaiolo", "about.chef_bio": "Trained in Naples, Marco brings 15 years of experience and a burning passion for traditional pizza.",
  "about.stats_years": "years of experience", "about.stats_pizzas": "pizzas served", "about.stats_rating": "Google rating", "about.stats_km": "delivery radius",
  "about.cta_title": "Ready to discover our pizzas?",
  "about.cta_subtitle": "Order online or visit us at 93 Rue Lecourbe, Paris 15th.",
  "about.cta_button": "See the menu →",
  "about.map_title": "Find us",
  "about.back_home": "← Back to home",
};
export const DEFAULT_IT_STRINGS: Record<string, string> = {
  "nav.search_placeholder": "Cerca una pizza...", "nav.reviews": "recensioni",
  "nav.about": "Chi siamo",
  "hero.cta": "Vedi il menu →", "section.promotions": "Promozioni del Momento",
  "section.our_menu": "Il Nostro Menu", "section.featured": "Prodotti in Evidenza", "section.search_results": "Risultati di ricerca",
  "section.results_for": "risultato/i per", "product.out_of_stock": "Esaurito",
  "product.add_to_cart": "Aggiungi", "product.allergens": "Allergeni", "product.close": "Chiudi",
  "footer.rights": "Tutti i diritti riservati.", "footer.follow_us": "Seguici",
  "footer.hours": "Orari", "footer.contact": "Contatti",
  "footer.our_menu": "Il Nostro Menu", "footer.reviews_section": "Recensioni clienti",
  "footer.about": "Chi siamo",
  "footer.order": "Ordina",
  "faq.title": "Domande Frequenti",
  "legal.mentions": "Note legali", "legal.cgu": "Condizioni d'uso", "legal.privacy": "Informativa sulla privacy",
  "reviews.title": "Cosa dicono i nostri clienti", "reviews.see_all": "Vedi tutte le recensioni Google",
  "popup.title": "Vi è piaciuta la pizza?", "popup.subtitle": "Lasciateci una recensione Google, ci aiuta molto!", "popup.button": "Lascia una recensione ⭐", "popup.later": "Più tardi",
  "toast.settings_saved": "Impostazioni salvate ✓", "toast.product_updated": "Prodotto aggiornato ✓",
  "toast.product_added": "Prodotto aggiunto ✓", "toast.product_deleted": "Prodotto eliminato",
  "toast.category_saved": "Categoria salvata ✓", "toast.category_deleted": "Categoria eliminata",
  "toast.promo_saved": "Offerta salvata ✓", "toast.promo_deleted": "Offerta eliminata", "toast.reset_done": "Dati ripristinati ✓",
  "features.dough": "Impasto fatto in casa", "features.dough_sub": "Preparato ogni giorno",
  "features.fresh": "Ingredienti freschi", "features.fresh_sub": "Dal mercato locale",
  "features.fast": "Pronta in 15 min", "features.fast_sub": "Da asporto",
  "about.title": "La Nostra Storia",
  "about.hero_title": "L'Amore per la Pizza\nArtigianale",
  "about.hero_subtitle": "Dal 2018, perpetuiamo la tradizione napoletana nel cuore di Parigi 15°",
  "about.story_title": "La nostra storia",
  "about.story_p1": "Fondata nel 2018 da due appassionati di cucina italiana, WOODIZ è nata da un sogno semplice: portare a Parigi la vera pizza napoletana, quella che si mangia in piedi in un vicolo di Napoli.",
  "about.story_p2": "Il nostro forno a legna, importato direttamente da Napoli, raggiunge i 450°C per cuocere ogni pizza in meno di 90 secondi. Questa tecnica ancestrale è il segreto di un impasto incomparabile.",
  "about.story_p3": "Ogni mattina, il nostro team prepara l'impasto a mano con farina italiana tipo 00, lievito naturale e una lunga fermentazione di 48 ore.",
  "about.values_title": "I nostri valori",
  "about.val1_title": "Autenticità", "about.val1_text": "Ricette tradizionali napoletane, senza compromessi.",
  "about.val2_title": "Freschezza", "about.val2_text": "Ingredienti del mercato locale ogni mattina.",
  "about.val3_title": "Passione", "about.val3_text": "Ogni pizza è preparata con cura e amore del mestiere.",
  "about.val4_title": "Comunità", "about.val4_text": "Fortemente radicati nel 15° arrondissement dal 2018.",
  "about.team_title": "Il nostro team",
  "about.chef_name": "Marco Rossi", "about.chef_role": "Chef Pizzaiolo", "about.chef_bio": "Formato a Napoli, Marco porta 15 anni di esperienza e una passione ardente per la pizza tradizionale.",
  "about.stats_years": "anni di esperienza", "about.stats_pizzas": "pizze servite", "about.stats_rating": "valutazione Google", "about.stats_km": "raggio di consegna",
  "about.cta_title": "Pronti a scoprire le nostre pizze?",
  "about.cta_subtitle": "Ordina online o vienici a trovare al 93 Rue Lecourbe, Parigi 15°.",
  "about.cta_button": "Vedi il menu →",
  "about.map_title": "Trovarci",
  "about.back_home": "← Torna alla home",
};
export const DEFAULT_ES_STRINGS: Record<string, string> = {
  "nav.search_placeholder": "Buscar una pizza...", "nav.reviews": "reseñas",
  "nav.about": "Sobre nosotros",
  "hero.cta": "Ver la carta →", "section.promotions": "Promociones del Momento",
  "section.our_menu": "Nuestra Carta", "section.featured": "Productos Destacados", "section.search_results": "Resultados de búsqueda",
  "section.results_for": "resultado(s) para", "product.out_of_stock": "Agotado",
  "product.add_to_cart": "Añadir", "product.allergens": "Alérgenos", "product.close": "Cerrar",
  "footer.rights": "Todos los derechos reservados.", "footer.follow_us": "Síguenos",
  "footer.hours": "Horarios", "footer.contact": "Contacto",
  "footer.our_menu": "Nuestra Carta", "footer.reviews_section": "Reseñas de clientes",
  "footer.about": "Sobre nosotros",
  "footer.order": "Pedir",
  "faq.title": "Preguntas Frecuentes",
  "legal.mentions": "Aviso legal", "legal.cgu": "Condiciones de uso", "legal.privacy": "Política de privacidad",
  "reviews.title": "Lo que dicen nuestros clientes", "reviews.see_all": "Ver todas las reseñas de Google",
  "popup.title": "¿Le gustó su pizza?", "popup.subtitle": "¡Déjenos una reseña en Google, nos ayuda mucho!", "popup.button": "Dejar una reseña ⭐", "popup.later": "Más tarde",
  "toast.settings_saved": "Configuración guardada ✓", "toast.product_updated": "Producto actualizado ✓",
  "toast.product_added": "Producto añadido ✓", "toast.product_deleted": "Producto eliminado",
  "toast.category_saved": "Categoría guardada ✓", "toast.category_deleted": "Categoría eliminada",
  "toast.promo_saved": "Oferta guardada ✓", "toast.promo_deleted": "Oferta eliminada", "toast.reset_done": "Datos restablecidos ✓",
  "features.dough": "Masa artesanal", "features.dough_sub": "Preparada cada día",
  "features.fresh": "Ingredientes frescos", "features.fresh_sub": "Del mercado local",
  "features.fast": "Lista en 15 min", "features.fast_sub": "Para llevar",
  "about.title": "Nuestra Historia",
  "about.hero_title": "El Amor por la Pizza\nArtesanal",
  "about.hero_subtitle": "Desde 2018, perpetuamos la tradición napolitana en el corazón del París 15°",
  "about.story_title": "Nuestra historia",
  "about.story_p1": "Fundada en 2018 por dos apasionados de la cocina italiana, WOODIZ nació de un sueño simple: traer a París la verdadera pizza napolitana.",
  "about.story_p2": "Nuestro horno de leña, importado directamente de Nápoles, alcanza los 450°C para cocinar cada pizza en menos de 90 segundos.",
  "about.story_p3": "Cada mañana, nuestro equipo prepara la masa a mano con harina italiana tipo 00, levadura natural y una larga fermentación de 48 horas.",
  "about.values_title": "Nuestros valores",
  "about.val1_title": "Autenticidad", "about.val1_text": "Recetas tradicionales napolitanas, sin compromisos.",
  "about.val2_title": "Frescura", "about.val2_text": "Ingredientes del mercado local cada mañana.",
  "about.val3_title": "Pasión", "about.val3_text": "Cada pizza se prepara con cuidado y amor por el oficio.",
  "about.val4_title": "Comunidad", "about.val4_text": "Profundamente arraigados en el barrio 15° desde 2018.",
  "about.team_title": "Nuestro equipo",
  "about.chef_name": "Marco Rossi", "about.chef_role": "Chef Pizzaiolo", "about.chef_bio": "Formado en Nápoles, Marco aporta 15 años de experiencia y una pasión ardiente por la pizza tradicional.",
  "about.stats_years": "años de experiencia", "about.stats_pizzas": "pizzas servidas", "about.stats_rating": "calificación Google", "about.stats_km": "radio de entrega",
  "about.cta_title": "¿Listo para descubrir nuestras pizzas?",
  "about.cta_subtitle": "Pide en línea o visítanos en 93 Rue Lecourbe, París 15°.",
  "about.cta_button": "Ver la carta →",
  "about.map_title": "Encuéntranos",
  "about.back_home": "← Volver al inicio",
};

export const DEFAULT_TRANSLATIONS: Translation[] = [
  { locale: "fr", label: "Français", flag: "🇫🇷", enabled: true, strings: DEFAULT_FR_STRINGS },
  { locale: "en", label: "English", flag: "🇬🇧", enabled: true, strings: DEFAULT_EN_STRINGS },
  { locale: "it", label: "Italiano", flag: "🇮🇹", enabled: true, strings: DEFAULT_IT_STRINGS },
  { locale: "es", label: "Español", flag: "🇪🇸", enabled: true, strings: DEFAULT_ES_STRINGS },
];

export const DEFAULT_SLIDER_SLIDES: SliderSlide[] = [
  { type: "image", value: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200", textSizeTitle: "xl", textSizeSubtitle: "md", useCustomText: false },
  { type: "image", value: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200", textSizeTitle: "xl", textSizeSubtitle: "md", useCustomText: false },
  { type: "color", value: "#2B1408", textSizeTitle: "2xl", textSizeSubtitle: "lg", useCustomText: true, customTitle: "Commandez maintenant", customSubtitle: "Livraison rapide · Paris 15ème" },
  { type: "image", value: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1200", textSizeTitle: "xl", textSizeSubtitle: "md", useCustomText: false },
];

export const DEFAULT_FAQS: FAQ[] = [
  { id: 1, question: "Livrez-vous à domicile ?", answer: "Oui, nous livrons dans un rayon de 5km autour de notre pizzeria. La livraison est gratuite dès 25€ de commande.", order: 1, active: true },
  { id: 2, question: "Quels sont vos horaires d'ouverture ?", answer: "Nous sommes ouverts du Lundi au Vendredi de 11h30 à 22h30, et le Samedi-Dimanche de 11h30 à 23h00.", order: 2, active: true },
  { id: 3, question: "Proposez-vous des pizzas sans gluten ?", answer: "Nous n'avons pas encore de pâte sans gluten, mais nous travaillons à en proposer très prochainement.", order: 3, active: true },
  { id: 4, question: "Puis-je personnaliser ma pizza ?", answer: "Absolument ! Contactez-nous directement par téléphone pour toute demande de personnalisation.", order: 4, active: true },
  { id: 5, question: "Quelle est la taille de vos pizzas ?", answer: "Toutes nos pizzas font 31cm de diamètre, cuites au four à bois pour une pâte croustillante et savoureuse.", order: 5, active: true },
];

export const DEFAULT_LEGAL_PAGES: LegalPage[] = [
  { id: "mentions", title: "Mentions légales", enabled: true, content: "## Mentions légales\n\n**Éditeur du site**\n\nWOODIZ – Pizzeria Artisanale\n93 Rue Lecourbe, Paris 75015\nTéléphone : +33 1 00 00 00 00\nEmail : contact@woodiz.fr\n\n**Directeur de la publication**\n\nNom du responsable légal\n\n**Hébergement**\n\nVercel Inc.\n340 Pine Street, Suite 401, San Francisco, California 94104, USA\n\n**Propriété intellectuelle**\n\nL'ensemble du contenu de ce site est protégé par le droit d'auteur. Toute reproduction est interdite sans accord préalable." },
  { id: "cgu", title: "Conditions Générales d'Utilisation", enabled: true, content: "## Conditions Générales d'Utilisation\n\n**Article 1 – Objet**\n\nLes présentes CGU régissent l'utilisation du site woodiz.fr exploité par WOODIZ Pizzeria.\n\n**Article 2 – Accès au site**\n\nLe site est accessible 24h/24 et 7j/7, sauf interruptions techniques.\n\n**Article 3 – Responsabilité**\n\nWOODIZ ne saurait être tenu responsable des dommages directs ou indirects liés à l'utilisation du site.\n\n**Article 4 – Loi applicable**\n\nLes présentes CGU sont soumises au droit français." },
  { id: "privacy", title: "Politique de confidentialité", enabled: true, content: "## Politique de confidentialité\n\n**Collecte des données**\n\nWOODIZ collecte uniquement les données nécessaires au fonctionnement du site. Aucune donnée personnelle n'est collectée sans votre consentement.\n\n**Utilisation des cookies**\n\nCe site utilise des cookies techniques indispensables à son bon fonctionnement. Aucun cookie publicitaire n'est déposé.\n\n**Vos droits**\n\nConformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à contact@woodiz.fr." },
];

export const DEFAULT_REVIEWS: CustomerReview[] = [
  { id: 1, name: "Sophie M.", rating: 5, text: "Pizza incroyable ! La pâte est parfaite, les ingrédients super frais. Je recommande vivement la Burratissima !", date: "2025-01-15", active: true, order: 1 },
  { id: 2, name: "Thomas R.", rating: 5, text: "Le meilleur rapport qualité/prix du 15ème. Livraison rapide et pizza encore chaude à l'arrivée. Merci !", date: "2025-01-20", active: true, order: 2 },
  { id: 3, name: "Marie L.", rating: 4, text: "Très bonne pizzeria artisanale. La Truffeta est exceptionnelle. On reviendra sans hésiter.", date: "2025-02-01", active: true, order: 3 },
  { id: 4, name: "Lucas B.", rating: 5, text: "Woodiz c'est notre pizzeria préférée ! Toujours délicieux, service au top. La Diablo est parfaite pour les amateurs de piment.", date: "2025-02-10", active: true, order: 4 },
  { id: 5, name: "Clara D.", rating: 5, text: "Pâte fine et croustillante comme en Italie. Les ingrédients sont vraiment frais. Livraison en moins de 30 min !", date: "2025-02-18", active: true, order: 5 },
  { id: 6, name: "Antoine P.", rating: 4, text: "Excellente pizza artisanale. Le four à bois fait vraiment la différence. Je conseille la Signature Mountain.", date: "2025-03-01", active: true, order: 6 },
];

export const DEFAULT_GOOGLE_REVIEW_POPUP: GoogleReviewPopup = {
  enabled: true, googleReviewUrl: "https://g.page/r/woodiz-paris/review",
  title: "Vous avez apprécié votre pizza ?", subtitle: "Laissez-nous un avis Google, ça nous aide beaucoup !",
  buttonText: "Laisser un avis ⭐", delaySeconds: 30, showOnce: true, bgColor: "#FFFFFF", accentColor: "#F59E0B",
};

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  showCategories: true, showSocial: true, showContact: true, showReviews: true, showLegalLinks: true,
  reviewsLabel: "avis Google", googleRating: "4.4", googleReviewCount: "127", customLinks: [],
};

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "WOODIZ", tagline: "Pizzeria Artisanale · Paris 15ème",
  address: "93 Rue Lecourbe, Paris 75015", phone: "+33 1 00 00 00 00", email: "contact@woodiz.fr",
  primaryColor: "#F59E0B", accentColor: "#2B1408",
  heroTitle: "La pizza artisanale\nlivrée chez vous",
  heroSubtitle: "Pâte maison · Ø 31cm · Ingrédients frais du marché",
  metaTitle: "WOODIZ – Pizzeria Artisanale · Paris 15ème | 93 Rue Lecourbe",
  metaDescription: "WOODIZ, pizzeria artisanale au cœur de Paris 15ème.",
  metaKeywords: "pizzeria paris 15, woodiz, pizza artisanale paris",
  instagramUrl: "https://www.instagram.com/woodiz_paris15", googleUrl: "https://g.page/woodiz-paris",
  openHours: "Lun–Ven 11h30–22h30 · Sam–Dim 11h30–23h00",
  footerText: "Pizzeria artisanale au cœur de Paris 15ème. Pâte maison, ingrédients frais du marché, pizzas Ø 31cm.",
  sliderImages: ["https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200","https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200","https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200","https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1200"],
  sliderSlides: DEFAULT_SLIDER_SLIDES,
  faviconEmoji: "🍕", faviconUrl: "", logoText: "W",
  notificationBar: { enabled: true, text: "🍕 Livraison gratuite dès 25€ · Commandez maintenant !", bgColor: "#F59E0B", textColor: "#1A1A2E", link: "", closeable: true, style: "bar" },
  appBanner: { enabled: false, icon: "🛵", iconBg: "#10B981", title: "L'appli qui vous facilite la vie !", subtitle: "⭐⭐⭐⭐⭐ 2,517 de notes", buttonText: "Ouvrir", buttonLink: "", buttonBg: "#10B981", buttonTextColor: "#ffffff", bgColor: "#1A1A2E", textColor: "#ffffff", closeable: true },
  googleRating: "4.4", googleReviewCount: "127",
  footerConfig: DEFAULT_FOOTER_CONFIG,
  features: DEFAULT_FEATURES,
  orderButtons: [
    { id: "phone", enabled: true, label: "Commander par téléphone", url: "tel:+33100000000", bgColor: "#F59E0B", textColor: "#1A1A2E", type: "phone" },
    { id: "ubereats", enabled: true, label: "Commander sur", url: "https://ubereats.com", bgColor: "#06C167", textColor: "#FFFFFF", type: "ubereats" },
    { id: "deliveroo", enabled: true, label: "Commander sur", url: "https://deliveroo.fr", bgColor: "#00CCBC", textColor: "#FFFFFF", type: "deliveroo" },
  ],
  cookieBanner: {
    enabled: true,
    title: "Gérer le consentement aux cookies",
    description: "Pour offrir les meilleures expériences, nous utilisons des technologies telles que les cookies pour stocker et/ou accéder aux informations des appareils.",
    acceptText: "Accepter", rejectText: "Refuser", prefsText: "Voir les préférences",
    translations: {
      en: { title: "Manage cookie consent", description: "To provide the best experiences, we use technologies like cookies to store and/or access device information.", acceptText: "Accept", rejectText: "Decline", prefsText: "View preferences" },
      it: { title: "Gestisci il consenso ai cookie", description: "Per offrire le migliori esperienze, utilizziamo tecnologie come i cookie.", acceptText: "Accetta", rejectText: "Rifiuta", prefsText: "Vedi preferenze" },
      es: { title: "Gestionar el consentimiento de cookies", description: "Para ofrecer las mejores experiencias, utilizamos tecnologías como las cookies.", acceptText: "Aceptar", rejectText: "Rechazar", prefsText: "Ver preferencias" },
    },
  },
  closingAlert: {
    enabled: true,
    minutesBefore: 60,
    text: "⚡ Vite ! Vite ! – nous fermons bientôt ! Commandez dans les {mins} min",
    bgColor: "#EF4444",
    textColor: "#FFFFFF",
  },
  storeSchedule: {
    lunchEnabled: true, lunchOpen: "11:00", lunchClose: "14:30",
    dinnerEnabled: true, dinnerOpen: "18:00", dinnerClose: "02:00",
    closedDays: [],
  },
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "tomate", name: "Base Tomate", icon: "🍅", order: 1, active: true, description: "Pizzas sur base sauce tomate maison", translations: { en: { name: "Tomato Base", description: "Pizzas with homemade tomato sauce" }, it: { name: "Base Pomodoro", description: "Pizze con salsa di pomodoro fatta in casa" }, es: { name: "Base Tomate", description: "Pizzas con salsa de tomate casera" } } },
  { id: "creme", name: "Base Crème", icon: "🥛", order: 2, active: true, description: "Pizzas sur base crème fraîche", translations: { en: { name: "Cream Base", description: "Pizzas with fresh cream" }, it: { name: "Base Crema", description: "Pizze con panna fresca" }, es: { name: "Base Crema", description: "Pizzas con nata fresca" } } },
  { id: "sig", name: "Signatures", icon: "⭐", order: 3, active: true, description: "Créations exclusives du chef", translations: { en: { name: "Signatures", description: "Chef's exclusive creations" }, it: { name: "Signature", description: "Creazioni esclusive dello chef" }, es: { name: "Firmas", description: "Creaciones exclusivas del chef" } } },
  { id: "dessert", name: "Desserts", icon: "🍮", order: 4, active: true, description: "Nos douceurs sucrées", translations: { en: { name: "Desserts", description: "Our sweet treats" }, it: { name: "Dolci", description: "I nostri dolci" }, es: { name: "Postres", description: "Nuestros dulces" } } },
  { id: "boissons", name: "Boissons", icon: "🥤", order: 5, active: true, description: "Boissons froides & chaudes", translations: { en: { name: "Drinks", description: "Cold & hot beverages" }, it: { name: "Bevande", description: "Bevande fredde e calde" }, es: { name: "Bebidas", description: "Bebidas frías y calientes" } } },
];

export const DEFAULT_PROMOS: Promo[] = [
  { id: 1, title: "1 Pizza Sénior + 1 Boisson Offerte", price: "10,90€", badge: "Menu Midi · À Emporter", bg: "#FFF9C4", textColor: "#1A1A2E", active: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200", order: 1, type: "card" },
  { id: 2, title: "1 Pizza Signature + 1 Boisson Offerte", price: "11,90€", badge: "Menu Midi · Signature", bg: "#1E1B3A", textColor: "#ffffff", active: true, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200", order: 2, type: "card" },
  { id: 3, title: "2 Pizzas Normales à Emporter", price: "19,90€", badge: "Offre À Emporter", bg: "#FF6B35", textColor: "#ffffff", active: true, image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200", order: 3, type: "card" },
  { id: 4, title: "Frais de livraison OFFERTS avec Amazon Prime*", price: "", badge: "Profitez de Deliveroo Plus Argent offert !", bg: "#5B2D8E", textColor: "#ffffff", active: true, image: "", order: 4, type: "banner", bgImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800", link: "https://deliveroo.fr" },
];

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "Margherita", category: "tomate", desc: "Sauce tomate, mozza, olives noires", price: 10.90, badge: "Bestseller", badgeColor: "#F59E0B", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600", inStock: true, order: 1, featured: true, translations: { en: { name: "Margherita", desc: "Tomato sauce, mozzarella, black olives" }, it: { name: "Margherita", desc: "Salsa di pomodoro, mozzarella, olive nere" }, es: { name: "Margarita", desc: "Salsa de tomate, mozzarella, aceitunas negras" } } },
  { id: 2, name: "Regina", category: "tomate", desc: "Sauce tomate, mozza, jambon et champignons frais", price: 11.90, badge: "Classique", badgeColor: "#10B981", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600", inStock: true, order: 2, translations: { en: { name: "Regina", desc: "Tomato sauce, mozzarella, ham and fresh mushrooms" }, it: { name: "Regina", desc: "Salsa di pomodoro, mozzarella, prosciutto e funghi" }, es: { name: "Regina", desc: "Salsa de tomate, mozzarella, jamón y champiñones" } } },
  { id: 3, name: "Napolitaine", category: "tomate", desc: "Sauce tomate, mozza, stracciatella, olives noires, anchois et câpres", price: 12.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose", "🐟 Poisson"], img: "https://images.unsplash.com/photo-1571066811602-716837d681de?w=600", inStock: true, order: 3 },
  { id: 4, name: "Pécheur", category: "tomate", desc: "Sauce tomate, mozza, thon, olives noires, oignons rouges, basilic frais", price: 12.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose", "🐟 Poisson"], img: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600", inStock: true, order: 4 },
  { id: 5, name: "Calzone", category: "tomate", desc: "Sauce tomate, mozza, oeuf, emmental et 1 viande au choix", price: 11.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose", "🥚 Oeufs"], img: "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=600", inStock: true, order: 5 },
  { id: 6, name: "5 Fromages", category: "tomate", desc: "Sauce tomate, mozza, bleu, chèvre, emmental et raclette", price: 12.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600", inStock: false, order: 6 },
  { id: 7, name: "Diablo", category: "tomate", desc: "Sauce tomate, mozza, nduja, poivrons grillés, piment frais, basilic", price: 12.90, badge: "🌶️ Pimenté", badgeColor: "#DC2626", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600", inStock: true, order: 7 },
  { id: 8, name: "Végétarienne", category: "tomate", desc: "Sauce tomate, mozza, poivrons multicolores, courgettes, aubergines, herbes de Provence", price: 11.90, badge: "🌱 Veggie", badgeColor: "#16A34A", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1520201163981-8cc45f3cbea1?w=600", inStock: true, order: 8 },
  { id: 9, name: "Tartiflette", category: "creme", desc: "Crème fraîche, mozza, lardons, pomme de terre, raclette et oignons rouges", price: 12.90, badge: "Coup de coeur", badgeColor: "#EF4444", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=600", inStock: true, order: 1 },
  { id: 10, name: "Norvégienne", category: "creme", desc: "Crème fraîche, mozza, saumon fumé, tomate séchée, roquette, citron", price: 14.90, badge: "Nouveau", badgeColor: "#0EA5E9", allergens: ["🌾 Gluten", "🥛 Lactose", "🐟 Poisson"], img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600", inStock: true, order: 2 },
  { id: 11, name: "Auvergnate", category: "creme", desc: "Crème fraîche, mozza, poulet mariné, jambon, pomme de terre et bleu", price: 12.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=600", inStock: true, order: 3 },
  { id: 12, name: "Fermière", category: "creme", desc: "Crème fraîche, mozza, poulet mariné, pomme de terre, champignons frais et persillade", price: 12.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600", inStock: true, order: 4 },
  { id: 13, name: "Chèvre Figue", category: "creme", desc: "Crème fraîche, mozza, jambon, fromage de chèvre, miel, figues séchées et noix", price: 13.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose", "🥜 Fruits à coque"], img: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600", inStock: true, order: 5 },
  { id: 14, name: "3 Fondus", category: "creme", desc: "Crème fraîche, mozza, lardons grillés, pomme de terre, comté, emmental et beaufort", price: 13.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600", inStock: false, order: 6 },
  { id: 15, name: "Mountain", category: "sig", desc: "Moutarde au miel, mozza, poulet mariné, comté, beaufort, oignons rouges", price: 13.90, badge: "Signature", badgeColor: "#2B1408", allergens: ["🌾 Gluten", "🥛 Lactose", "🌱 Moutarde"], img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600", inStock: true, order: 1 },
  { id: 16, name: "Truffeta", category: "sig", desc: "Crème de truffe, mozza, champignons frais, parmesan, roquette et huile de truffe", price: 15.90, badge: "Signature", badgeColor: "#2B1408", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600", inStock: true, order: 2 },
  { id: 17, name: "Burratissima", category: "sig", desc: "Sauce tomate, burrata, tomates cerises, roquette, jambon cru, huile extra vierge", price: 15.90, badge: "Chef's Choice", badgeColor: "#8B5CF6", allergens: ["🌾 Gluten", "🥛 Lactose"], img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600", inStock: true, order: 3, featured: true },
  { id: 18, name: "Nutella", category: "dessert", desc: "Pâte à pizza sucrée, Nutella, noisettes concassées, sucre glace", price: 7.90, badge: "", badgeColor: "", allergens: ["🌾 Gluten", "🥛 Lactose", "🥜 Fruits à coque"], img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600", inStock: true, order: 1 },
  { id: 19, name: "Coca-Cola", category: "boissons", desc: "Canette 33cl", price: 2.50, badge: "", badgeColor: "", allergens: [], img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600", inStock: true, order: 1 },
  { id: 20, name: "Eau Pétillante", category: "boissons", desc: "Bouteille 50cl", price: 1.50, badge: "", badgeColor: "", allergens: [], img: "https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600", inStock: true, order: 2 },
  { id: 21, name: "Jus d'Orange", category: "boissons", desc: "25cl – Pressé frais", price: 3.00, badge: "", badgeColor: "", allergens: [], img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600", inStock: false, order: 3 },
];

export interface AdminCredentials { username: string; password: string; }

export interface WoodizStore {
  settings: SiteSettings; categories: Category[]; products: Product[]; promos: Promo[];
  faqs: FAQ[]; legalPages: LegalPage[]; reviews: CustomerReview[]; googleReviewPopup: GoogleReviewPopup;
  toast: Toast | null; translations: Translation[]; activeLocale: Locale; adminCredentials: AdminCredentials;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  saveFeatures: (features: FeatureItem[]) => void;
  saveProduct: (product: Product) => void; deleteProduct: (id: number) => void;
  toggleStock: (id: number) => void; reorderProducts: (products: Product[]) => void;
  saveCategory: (category: Category) => void; deleteCategory: (id: string) => void; reorderCategories: (categories: Category[]) => void;
  savePromo: (promo: Promo) => void; deletePromo: (id: number) => void; togglePromo: (id: number) => void;
  saveFAQ: (faq: FAQ) => void; deleteFAQ: (id: number) => void; toggleFAQ: (id: number) => void; reorderFAQs: (faqs: FAQ[]) => void;
  saveLegalPage: (page: LegalPage) => void;
  saveReview: (review: CustomerReview) => void; deleteReview: (id: number) => void; toggleReview: (id: number) => void; reorderReviews: (reviews: CustomerReview[]) => void;
  saveGoogleReviewPopup: (popup: GoogleReviewPopup) => void;
  setLocale: (locale: Locale) => void; saveTranslation: (translation: Translation) => void; deleteTranslation: (locale: Locale) => void; toggleTranslation: (locale: Locale) => void;
  t: (key: string) => string;
  getCategoryName: (categoryId: string) => string;
  getProductName: (productId: number) => string;
  getProductDesc: (productId: number) => string;
  updateAdminCredentials: (credentials: AdminCredentials) => void;
  showToast: (msg: string, type?: Toast["type"]) => void; clearToast: () => void; resetToDefaults: () => void;
}

export const useWoodizStore = create<WoodizStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS, categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS,
      promos: DEFAULT_PROMOS, faqs: DEFAULT_FAQS, legalPages: DEFAULT_LEGAL_PAGES,
      reviews: DEFAULT_REVIEWS, googleReviewPopup: DEFAULT_GOOGLE_REVIEW_POPUP,
      toast: null, translations: DEFAULT_TRANSLATIONS, activeLocale: "fr",
      adminCredentials: { username: "admin", password: "woodiz2024" },

      updateSettings: (patch) => { set((s) => ({ settings: { ...s.settings, ...patch } })); get().showToast(get().t("toast.settings_saved")); },
      saveFeatures: (features) => { set((s) => ({ settings: { ...s.settings, features } })); get().showToast("Bandeau mis à jour ✓"); },
      saveProduct: (product) => { set((s) => { const exists = s.products.find((p) => p.id === product.id); return { products: exists ? s.products.map((p) => (p.id === product.id ? product : p)) : [...s.products, { ...product, id: Date.now() }] }; }); get().showToast(product.id ? get().t("toast.product_updated") : get().t("toast.product_added")); },
      deleteProduct: (id) => { set((s) => ({ products: s.products.filter((p) => p.id !== id) })); get().showToast(get().t("toast.product_deleted"), "error"); },
      toggleStock: (id) => { set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, inStock: !p.inStock } : p) })); },
      reorderProducts: (products) => set({ products }),
      saveCategory: (category) => { set((s) => { const exists = s.categories.find((c) => c.id === category.id); return { categories: exists ? s.categories.map((c) => (c.id === category.id ? category : c)) : [...s.categories, category] }; }); get().showToast(get().t("toast.category_saved")); },
      deleteCategory: (id) => { set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })); get().showToast(get().t("toast.category_deleted"), "error"); },
      reorderCategories: (categories) => set({ categories }),
      savePromo: (promo) => { set((s) => { const exists = s.promos.find((p) => p.id === promo.id); return { promos: exists ? s.promos.map((p) => (p.id === promo.id ? promo : p)) : [...s.promos, { ...promo, id: Date.now() }] }; }); get().showToast(get().t("toast.promo_saved")); },
      deletePromo: (id) => { set((s) => ({ promos: s.promos.filter((p) => p.id !== id) })); get().showToast(get().t("toast.promo_deleted"), "error"); },
      togglePromo: (id) => { set((s) => ({ promos: s.promos.map((p) => p.id === id ? { ...p, active: !p.active } : p) })); },
      saveFAQ: (faq) => { set((s) => { const exists = s.faqs.find((f) => f.id === faq.id); return { faqs: exists ? s.faqs.map((f) => (f.id === faq.id ? faq : f)) : [...s.faqs, { ...faq, id: Date.now() }] }; }); get().showToast("FAQ sauvegardée ✓"); },
      deleteFAQ: (id) => { set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) })); get().showToast("FAQ supprimée", "error"); },
      toggleFAQ: (id) => { set((s) => ({ faqs: s.faqs.map((f) => f.id === id ? { ...f, active: !f.active } : f) })); },
      reorderFAQs: (faqs) => set({ faqs }),
      saveLegalPage: (page) => { set((s) => ({ legalPages: s.legalPages.map((p) => p.id === page.id ? page : p) })); get().showToast("Page légale sauvegardée ✓"); },
      saveReview: (review) => { set((s) => { const exists = s.reviews.find((r) => r.id === review.id); return { reviews: exists ? s.reviews.map((r) => (r.id === review.id ? review : r)) : [...s.reviews, { ...review, id: Date.now() }] }; }); get().showToast("Avis sauvegardé ✓"); },
      deleteReview: (id) => { set((s) => ({ reviews: s.reviews.filter((r) => r.id !== id) })); get().showToast("Avis supprimé", "error"); },
      toggleReview: (id) => { set((s) => ({ reviews: s.reviews.map((r) => r.id === id ? { ...r, active: !r.active } : r) })); },
      reorderReviews: (reviews) => set({ reviews }),
      saveGoogleReviewPopup: (popup) => { set({ googleReviewPopup: popup }); get().showToast("Popup sauvegardé ✓"); },
      setLocale: (locale) => {
        set({ activeLocale: locale });
        // Remember that user manually chose a language — disable auto-detect
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("woodiz-locale-manual", locale);
        }
      },
      saveTranslation: (translation) => { set((s) => { const exists = s.translations.find((t) => t.locale === translation.locale); return { translations: exists ? s.translations.map((t) => (t.locale === translation.locale ? translation : t)) : [...s.translations, translation] }; }); get().showToast("Langue sauvegardée ✓"); },
      deleteTranslation: (locale) => { if (locale === "fr") return; set((s) => ({ translations: s.translations.filter((t) => t.locale !== locale), activeLocale: s.activeLocale === locale ? "fr" : s.activeLocale })); get().showToast("Langue supprimée", "error"); },
      toggleTranslation: (locale) => { if (locale === "fr") return; set((s) => ({ translations: s.translations.map((t) => t.locale === locale ? { ...t, enabled: !t.enabled } : t), activeLocale: s.activeLocale === locale && s.translations.find(t=>t.locale===locale)?.enabled ? "fr" : s.activeLocale })); get().showToast("Langue mise à jour ✓"); },
      t: (key) => { const { translations, activeLocale } = get(); const translation = translations.find((t) => t.locale === activeLocale); if (translation?.strings[key]) return translation.strings[key]; const fr = translations.find((t) => t.locale === "fr"); return fr?.strings[key] ?? DEFAULT_FR_STRINGS[key] ?? key; },
      getCategoryName: (categoryId) => { const { categories, activeLocale } = get(); const cat = categories.find((c) => c.id === categoryId); if (!cat) return categoryId; if (activeLocale !== "fr" && cat.translations?.[activeLocale]?.name) return cat.translations[activeLocale].name; return cat.name; },
      getProductName: (productId) => { const { products, activeLocale } = get(); const p = products.find((p) => p.id === productId); if (!p) return ""; if (activeLocale !== "fr" && p.translations?.[activeLocale]?.name) return p.translations[activeLocale].name; return p.name; },
      getProductDesc: (productId) => { const { products, activeLocale } = get(); const p = products.find((p) => p.id === productId); if (!p) return ""; if (activeLocale !== "fr" && p.translations?.[activeLocale]?.desc) return p.translations[activeLocale].desc; return p.desc; },
      updateAdminCredentials: (credentials) => { set({ adminCredentials: credentials }); get().showToast("Identifiants mis à jour ✓"); },
      showToast: (msg, type = "success") => { set({ toast: { msg, type } }); setTimeout(() => set({ toast: null }), 3000); },
      clearToast: () => set({ toast: null }),
      resetToDefaults: () => { set({ settings: DEFAULT_SETTINGS, categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS, promos: DEFAULT_PROMOS, faqs: DEFAULT_FAQS, legalPages: DEFAULT_LEGAL_PAGES, reviews: DEFAULT_REVIEWS, googleReviewPopup: DEFAULT_GOOGLE_REVIEW_POPUP, translations: DEFAULT_TRANSLATIONS, activeLocale: "fr" }); get().showToast(get().t("toast.reset_done")); },
    }),
    {
      name: "woodiz-store",
      skipHydration: true,
      version: 12,
      // Strip base64 images before saving to localStorage (prevents QuotaExceededError)
      // Uploaded images are saved in IndexedDB via lib/imageDb.ts
      partialize: (state) => ({
        ...state,
        products: state.products.map(p => ({
          ...p,
          img: p.img?.startsWith("data:") ? `__idb:product:${p.id}` : p.img,
        })),
        categories: state.categories.map(c => ({
          ...c,
          iconUrl: c.iconUrl?.startsWith("data:") ? `__idb:category:${c.id}` : c.iconUrl,
        })),
        settings: {
          ...state.settings,
          sliderSlides: state.settings.sliderSlides?.map((s, i) => ({
            ...s,
            value: s.type === "image" && s.value?.startsWith("data:") ? `__idb:slider:${i}` : s.value,
          })),
          sliderImages: state.settings.sliderImages?.map((img, i) =>
            img?.startsWith("data:") ? `__idb:sliderimg:${i}` : img
          ),
          faviconUrl: state.settings.faviconUrl?.startsWith("data:") ? "__idb:favicon:0" : state.settings.faviconUrl,
        },
        promos: state.promos.map(p => ({
          ...p,
          image: p.image?.startsWith("data:") ? `__idb:promo:${p.id}` : p.image,
        })),
      }),
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as any;
        if (version < 3) { if (!state.adminCredentials) state.adminCredentials = { username: "admin", password: "woodiz2024" }; if (!state.faqs) state.faqs = DEFAULT_FAQS; }
        if (version < 6) {
          if (!state.legalPages) state.legalPages = DEFAULT_LEGAL_PAGES;
          if (!state.reviews) state.reviews = DEFAULT_REVIEWS;
          if (!state.googleReviewPopup) state.googleReviewPopup = DEFAULT_GOOGLE_REVIEW_POPUP;
          if (!state.settings?.faviconUrl) state.settings = { ...state.settings, faviconUrl: "", googleRating: "4.4", googleReviewCount: "127", footerConfig: DEFAULT_FOOTER_CONFIG };
          if (!state.settings?.features) state.settings = { ...state.settings, features: DEFAULT_FEATURES };
          const hasIt = state.translations?.find((t: any) => t.locale === "it");
          const hasEs = state.translations?.find((t: any) => t.locale === "es");
          if (!hasIt && state.translations) state.translations = [...state.translations, { locale: "it", label: "Italiano", flag: "🇮🇹", strings: DEFAULT_IT_STRINGS }];
          if (!hasEs && state.translations) state.translations = [...state.translations, { locale: "es", label: "Español", flag: "🇪🇸", strings: DEFAULT_ES_STRINGS }];
        }
        // Always merge default strings so new keys are always available (defaults first, user overrides on top)
        if (version < 7) {
          if (state.translations) {
            const defaults: Record<string, Record<string, string>> = { fr: DEFAULT_FR_STRINGS, en: DEFAULT_EN_STRINGS, it: DEFAULT_IT_STRINGS, es: DEFAULT_ES_STRINGS };
            state.translations = state.translations.map((t: any) => ({
              ...t,
              strings: { ...(defaults[t.locale] || DEFAULT_FR_STRINGS), ...t.strings }
            }));
          }
        }
        // v8: new notification fields, promo type/link, category iconUrl, productDisplayMode
        if (version < 8) {
          if (state.settings?.notificationBar && state.settings.notificationBar.closeable === undefined) {
            state.settings.notificationBar = { closeable: true, style: "bar", link: "", ...state.settings.notificationBar };
          }
          if (!state.settings?.productDisplayMode) state.settings = { ...state.settings, productDisplayMode: "grid" };
          if (state.promos) state.promos = state.promos.map((p: any) => ({ type: "card", ...p }));
        }
        // v9: appBanner, promo ctaText
        if (version < 9) {
          if (!state.settings?.appBanner) {
            state.settings = { ...state.settings, appBanner: { enabled: false, icon: "🛵", iconBg: "#10B981", title: "L'appli qui vous facilite la vie !", subtitle: "⭐⭐⭐⭐⭐ 2,517 de notes", buttonText: "Ouvrir", buttonLink: "", buttonBg: "#10B981", buttonTextColor: "#ffffff", bgColor: "#1A1A2E", textColor: "#ffffff", closeable: true } };
          }
        }
        // v10: new about page + nav.about + footer.about keys merged
        if (version < 10) {
          const defaults: Record<string, Record<string, string>> = { fr: DEFAULT_FR_STRINGS, en: DEFAULT_EN_STRINGS, it: DEFAULT_IT_STRINGS, es: DEFAULT_ES_STRINGS };
          if (state.translations) {
            state.translations = state.translations.map((t: any) => ({
              ...t,
              strings: { ...(defaults[t.locale] || DEFAULT_FR_STRINGS), ...t.strings }
            }));
          }
        }
        // v11: storeSchedule + re-merge all translation keys
        if (version < 11) {
          if (!state.settings?.storeSchedule) {
            state.settings = { ...state.settings, storeSchedule: { lunchEnabled: true, lunchOpen: "11:00", lunchClose: "14:30", dinnerEnabled: true, dinnerOpen: "18:00", dinnerClose: "02:00", closedDays: [] } };
          }
          const defaults: Record<string, Record<string, string>> = { fr: DEFAULT_FR_STRINGS, en: DEFAULT_EN_STRINGS, it: DEFAULT_IT_STRINGS, es: DEFAULT_ES_STRINGS };
          if (state.translations) {
            state.translations = state.translations.map((t: any) => ({
              ...t,
              strings: { ...(defaults[t.locale] || DEFAULT_FR_STRINGS), ...t.strings }
            }));
          }
        }
        // v12: translation.enabled field + storeSchedule closedDays
        if (version < 12) {
          if (state.translations) {
            state.translations = state.translations.map((t: any) => ({
              enabled: true,
              ...t,
            }));
          }
        }
        return state;
      },
    }
  )
);
