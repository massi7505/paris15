// app/api/store/route.ts
// Remplace Redis par MySQL — stocke et restitue l'état complet du store Woodiz.
// L'interface REST reste identique : GET → charger, POST → sauvegarder.

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { query, execute, queryOne } from "@/lib/mysql";
import { getCached, setCache, invalidateCache } from "@/lib/cache";

// ─── Helpers de mapping DB → store ──────────────────────────────────────────

function rowToSettings(row: any) {
  if (!row) return null;
  return {
    siteName:          row.site_name,
    tagline:           row.tagline,
    address:           row.address,
    phone:             row.phone,
    email:             row.email,
    primaryColor:      row.primary_color,
    accentColor:       row.accent_color,
    heroTitle:         row.hero_title,
    heroSubtitle:      row.hero_subtitle,
    metaTitle:         row.meta_title,
    metaDescription:   row.meta_description,
    metaKeywords:      row.meta_keywords,
    instagramUrl:      row.instagram_url,
    googleUrl:         row.google_url,
    openHours:         row.open_hours,
    footerText:        row.footer_text,
    faviconEmoji:      row.favicon_emoji,
    faviconUrl:        row.favicon_url ?? "",
    logoText:          row.logo_text,
    googleRating:      row.google_rating,
    googleReviewCount: row.google_review_count,
    productDisplayMode: row.product_display_mode,
    notificationBar:   row.notification_bar   ?? null,
    appBanner:         row.app_banner          ?? null,
    footerConfig:      row.footer_config       ?? null,
    features:          Array.isArray(row.features)      ? row.features      : [],
    orderButtons:      Array.isArray(row.order_buttons) ? row.order_buttons : [],
    cookieBanner:      row.cookie_banner       ?? null,
    closingAlert:      row.closing_alert       ?? null,
    storeSchedule:     row.store_schedule      ?? null,
    sliderImages:      Array.isArray(row.slider_images) ? row.slider_images : [],
    sliderSlides:      [],
  };
}

function rowToSlide(row: any) {
  return {
    type:             row.type,
    value:            row.value,
    useCustomText:    Boolean(row.use_custom_text),
    customTitle:      row.custom_title ?? "",
    customSubtitle:   row.custom_subtitle ?? "",
    textSizeTitle:    row.text_size_title,
    textSizeSubtitle: row.text_size_subtitle,
    translations:     row.translations ?? undefined,
  };
}

function rowToCategory(row: any) {
  return {
    id:           row.id,
    name:         row.name,
    icon:         row.icon,
    iconUrl:      row.icon_url ?? undefined,
    order:        row.position,
    active:       Boolean(row.active),
    description:  row.description ?? "",
    translations: row.translations ?? undefined,
  };
}

function rowToProduct(row: any) {
  return {
    id:                   row.id,
    name:                 row.name,
    category:             row.category_id,
    desc:                 row.description ?? "",
    price:                Number(row.price),
    badge:                row.badge ?? "",
    badgeColor:           row.badge_color ?? "",
    allergens:            row.allergens ?? [],
    allergenTranslations: row.allergen_translations ?? undefined,
    img:                  row.img ?? "",
    inStock:              Boolean(row.in_stock),
    order:                row.position,
    featured:             Boolean(row.featured),
    translations:         row.translations ?? undefined,
    seoTitle:             row.seo_title ?? undefined,
    seoDescription:       row.seo_description ?? undefined,
  };
}

function rowToPromo(row: any) {
  return {
    id:           row.id,
    title:        row.title,
    price:        row.price ?? "",
    badge:        row.badge ?? "",
    bg:           row.bg_color,
    textColor:    row.text_color,
    active:       Boolean(row.active),
    image:        row.image ?? "",
    bgImage:      row.bg_image ?? undefined,
    type:         row.type,
    link:         row.link ?? undefined,
    ctaText:      row.cta_text ?? undefined,
    order:        row.position,
    translations: row.translations ?? undefined,
  };
}

function rowToFaq(row: any) {
  return {
    id:           row.id,
    question:     row.question,
    answer:       row.answer,
    order:        row.position,
    active:       Boolean(row.active),
    translations: row.translations ?? undefined,
  };
}

function rowToLegalPage(row: any) {
  return {
    id:      row.id,
    title:   row.title,
    content: row.content,
    enabled: Boolean(row.enabled),
  };
}

function rowToReview(row: any) {
  return {
    id:     row.id,
    name:   row.name,
    rating: row.rating,
    text:   row.review_text,
    date:   row.review_date instanceof Date
              ? row.review_date.toISOString().split("T")[0]
              : String(row.review_date),
    avatar: row.avatar ?? undefined,
    active: Boolean(row.active),
    order:  row.position,
  };
}

function rowToPopup(row: any) {
  if (!row) return null;
  return {
    enabled:         Boolean(row.enabled),
    googleReviewUrl: row.google_review_url,
    title:           row.title,
    subtitle:        row.subtitle ?? "",
    buttonText:      row.button_text,
    delaySeconds:    row.delay_seconds,
    showOnce:        Boolean(row.show_once),
    bgColor:         row.bg_color,
    accentColor:     row.accent_color,
  };
}

function rowToTranslation(row: any) {
  return {
    locale:  row.locale,
    label:   row.label,
    flag:    row.flag,
    enabled: Boolean(row.enabled),
    strings: row.strings ?? {},
  };
}

// ─── GET ────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    // ─── Cache mémoire (60s) : évite de requêter MySQL à chaque page view ──
    const cached = getCached<any>();
    if (cached) return NextResponse.json({ ok: true, data: cached });

    const [
      settingsRow, slides, categories, products, promos, faqs,
      legalPages, reviews, popupRow, translations, credRow,
    ] = await Promise.all([
      queryOne<any>("SELECT * FROM settings WHERE id = 1"),
      query<any>("SELECT * FROM slider_slides ORDER BY position ASC"),
      query<any>("SELECT * FROM categories ORDER BY position ASC"),
      query<any>("SELECT * FROM products ORDER BY category_id, position ASC"),
      query<any>("SELECT * FROM promos ORDER BY position ASC"),
      query<any>("SELECT * FROM faqs ORDER BY position ASC"),
      query<any>("SELECT * FROM legal_pages"),
      query<any>("SELECT * FROM reviews ORDER BY position ASC"),
      queryOne<any>("SELECT * FROM google_review_popup WHERE id = 1"),
      query<any>("SELECT * FROM translations"),
      // ⚠️ SÉCURITÉ : on ne récupère QUE le username — jamais le password_hash
      queryOne<any>("SELECT username FROM admin_credentials WHERE id = 1"),
    ]);

    if (!settingsRow) return NextResponse.json({ ok: true, data: null });

    const settings = rowToSettings(settingsRow)!;
    (settings as any).sliderSlides = slides.map(rowToSlide);

    const data = {
      settings,
      categories:        categories.map(rowToCategory),
      products:          products.map(rowToProduct),
      promos:            promos.map(rowToPromo),
      faqs:              faqs.map(rowToFaq),
      legalPages:        legalPages.map(rowToLegalPage),
      reviews:           reviews.map(rowToReview),
      googleReviewPopup: rowToPopup(popupRow),
      translations:      translations.map(rowToTranslation),
      // ⚠️ SÉCURITÉ : password intentionnellement vide — jamais de hash côté client
      adminCredentials:  credRow ? { username: credRow.username, password: "" } : null,
    };

    setCache(data);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[woodiz/api/store] GET error:", err);
    return NextResponse.json({ ok: false, data: null });
  }
}

// ─── POST ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const {
      settings, categories, products, promos, faqs,
      legalPages, reviews, googleReviewPopup, translations, adminCredentials,
    } = await req.json();

    // ⚠️ saveCategories DOIT tourner avant saveProducts (contrainte FK category_id)
    await saveCategories(categories ?? []);
    const savedProducts = await saveProducts(products ?? []);

    // Le reste peut tourner en parallèle (pas de dépendances croisées)
    await Promise.all([
      saveSettings(settings),
      saveSliderSlides(settings?.sliderSlides ?? []),
      savePromos(promos ?? []),
      saveFaqs(faqs ?? []),
      saveLegalPages(legalPages ?? []),
      saveReviews(reviews ?? []),
      savePopup(googleReviewPopup),
      saveTranslations(translations ?? []),
      saveAdminCredentials(adminCredentials),
    ]);

    // Invalider le cache après toute sauvegarde
    invalidateCache();

    return NextResponse.json({ ok: true, savedProducts });

  } catch (err) {
    console.error("[woodiz/api/store] POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// ─── Helpers de sauvegarde ──────────────────────────────────────────────────

async function saveSettings(s: any) {
  if (!s) return;
  await execute(
    `INSERT INTO settings (id,site_name,tagline,address,phone,email,
       primary_color,accent_color,hero_title,hero_subtitle,meta_title,
       meta_description,meta_keywords,instagram_url,google_url,open_hours,
       footer_text,favicon_emoji,favicon_url,logo_text,google_rating,
       google_review_count,product_display_mode,notification_bar,app_banner,
       footer_config,features,order_buttons,cookie_banner,closing_alert,
       store_schedule,slider_images)
     VALUES(1,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       site_name=VALUES(site_name),tagline=VALUES(tagline),address=VALUES(address),
       phone=VALUES(phone),email=VALUES(email),primary_color=VALUES(primary_color),
       accent_color=VALUES(accent_color),hero_title=VALUES(hero_title),
       hero_subtitle=VALUES(hero_subtitle),meta_title=VALUES(meta_title),
       meta_description=VALUES(meta_description),meta_keywords=VALUES(meta_keywords),
       instagram_url=VALUES(instagram_url),google_url=VALUES(google_url),
       open_hours=VALUES(open_hours),footer_text=VALUES(footer_text),
       favicon_emoji=VALUES(favicon_emoji),favicon_url=VALUES(favicon_url),
       logo_text=VALUES(logo_text),google_rating=VALUES(google_rating),
       google_review_count=VALUES(google_review_count),
       product_display_mode=VALUES(product_display_mode),
       notification_bar=VALUES(notification_bar),app_banner=VALUES(app_banner),
       footer_config=VALUES(footer_config),features=VALUES(features),
       order_buttons=VALUES(order_buttons),cookie_banner=VALUES(cookie_banner),
       closing_alert=VALUES(closing_alert),store_schedule=VALUES(store_schedule),
       slider_images=VALUES(slider_images)`,
    [
      s.siteName,s.tagline,s.address,s.phone,s.email,
      s.primaryColor,s.accentColor,s.heroTitle,s.heroSubtitle,
      s.metaTitle,s.metaDescription,s.metaKeywords,
      s.instagramUrl,s.googleUrl,s.openHours,s.footerText,
      s.faviconEmoji,s.faviconUrl??"",s.logoText,
      s.googleRating,s.googleReviewCount,s.productDisplayMode??"grid",
      JSON.stringify(s.notificationBar??null),JSON.stringify(s.appBanner??null),
      JSON.stringify(s.footerConfig??null),JSON.stringify(s.features??[]),
      JSON.stringify(s.orderButtons??[]),JSON.stringify(s.cookieBanner??null),
      JSON.stringify(s.closingAlert??null),JSON.stringify(s.storeSchedule??null),
      JSON.stringify(s.sliderImages??[]),
    ]
  );
}

async function saveSliderSlides(slides: any[]) {
  await execute("DELETE FROM slider_slides");
  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    await execute(
      `INSERT INTO slider_slides
         (position,type,value,use_custom_text,custom_title,
          custom_subtitle,text_size_title,text_size_subtitle,translations)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [
        i,s.type,s.value,s.useCustomText?1:0,
        s.customTitle??null,s.customSubtitle??null,
        s.textSizeTitle??"xl",s.textSizeSubtitle??"md",
        s.translations?JSON.stringify(s.translations):null,
      ]
    );
  }
}

async function saveCategories(cats: any[]) {
  const ids = cats.map((c)=>c.id);
  if (ids.length) {
    await execute(`DELETE FROM categories WHERE id NOT IN (${ids.map(()=>"?").join(",")})`,ids);
  } else { await execute("DELETE FROM categories"); }
  for (const c of cats) {
    await execute(
      `INSERT INTO categories(id,name,icon,icon_url,position,active,description,translations)
       VALUES(?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),icon=VALUES(icon),icon_url=VALUES(icon_url),
         position=VALUES(position),active=VALUES(active),
         description=VALUES(description),translations=VALUES(translations)`,
      [c.id,c.name,c.icon,c.iconUrl??null,c.order??0,c.active?1:0,
       c.description??null,c.translations?JSON.stringify(c.translations):null]
    );
  }
}

async function saveProducts(prods: any[]): Promise<any[]> {
  const ids = prods.map((p) => p.id).filter((id) => id && id < 2_000_000_000);
  if (ids.length) {
    await execute(`DELETE FROM products WHERE id NOT IN (${ids.map(()=>"?").join(",")})`,ids);
  } else { await execute("DELETE FROM products"); }
  const saved: any[] = [];
  for (const p of prods) {
    // Si l'id est un timestamp (Date.now() > 2000000000), c'est un nouveau produit
    const isNew = !p.id || p.id > 2000000000;
    const result = await execute(
      `INSERT INTO products
         (id,name,category_id,description,price,badge,badge_color,allergens,
          allergen_translations,img,in_stock,position,featured,translations,
          seo_title,seo_description)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),category_id=VALUES(category_id),
         description=VALUES(description),price=VALUES(price),
         badge=VALUES(badge),badge_color=VALUES(badge_color),
         allergens=VALUES(allergens),allergen_translations=VALUES(allergen_translations),
         img=VALUES(img),in_stock=VALUES(in_stock),position=VALUES(position),
         featured=VALUES(featured),translations=VALUES(translations),
         seo_title=VALUES(seo_title),seo_description=VALUES(seo_description)`,
      [
        isNew ? null : p.id, p.name, p.category, p.desc??"",
        p.price, p.badge??"", p.badgeColor??"",
        JSON.stringify(p.allergens??[]),
        p.allergenTranslations?JSON.stringify(p.allergenTranslations):null,
        p.img??"", p.inStock?1:0, p.order??0, p.featured?1:0,
        p.translations?JSON.stringify(p.translations):null,
        p.seoTitle??null, p.seoDescription??null,
      ]
    );
    const realId = isNew ? result.insertId : p.id;
    // Si image avec ancien key (timestamp), migrer vers le vrai id
    let img = p.img ?? "";
    if (isNew && img.startsWith("__idb:product:") && realId) {
      const oldKey = img.replace("__idb:", "");
      const newKey = `product:${realId}`;
      // Copier l'image vers la bonne clé dans MySQL
      await execute(
        `INSERT INTO images (img_key, data_url, mime_type, byte_size)
         SELECT ?, data_url, mime_type, byte_size FROM images WHERE img_key = ?
         ON DUPLICATE KEY UPDATE data_url=VALUES(data_url)`,
        [newKey, oldKey]
      ).catch(()=>{});
      img = `__idb:${newKey}`;
      await execute("UPDATE products SET img=? WHERE id=?", [img, realId]);
    }
    saved.push({ ...p, id: realId, img });
  }
  return saved;
}

async function savePromos(promos: any[]) {
  const ids = promos.map((p)=>p.id).filter(Boolean);
  if (ids.length) {
    await execute(`DELETE FROM promos WHERE id NOT IN (${ids.map(()=>"?").join(",")})`,ids);
  } else { await execute("DELETE FROM promos"); }
  for (const p of promos) {
    await execute(
      `INSERT INTO promos
         (id,title,price,badge,bg_color,text_color,active,image,bg_image,
          type,link,cta_text,position,translations)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title),price=VALUES(price),badge=VALUES(badge),
         bg_color=VALUES(bg_color),text_color=VALUES(text_color),
         active=VALUES(active),image=VALUES(image),bg_image=VALUES(bg_image),
         type=VALUES(type),link=VALUES(link),cta_text=VALUES(cta_text),
         position=VALUES(position),translations=VALUES(translations)`,
      [
        p.id||null,p.title,p.price??"",p.badge??"",
        p.bg,p.textColor,p.active?1:0,p.image??"",p.bgImage??null,
        p.type??"card",p.link??null,p.ctaText??null,p.order??0,
        p.translations?JSON.stringify(p.translations):null,
      ]
    );
  }
}

async function saveFaqs(faqs: any[]) {
  const ids = faqs.map((f)=>f.id).filter(Boolean);
  if (ids.length) {
    await execute(`DELETE FROM faqs WHERE id NOT IN (${ids.map(()=>"?").join(",")})`,ids);
  } else { await execute("DELETE FROM faqs"); }
  for (const f of faqs) {
    await execute(
      `INSERT INTO faqs(id,question,answer,position,active,translations)
       VALUES(?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         question=VALUES(question),answer=VALUES(answer),
         position=VALUES(position),active=VALUES(active),
         translations=VALUES(translations)`,
      [f.id||null,f.question,f.answer,f.order??0,f.active?1:0,
       f.translations?JSON.stringify(f.translations):null]
    );
  }
}

async function saveLegalPages(pages: any[]) {
  for (const p of pages) {
    await execute(
      `INSERT INTO legal_pages(id,title,content,enabled) VALUES(?,?,?,?)
       ON DUPLICATE KEY UPDATE
         title=VALUES(title),content=VALUES(content),enabled=VALUES(enabled)`,
      [p.id,p.title,p.content,p.enabled?1:0]
    );
  }
}

async function saveReviews(reviews: any[]) {
  const ids = reviews.map((r)=>r.id).filter(Boolean);
  if (ids.length) {
    await execute(`DELETE FROM reviews WHERE id NOT IN (${ids.map(()=>"?").join(",")})`,ids);
  } else { await execute("DELETE FROM reviews"); }
  for (const r of reviews) {
    await execute(
      `INSERT INTO reviews(id,name,rating,review_text,review_date,avatar,active,position)
       VALUES(?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name),rating=VALUES(rating),review_text=VALUES(review_text),
         review_date=VALUES(review_date),avatar=VALUES(avatar),
         active=VALUES(active),position=VALUES(position)`,
      [r.id||null,r.name,r.rating,r.text,r.date,r.avatar??null,r.active?1:0,r.order??0]
    );
  }
}

async function savePopup(popup: any) {
  if (!popup) return;
  await execute(
    `INSERT INTO google_review_popup
       (id,enabled,google_review_url,title,subtitle,button_text,
        delay_seconds,show_once,bg_color,accent_color)
     VALUES(1,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE
       enabled=VALUES(enabled),google_review_url=VALUES(google_review_url),
       title=VALUES(title),subtitle=VALUES(subtitle),button_text=VALUES(button_text),
       delay_seconds=VALUES(delay_seconds),show_once=VALUES(show_once),
       bg_color=VALUES(bg_color),accent_color=VALUES(accent_color)`,
    [
      popup.enabled?1:0,popup.googleReviewUrl,
      popup.title,popup.subtitle??"",popup.buttonText,
      popup.delaySeconds,popup.showOnce?1:0,
      popup.bgColor,popup.accentColor,
    ]
  );
}

async function saveTranslations(translations: any[]) {
  for (const t of translations) {
    await execute(
      `INSERT INTO translations(locale,label,flag,enabled,strings)
       VALUES(?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         label=VALUES(label),flag=VALUES(flag),
         enabled=VALUES(enabled),strings=VALUES(strings)`,
      [t.locale,t.label,t.flag,t.enabled?1:0,JSON.stringify(t.strings??{})]
    );
  }
}

async function saveAdminCredentials(creds: any) {
  if (!creds) return;
  let hash = creds.password as string;
  // Auto-hash si le mot de passe n'est pas encore hashé avec bcrypt
  if (hash && !hash.startsWith("$2")) {
    const bcrypt = await import("bcryptjs");
    hash = await bcrypt.hash(hash, 12);
  }
  await execute(
    `INSERT INTO admin_credentials(id,username,password_hash) VALUES(1,?,?)
     ON DUPLICATE KEY UPDATE username=VALUES(username),password_hash=VALUES(password_hash)`,
    [creds.username, hash]
  );
}
