// ecosystem.config.js — Configuration PM2 pour Hostinger
// PM2 garde le serveur en vie, le redémarre en cas de crash et gère les logs.
//
// ─── DÉPLOIEMENT HOSTINGER ────────────────────────────────────────────────
//   1. Transférer les fichiers (FTP/SSH/Git)
//   2. npm install                         ← installer les dépendances
//   3. npm run build                       ← builder Next.js
//   4. pm2 start ecosystem.config.js --env production
//   5. pm2 save && pm2 startup             ← démarrage automatique au reboot
//
// ─── COMMANDES UTILES ─────────────────────────────────────────────────────
//   pm2 logs woodiz          ← voir les logs
//   pm2 reload woodiz        ← rechargement sans downtime
//   pm2 stop woodiz          ← arrêter
//   pm2 monit                ← monitoring temps réel

module.exports = {
  apps: [
    {
      name:   "woodiz",
      script: "server.js",
      cwd:    __dirname,

      // ─── Environnement production ────────────────────────────────────────
      env_production: {
        NODE_ENV: "production",
        PORT:     3000,
        // ⚠️  Ne PAS mettre les secrets ici — utiliser .env.local ou le panel Hostinger
      },

      // ─── Environnement développement ─────────────────────────────────────
      env_development: {
        NODE_ENV: "development",
        PORT:     3000,
      },

      // ─── Mémoire Node.js ─────────────────────────────────────────────────
      // Next.js + sharp peuvent consommer beaucoup de RAM.
      // Augmenter si Hostinger alloue plus de 512Mo.
      node_args:           "--max-old-space-size=512",
      max_memory_restart:  "480M",   // Redémarrer avant d'atteindre la limite

      // ─── Redémarrage automatique ──────────────────────────────────────────
      watch:        false,           // Ne pas surveiller les fichiers en prod
      restart_delay: 3000,           // 3s entre les redémarrages
      max_restarts:  10,             // Max 10 redémarrages consécutifs
      min_uptime:    "10s",          // Considéré stable après 10s

      // ─── Logs ─────────────────────────────────────────────────────────────
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file:      "logs/woodiz-error.log",
      out_file:        "logs/woodiz-out.log",
      merge_logs:      true,

      // ─── Arrêt gracieux ───────────────────────────────────────────────────
      kill_timeout:    10000,        // 10s pour finir les requêtes en cours
      listen_timeout:  10000,        // 10s pour que le serveur réponde au démarrage

      // ─── Instances (cluster optionnel) ────────────────────────────────────
      // Pour VPS multi-cœur : décommentez les deux lignes ci-dessous
      // instances: "max",
      // exec_mode: "cluster",
    },
  ],
};
