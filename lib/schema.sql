-- ============================================================
-- WOODIZ PARIS — MySQL Schema complet
-- Version : 1.0.0
-- Tables : settings, products, categories, promos,
--          slider_slides, faqs, legal_pages, reviews,
--          translations, google_review_popup,
--          admin_credentials, images
-- ============================================================

CREATE DATABASE IF NOT EXISTS woodiz CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE woodiz;

-- ─── SETTINGS ─────────────────────────────────────────────
-- Une seule ligne (id = 1). Champs complexes stockés en JSON.
CREATE TABLE IF NOT EXISTS settings (
  id                  INT UNSIGNED     NOT NULL DEFAULT 1 PRIMARY KEY,
  site_name           VARCHAR(120)     NOT NULL DEFAULT 'WOODIZ',
  tagline             VARCHAR(255)     NOT NULL DEFAULT '',
  address             VARCHAR(255)     NOT NULL DEFAULT '',
  phone               VARCHAR(60)      NOT NULL DEFAULT '',
  email               VARCHAR(120)     NOT NULL DEFAULT '',
  primary_color       VARCHAR(20)      NOT NULL DEFAULT '#F59E0B',
  accent_color        VARCHAR(20)      NOT NULL DEFAULT '#2B1408',
  hero_title          TEXT,
  hero_subtitle       TEXT,
  meta_title          TEXT,
  meta_description    TEXT,
  meta_keywords       TEXT,
  instagram_url       VARCHAR(255)     NOT NULL DEFAULT '',
  google_url          VARCHAR(255)     NOT NULL DEFAULT '',
  open_hours          VARCHAR(255)     NOT NULL DEFAULT '',
  footer_text         TEXT,
  favicon_emoji       VARCHAR(10)      NOT NULL DEFAULT '🍕',
  favicon_url         TEXT,
  logo_text           VARCHAR(10)      NOT NULL DEFAULT 'W',
  google_rating       VARCHAR(10)      NOT NULL DEFAULT '4.4',
  google_review_count VARCHAR(20)      NOT NULL DEFAULT '0',
  product_display_mode ENUM('grid','vertical') NOT NULL DEFAULT 'grid',
  -- Champs JSON pour les objets imbriqués
  notification_bar    JSON,   -- { enabled, text, bgColor, textColor, link, closeable, style }
  app_banner          JSON,   -- { enabled, icon, iconBg, title, ... }
  footer_config       JSON,   -- { showCategories, showSocial, ... }
  features            JSON,   -- FeatureItem[]
  order_buttons       JSON,   -- OrderButton[]
  cookie_banner       JSON,   -- { enabled, title, description, acceptText, ... }
  closing_alert       JSON,   -- { enabled, minutesBefore, text, bgColor, textColor }
  store_schedule      JSON,   -- { lunchEnabled, lunchOpen, lunchClose, dinnerEnabled, ... }
  slider_images       JSON,   -- string[] (legacy)
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT settings_single_row CHECK (id = 1)
);

-- ─── SLIDER SLIDES ────────────────────────────────────────
-- Chaque slide du hero slider
CREATE TABLE IF NOT EXISTS slider_slides (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  position            SMALLINT         NOT NULL DEFAULT 0,            -- ordre d'affichage
  type                ENUM('image','color') NOT NULL DEFAULT 'image',
  value               TEXT             NOT NULL,                      -- URL ou code couleur hex
  use_custom_text     TINYINT(1)       NOT NULL DEFAULT 0,
  custom_title        VARCHAR(255),
  custom_subtitle     VARCHAR(255),
  text_size_title     ENUM('sm','md','lg','xl','2xl') NOT NULL DEFAULT 'xl',
  text_size_subtitle  ENUM('xs','sm','md','lg')       NOT NULL DEFAULT 'md',
  -- Traductions par locale { fr: {title, subtitle}, en: {...}, ... }
  translations        JSON,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position)
);

-- ─── CATEGORIES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id                  VARCHAR(60)      NOT NULL PRIMARY KEY,          -- slug ex: "tomate"
  name                VARCHAR(120)     NOT NULL,
  icon                VARCHAR(10)      NOT NULL DEFAULT '',           -- emoji
  icon_url            TEXT,
  position            SMALLINT         NOT NULL DEFAULT 0,
  active              TINYINT(1)       NOT NULL DEFAULT 1,
  description         TEXT,
  -- { en: { name, description }, it: {...}, es: {...} }
  translations        JSON,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position (position),
  INDEX idx_active    (active)
);

-- ─── PRODUCTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(120)     NOT NULL,
  category_id         VARCHAR(60)      NOT NULL,                      -- FK → categories.id
  description         TEXT,
  price               DECIMAL(8,2)     NOT NULL DEFAULT 0.00,
  badge               VARCHAR(60)      NOT NULL DEFAULT '',
  badge_color         VARCHAR(20)      NOT NULL DEFAULT '',           -- code couleur hex
  allergens           JSON,                                           -- string[]
  img                 TEXT,                                           -- URL ou __idb:key
  in_stock            TINYINT(1)       NOT NULL DEFAULT 1,
  position            SMALLINT         NOT NULL DEFAULT 0,
  featured            TINYINT(1)       NOT NULL DEFAULT 0,
  -- Allergènes traduits { en: [...], it: [...] }
  allergen_translations JSON,
  -- Nom + description par locale { en: { name, desc }, it: {...} }
  translations        JSON,
  seo_title           VARCHAR(255),
  seo_description     TEXT,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category  (category_id),
  INDEX idx_position  (position),
  INDEX idx_in_stock  (in_stock),
  INDEX idx_featured  (featured),
  CONSTRAINT fk_product_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ─── COULEURS PRODUITS (badge colors) ─────────────────────
-- Table dédiée pour gérer la palette des couleurs de badges produits
CREATE TABLE IF NOT EXISTS product_colors (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  label               VARCHAR(60)      NOT NULL,                      -- ex : "Bestseller"
  hex_value           VARCHAR(20)      NOT NULL,                      -- ex : "#F59E0B"
  text_color          VARCHAR(20)      NOT NULL DEFAULT '#FFFFFF',    -- couleur texte lisible
  is_default          TINYINT(1)       NOT NULL DEFAULT 0,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_hex (hex_value)
);

-- ─── PROMOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promos (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title               TEXT             NOT NULL,
  price               VARCHAR(30)      NOT NULL DEFAULT '',
  badge               VARCHAR(120)     NOT NULL DEFAULT '',
  bg_color            VARCHAR(20)      NOT NULL DEFAULT '#FFFFFF',    -- couleur fond
  text_color          VARCHAR(20)      NOT NULL DEFAULT '#1A1A2E',    -- couleur texte
  active              TINYINT(1)       NOT NULL DEFAULT 1,
  image               TEXT,
  bg_image            TEXT,
  type                ENUM('card','banner') NOT NULL DEFAULT 'card',
  link                VARCHAR(255),
  cta_text            VARCHAR(120),
  position            SMALLINT         NOT NULL DEFAULT 0,
  translations        JSON,                                           -- { en: { title, badge, ctaText }, ... }
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position  (position),
  INDEX idx_active    (active)
);

-- ─── FAQs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faqs (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  question            TEXT             NOT NULL,
  answer              TEXT             NOT NULL,
  position            SMALLINT         NOT NULL DEFAULT 0,
  active              TINYINT(1)       NOT NULL DEFAULT 1,
  translations        JSON,                                           -- { en: { question, answer }, ... }
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position  (position),
  INDEX idx_active    (active)
);

-- ─── LEGAL PAGES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS legal_pages (
  id                  ENUM('mentions','cgu','privacy') NOT NULL PRIMARY KEY,
  title               VARCHAR(255)     NOT NULL,
  content             LONGTEXT         NOT NULL,
  enabled             TINYINT(1)       NOT NULL DEFAULT 1,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── REVIEWS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id                  INT UNSIGNED     NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name                VARCHAR(120)     NOT NULL,
  rating              TINYINT UNSIGNED NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text         TEXT             NOT NULL,
  review_date         DATE             NOT NULL,
  avatar              TEXT,
  active              TINYINT(1)       NOT NULL DEFAULT 1,
  position            SMALLINT         NOT NULL DEFAULT 0,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_position  (position),
  INDEX idx_active    (active)
);

-- ─── TRANSLATIONS ─────────────────────────────────────────
-- Langues disponibles + chaînes de traduction
CREATE TABLE IF NOT EXISTS translations (
  locale              VARCHAR(10)      NOT NULL PRIMARY KEY,          -- ex: "fr", "en"
  label               VARCHAR(60)      NOT NULL,                      -- ex: "Français"
  flag                VARCHAR(10)      NOT NULL DEFAULT '',           -- emoji drapeau
  enabled             TINYINT(1)       NOT NULL DEFAULT 1,
  strings             JSON             NOT NULL,                      -- { "nav.search": "...", ... }
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── GOOGLE REVIEW POPUP ─────────────────────────────────
CREATE TABLE IF NOT EXISTS google_review_popup (
  id                  INT UNSIGNED     NOT NULL DEFAULT 1 PRIMARY KEY,
  enabled             TINYINT(1)       NOT NULL DEFAULT 1,
  google_review_url   VARCHAR(255)     NOT NULL DEFAULT '',
  title               VARCHAR(255)     NOT NULL DEFAULT '',
  subtitle            TEXT,
  button_text         VARCHAR(120)     NOT NULL DEFAULT '',
  delay_seconds       SMALLINT         NOT NULL DEFAULT 30,
  show_once           TINYINT(1)       NOT NULL DEFAULT 1,
  bg_color            VARCHAR(20)      NOT NULL DEFAULT '#FFFFFF',
  accent_color        VARCHAR(20)      NOT NULL DEFAULT '#F59E0B',
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT popup_single_row CHECK (id = 1)
);

-- ─── ADMIN CREDENTIALS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_credentials (
  id                  INT UNSIGNED     NOT NULL DEFAULT 1 PRIMARY KEY,
  username            VARCHAR(60)      NOT NULL DEFAULT 'admin',
  -- IMPORTANT : stocker un hash bcrypt en production !
--   Pour hasher un mot de passe : npm run hash-password VotreMotDePasse
--   Puis faire : UPDATE admin_credentials SET password_hash='<hash>' WHERE id=1;
  password_hash       VARCHAR(255)     NOT NULL DEFAULT 'woodiz2024',
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT creds_single_row CHECK (id = 1)
);

-- ─── IMAGES (server-side) ─────────────────────────────────
-- Stockage clé/valeur pour les images uploadées (base64 ou URL)
-- Remplace l'ancienne API /api/images (Vercel Blob)
CREATE TABLE IF NOT EXISTS images (
  img_key             VARCHAR(200)     NOT NULL PRIMARY KEY,          -- ex: "product:42"
  data_url            LONGTEXT         NOT NULL DEFAULT '',          -- base64 data URL (vide si stocké sur B2/Cellar)
  local_url           VARCHAR(500),                                          -- URL publique locale /uploads/products/42.webp etc.
  mime_type           VARCHAR(60)      NOT NULL DEFAULT 'image/webp',
  byte_size           INT UNSIGNED     NOT NULL DEFAULT 0,
  created_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key_prefix (img_key(50))
);

-- ─── DONNÉES PAR DÉFAUT ───────────────────────────────────

-- Settings par défaut (une ligne)
INSERT IGNORE INTO settings (id, site_name, tagline, address, phone, email,
  primary_color, accent_color, hero_title, hero_subtitle,
  meta_title, meta_description, meta_keywords,
  instagram_url, google_url, open_hours, footer_text,
  favicon_emoji, logo_text, google_rating, google_review_count,
  notification_bar, app_banner, footer_config, features,
  order_buttons, cookie_banner, closing_alert, store_schedule, slider_images)
VALUES (
  1,
  'WOODIZ', 'Pizzeria Artisanale · Paris 15ème',
  '93 Rue Lecourbe, Paris 75015', '+33 1 00 00 00 00', 'contact@woodiz.fr',
  '#F59E0B', '#2B1408',
  'La pizza artisanale\nlivrée chez vous',
  'Pâte maison · Ø 31cm · Ingrédients frais du marché',
  'WOODIZ – Pizzeria Artisanale · Paris 15ème | 93 Rue Lecourbe',
  'WOODIZ, pizzeria artisanale au cœur de Paris 15ème.',
  'pizzeria paris 15, woodiz, pizza artisanale paris',
  'https://www.instagram.com/woodiz_paris15',
  'https://g.page/woodiz-paris',
  'Lun–Ven 11h30–22h30 · Sam–Dim 11h30–23h00',
  'Pizzeria artisanale au cœur de Paris 15ème. Pâte maison, ingrédients frais du marché.',
  '🍕', 'W', '4.4', '127',
  '{"enabled":true,"text":"🍕 Livraison gratuite dès 25€ · Commandez maintenant !","bgColor":"#F59E0B","textColor":"#1A1A2E","link":"","closeable":true,"style":"bar"}',
  '{"enabled":false,"icon":"🛵","iconBg":"#10B981","title":"L appli qui vous facilite la vie !","subtitle":"⭐⭐⭐⭐⭐ 2 517 de notes","buttonText":"Ouvrir","buttonLink":"","buttonBg":"#10B981","buttonTextColor":"#ffffff","bgColor":"#1A1A2E","textColor":"#ffffff","closeable":true}',
  '{"showCategories":true,"showSocial":true,"showContact":true,"showReviews":true,"showLegalLinks":true,"reviewsLabel":"avis Google","googleRating":"4.4","googleReviewCount":"127","customLinks":[]}',
  '[{"icon":"🍕","labelKey":"features.dough","subKey":"features.dough_sub","active":true},{"icon":"🌿","labelKey":"features.fresh","subKey":"features.fresh_sub","active":true},{"icon":"⚡","labelKey":"features.fast","subKey":"features.fast_sub","active":true}]',
  '[{"id":"phone","enabled":true,"label":"Commander par téléphone","url":"tel:+33100000000","bgColor":"#F59E0B","textColor":"#1A1A2E","type":"phone"},{"id":"ubereats","enabled":true,"label":"Commander sur","url":"https://ubereats.com","bgColor":"#06C167","textColor":"#FFFFFF","type":"ubereats"},{"id":"deliveroo","enabled":true,"label":"Commander sur","url":"https://deliveroo.fr","bgColor":"#00CCBC","textColor":"#FFFFFF","type":"deliveroo"}]',
  '{"enabled":true,"title":"Gérer le consentement aux cookies","description":"Pour offrir les meilleures expériences, nous utilisons des technologies telles que les cookies.","acceptText":"Accepter","rejectText":"Refuser","prefsText":"Voir les préférences"}',
  '{"enabled":true,"minutesBefore":60,"text":"⚡ Vite ! Vite ! – nous fermons bientôt ! Commandez dans les {mins} min","bgColor":"#EF4444","textColor":"#FFFFFF"}',
  '{"lunchEnabled":true,"lunchOpen":"11:00","lunchClose":"14:30","dinnerEnabled":true,"dinnerOpen":"18:00","dinnerClose":"02:00","closedDays":[]}',
  '[]'
);

-- Slider slides par défaut
INSERT IGNORE INTO slider_slides (id, position, type, value, text_size_title, text_size_subtitle, use_custom_text) VALUES
(1, 0, 'image', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200', 'xl',  'md', 0),
(2, 1, 'image', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200', 'xl',  'md', 0),
(3, 2, 'color', '#2B1408', '2xl', 'lg', 1),
(4, 3, 'image', 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=1200', 'xl',  'md', 0);

UPDATE slider_slides SET custom_title='Commandez maintenant', custom_subtitle='Livraison rapide · Paris 15ème' WHERE id=3;

-- Catégories par défaut
INSERT IGNORE INTO categories (id, name, icon, position, active, description, translations) VALUES
('tomate',   'Base Tomate', '🍅', 1, 1, 'Pizzas sur base sauce tomate maison',
 '{"en":{"name":"Tomato Base","description":"Pizzas with homemade tomato sauce"},"it":{"name":"Base Pomodoro","description":"Pizze con salsa di pomodoro fatta in casa"},"es":{"name":"Base Tomate","description":"Pizzas con salsa de tomate casera"}}'),
('creme',    'Base Crème',  '🥛', 2, 1, 'Pizzas sur base crème fraîche',
 '{"en":{"name":"Cream Base","description":"Pizzas with fresh cream"},"it":{"name":"Base Crema","description":"Pizze con panna fresca"},"es":{"name":"Base Crema","description":"Pizzas con nata fresca"}}'),
('sig',      'Signatures',  '⭐', 3, 1, 'Créations exclusives du chef',
 '{"en":{"name":"Signatures","description":"Chef''s exclusive creations"},"it":{"name":"Signature","description":"Creazioni esclusive dello chef"},"es":{"name":"Firmas","description":"Creaciones exclusivas del chef"}}'),
('dessert',  'Desserts',    '🍮', 4, 1, 'Nos douceurs sucrées',
 '{"en":{"name":"Desserts","description":"Our sweet treats"},"it":{"name":"Dolci","description":"I nostri dolci"},"es":{"name":"Postres","description":"Nuestros dulces"}}'),
('boissons', 'Boissons',    '🥤', 5, 1, 'Boissons froides & chaudes',
 '{"en":{"name":"Drinks","description":"Cold & hot beverages"},"it":{"name":"Bevande","description":"Bevande fredde e calde"},"es":{"name":"Bebidas","description":"Bebidas frías y calientes"}}');

-- Palette de couleurs pour les badges produits (A → Z)
INSERT IGNORE INTO product_colors (label, hex_value, text_color, is_default) VALUES
('Bestseller',   '#F59E0B', '#FFFFFF', 1),
('Classique',    '#10B981', '#FFFFFF', 0),
('Coup de cœur', '#EF4444', '#FFFFFF', 0),
('Nouveau',      '#0EA5E9', '#FFFFFF', 0),
('Pimenté 🌶️',  '#DC2626', '#FFFFFF', 0),
('Veggie 🌱',    '#16A34A', '#FFFFFF', 0),
('Signature',    '#2B1408', '#FFFFFF', 0),
('Chef''s Choice','#8B5CF6', '#FFFFFF', 0),
('Bio',          '#4ADE80', '#1A1A2E', 0),
('Épicé',        '#F97316', '#FFFFFF', 0),
('Exotique',     '#EC4899', '#FFFFFF', 0),
('Fromager',     '#FDE68A', '#1A1A2E', 0),
('Gluten free',  '#A7F3D0', '#1A1A2E', 0),
('Local',        '#6EE7B7', '#1A1A2E', 0),
('Maison',       '#FCD34D', '#1A1A2E', 0),
('Premium',      '#7C3AED', '#FFFFFF', 0),
('Promo',        '#F43F5E', '#FFFFFF', 0),
('Saison',       '#84CC16', '#1A1A2E', 0),
('Tradition',    '#D97706', '#FFFFFF', 0),
('Vegan',        '#22C55E', '#FFFFFF', 0);

-- Produits par défaut (subset représentatif)
INSERT IGNORE INTO products
  (id, name, category_id, description, price, badge, badge_color, allergens, img, in_stock, position, featured, translations)
VALUES
(1,'Margherita','tomate','Sauce tomate, mozza, olives noires',10.90,'Bestseller','#F59E0B',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',1,1,1,
 '{"en":{"name":"Margherita","desc":"Tomato sauce, mozzarella, black olives"},"it":{"name":"Margherita","desc":"Salsa di pomodoro, mozzarella, olive nere"},"es":{"name":"Margarita","desc":"Salsa de tomate, mozzarella, aceitunas negras"}}'),
(2,'Regina','tomate','Sauce tomate, mozza, jambon et champignons frais',11.90,'Classique','#10B981',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',1,2,0,
 '{"en":{"name":"Regina","desc":"Tomato sauce, mozzarella, ham and fresh mushrooms"},"it":{"name":"Regina","desc":"Salsa di pomodoro, mozzarella, prosciutto e funghi"},"es":{"name":"Regina","desc":"Salsa de tomate, mozzarella, jamón y champiñones"}}'),
(3,'Napolitaine','tomate','Sauce tomate, mozza, stracciatella, olives noires, anchois et câpres',12.90,'','',
 '["🌾 Gluten","🥛 Lactose","🐟 Poisson"]','https://images.unsplash.com/photo-1571066811602-716837d681de?w=600',1,3,0,NULL),
(4,'Pécheur','tomate','Sauce tomate, mozza, thon, olives noires, oignons rouges, basilic frais',12.90,'','',
 '["🌾 Gluten","🥛 Lactose","🐟 Poisson"]','https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600',1,4,0,NULL),
(5,'Calzone','tomate','Sauce tomate, mozza, oeuf, emmental et 1 viande au choix',11.90,'','',
 '["🌾 Gluten","🥛 Lactose","🥚 Oeufs"]','https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=600',1,5,0,NULL),
(6,'5 Fromages','tomate','Sauce tomate, mozza, bleu, chèvre, emmental et raclette',12.90,'','',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',0,6,0,NULL),
(7,'Diablo','tomate','Sauce tomate, mozza, nduja, poivrons grillés, piment frais, basilic',12.90,'🌶️ Pimenté','#DC2626',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600',1,7,0,NULL),
(8,'Végétarienne','tomate','Sauce tomate, mozza, poivrons multicolores, courgettes, aubergines, herbes de Provence',11.90,'🌱 Veggie','#16A34A',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1520201163981-8cc45f3cbea1?w=600',1,8,0,NULL),
(9,'Tartiflette','creme','Crème fraîche, mozza, lardons, pomme de terre, raclette et oignons rouges',12.90,'Coup de coeur','#EF4444',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1515516969-d4008cc6241a?w=600',1,1,0,NULL),
(10,'Norvégienne','creme','Crème fraîche, mozza, saumon fumé, tomate séchée, roquette, citron',14.90,'Nouveau','#0EA5E9',
 '["🌾 Gluten","🥛 Lactose","🐟 Poisson"]','https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',1,2,0,NULL),
(15,'Mountain','sig','Moutarde au miel, mozza, poulet mariné, comté, beaufort, oignons rouges',13.90,'Signature','#2B1408',
 '["🌾 Gluten","🥛 Lactose","🌱 Moutarde"]','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',1,1,0,NULL),
(16,'Truffeta','sig','Crème de truffe, mozza, champignons frais, parmesan, roquette et huile de truffe',15.90,'Signature','#2B1408',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600',1,2,0,NULL),
(17,'Burratissima','sig','Sauce tomate, burrata, tomates cerises, roquette, jambon cru, huile extra vierge',15.90,'Chef''s Choice','#8B5CF6',
 '["🌾 Gluten","🥛 Lactose"]','https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',1,3,1,NULL),
(18,'Nutella','dessert','Pâte à pizza sucrée, Nutella, noisettes concassées, sucre glace',7.90,'','',
 '["🌾 Gluten","🥛 Lactose","🥜 Fruits à coque"]','https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600',1,1,0,NULL),
(19,'Coca-Cola','boissons','Canette 33cl',2.50,'','','[]',
 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600',1,1,0,NULL),
(20,'Eau Pétillante','boissons','Bouteille 50cl',1.50,'','','[]',
 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=600',1,2,0,NULL),
(21,'Jus d''Orange','boissons','25cl – Pressé frais',3.00,'','','[]',
 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600',0,3,0,NULL);

-- Promos par défaut
INSERT IGNORE INTO promos (id, title, price, badge, bg_color, text_color, active, image, type, position) VALUES
(1,'1 Pizza Sénior + 1 Boisson Offerte','10,90€','Menu Midi · À Emporter','#FFF9C4','#1A1A2E',1,
 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200','card',1),
(2,'1 Pizza Signature + 1 Boisson Offerte','11,90€','Menu Midi · Signature','#1E1B3A','#ffffff',1,
 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=200','card',2),
(3,'2 Pizzas Normales à Emporter','19,90€','Offre À Emporter','#FF6B35','#ffffff',1,
 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=200','card',3),
(4,'Frais de livraison OFFERTS avec Amazon Prime*','','Profitez de Deliveroo Plus Argent offert !','#5B2D8E','#ffffff',1,'','banner',4);

-- FAQs par défaut
INSERT IGNORE INTO faqs (id, question, answer, position, active) VALUES
(1,'Livrez-vous à domicile ?','Oui, nous livrons dans un rayon de 5km autour de notre pizzeria. La livraison est gratuite dès 25€ de commande.',1,1),
(2,'Quels sont vos horaires d''ouverture ?','Nous sommes ouverts du Lundi au Vendredi de 11h30 à 22h30, et le Samedi-Dimanche de 11h30 à 23h00.',2,1),
(3,'Proposez-vous des pizzas sans gluten ?','Nous n''avons pas encore de pâte sans gluten, mais nous travaillons à en proposer très prochainement.',3,1),
(4,'Puis-je personnaliser ma pizza ?','Absolument ! Contactez-nous directement par téléphone pour toute demande de personnalisation.',4,1),
(5,'Quelle est la taille de vos pizzas ?','Toutes nos pizzas font 31cm de diamètre, cuites au four à bois pour une pâte croustillante et savoureuse.',5,1);

-- Pages légales par défaut
INSERT IGNORE INTO legal_pages (id, title, content, enabled) VALUES
('mentions','Mentions légales','## Mentions légales\n\n**Éditeur du site**\n\nWOODIZ – Pizzeria Artisanale\n93 Rue Lecourbe, Paris 75015\nTéléphone : +33 1 00 00 00 00\nEmail : contact@woodiz.fr\n\n**Hébergement**\n\nVercel Inc.\n340 Pine Street, Suite 401, San Francisco, California 94104, USA',1),
('cgu','Conditions Générales d''Utilisation','## Conditions Générales d''Utilisation\n\n**Article 1 – Objet**\n\nLes présentes CGU régissent l''utilisation du site woodiz.fr exploité par WOODIZ Pizzeria.\n\n**Article 2 – Accès au site**\n\nLe site est accessible 24h/24 et 7j/7, sauf interruptions techniques.',1),
('privacy','Politique de confidentialité','## Politique de confidentialité\n\n**Collecte des données**\n\nWOODIZ collecte uniquement les données nécessaires au fonctionnement du site. Aucune donnée personnelle n''est collectée sans votre consentement.\n\n**Vos droits**\n\nConformément au RGPD, vous disposez d''un droit d''accès, de rectification et de suppression de vos données. Contactez-nous à contact@woodiz.fr.',1);

-- Avis clients par défaut
INSERT IGNORE INTO reviews (id, name, rating, review_text, review_date, active, position) VALUES
(1,'Sophie M.',5,'Pizza incroyable ! La pâte est parfaite, les ingrédients super frais. Je recommande vivement la Burratissima !','2025-01-15',1,1),
(2,'Thomas R.',5,'Le meilleur rapport qualité/prix du 15ème. Livraison rapide et pizza encore chaude à l''arrivée. Merci !','2025-01-20',1,2),
(3,'Marie L.',4,'Très bonne pizzeria artisanale. La Truffeta est exceptionnelle. On reviendra sans hésiter.','2025-02-01',1,3),
(4,'Lucas B.',5,'Woodiz c''est notre pizzeria préférée ! Toujours délicieux, service au top. La Diablo est parfaite pour les amateurs de piment.','2025-02-10',1,4),
(5,'Clara D.',5,'Pâte fine et croustillante comme en Italie. Les ingrédients sont vraiment frais. Livraison en moins de 30 min !','2025-02-18',1,5),
(6,'Antoine P.',4,'Excellente pizza artisanale. Le four à bois fait vraiment la différence. Je conseille la Signature Mountain.','2025-03-01',1,6);

-- Popup avis Google par défaut
INSERT IGNORE INTO google_review_popup (id, enabled, google_review_url, title, subtitle, button_text, delay_seconds, show_once, bg_color, accent_color)
VALUES (1, 1, 'https://g.page/r/woodiz-paris/review',
  'Vous avez apprécié votre pizza ?',
  'Laissez-nous un avis Google, ça nous aide beaucoup !',
  'Laisser un avis ⭐', 30, 1, '#FFFFFF', '#F59E0B');

-- Identifiants admin par défaut
INSERT IGNORE INTO admin_credentials (id, username, password_hash) VALUES (1, 'admin', 'woodiz2024');

-- Translations par défaut (FR uniquement — les autres sont dans lib/store.ts)
INSERT IGNORE INTO translations (locale, label, flag, enabled, strings) VALUES
('fr','Français','🇫🇷',1,'{}'),
('en','English','🇬🇧',1,'{}'),
('it','Italiano','🇮🇹',1,'{}'),
('es','Español','🇪🇸',1,'{}');
