// server.js — Point d'entrée Node.js custom pour Hostinger
// À placer à la racine du projet — lancé par : node server.js
//
// Déploiement Hostinger :
//   1. npm install
//   2. npm run build
//   3. pm2 start ecosystem.config.js --env production
//      ou : NODE_ENV=production node server.js

'use strict';

// ─── Chargement des variables d'environnement ────────────────────────────────
// Sur Hostinger, les variables peuvent être définies via le panel OU via .env.local
// On tente les deux (le panel prime via process.env déjà défini)
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

  // ─── Test de connexion MySQL au démarrage ─────────────────────────────────
  // Détecte les erreurs de configuration BDD avant d'accepter du trafic.
  try {
    // Init dossier uploads
  try {
    const { initUploadsDir } = require('./lib/localImages.js');
    initUploadsDir();
    console.log('✅ Dossier public/uploads/ prêt');
  } catch { /* ignore en dev */ }

  // Test MySQL
  const { testConnection } = require('./.next/server/chunks/lib/mysql.js');
    const ok = await testConnection();
    if (ok) {
      console.log('✅ MySQL : connexion établie');
    } else {
      console.warn('⚠️  MySQL : connexion échouée — vérifiez les variables MYSQL_* dans .env.local');
    }
  } catch {
    // En dev ou si le chunk n'existe pas encore, on ignore silencieusement
    if (!dev) {
      console.warn('⚠️  MySQL : impossible de tester la connexion au démarrage');
    }
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
  // Hostinger envoie SIGTERM lors des redémarrages / déploiements.
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
