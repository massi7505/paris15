// server.js — Point d'entrée Node.js custom pour Hostinger
// À placer à la racine du projet — lancé par : node server.js
//
// Déploiement Hostinger :
//   1. npm install
//   2. npm run build
//   3. NODE_ENV=production node server.js

'use strict';

// ─── Chargement des variables d'environnement ────────────────────────────────
try {
  require('dotenv').config({ path: '.env.local' });
} catch {
  // dotenv optionnel — variables déjà injectées par Hostinger
}

const { createServer } = require('http');
const { parse }        = require('url');
const next             = require('next');

const dev      = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port     = parseInt(process.env.PORT || '3000', 10);

const app    = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {

  // ─── Init dossier uploads ─────────────────────────────────────────────────
  try {
    const { initUploadsDir } = require('./lib/localImages.js');
    initUploadsDir();
    console.log('✅ Dossier public/uploads/ prêt');
  } catch {
    // ignore — module peut ne pas exister en dev
  }

  // ─── Test de connexion MySQL au démarrage ─────────────────────────────────
  // On importe directement depuis le source TypeScript compilé par Next.js
  // plutôt que d'utiliser un chemin de chunk fragile.
  try {
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host:     process.env.MYSQL_HOST     ?? 'localhost',
      port:     Number(process.env.MYSQL_PORT ?? 3306),
      user:     process.env.MYSQL_USER     ?? 'woodiz',
      password: process.env.MYSQL_PASSWORD ?? '',
      database: process.env.MYSQL_DATABASE ?? 'woodiz',
      connectTimeout: 10_000,
    });
    await conn.execute('SELECT 1');
    await conn.end();
    console.log('✅ MySQL : connexion établie');
  } catch (err) {
    console.warn('⚠️  MySQL : connexion échouée —', err.message);
    console.warn('   Vérifiez les variables MYSQL_* dans les variables d\'environnement Hostinger.');
  }

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[woodiz/server] Erreur lors du traitement de la requête:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`✅ WOODIZ prêt sur http://${hostname}:${port}`);
    console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Node.js       : ${process.version}`);
    if (dev) console.log('   Mode DEV — hot-reload actif');
  });

  // ─── Arrêt gracieux (SIGTERM / SIGINT) ───────────────────────────────────
  function shutdown(signal) {
    console.log(`\n[woodiz/server] Signal ${signal} reçu — arrêt gracieux…`);
    server.close((err) => {
      if (err) {
        console.error('[woodiz/server] Erreur lors de la fermeture:', err);
        process.exit(1);
      }
      console.log('[woodiz/server] Serveur fermé proprement.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[woodiz/server] Délai dépassé — arrêt forcé.');
      process.exit(1);
    }, 10_000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('[woodiz/server] Exception non gérée:', err);
    shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[woodiz/server] Promesse rejetée non gérée:', reason);
  });

}).catch((err) => {
  console.error('[woodiz/server] Échec du démarrage:', err);
  process.exit(1);
});
