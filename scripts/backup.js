// scripts/backup.js — Sauvegarde MySQL automatique + upload Backblaze B2
// Usage: node scripts/backup.js
// Cron Hostinger: 0 3 * * * cd /home/u123456789/domains/woodiz.fr/public_html && node scripts/backup.js

'use strict';

require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');
const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// ─── Validation des variables d'environnement ────────────────────────────────

const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE',
                  'B2_ENDPOINT', 'B2_KEY_ID', 'B2_APP_KEY', 'B2_BUCKET_NAME'];
const missing = required.filter(k => !process.env[k]);

if (missing.length > 0) {
  console.error(`❌ Variables manquantes: ${missing.join(', ')}`);
  console.error('   Vérifiez votre fichier .env.local ou les variables Hostinger.');
  process.exit(1);
}

// ─── Configuration ────────────────────────────────────────────────────────────

const RETENTION_DAYS = 30;
const BACKUP_PREFIX  = 'backups/mysql/';

const s3 = new S3Client({
  endpoint:        process.env.B2_ENDPOINT,
  region:          'auto',
  credentials: {
    accessKeyId:     process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
  forcePathStyle: true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(emoji, msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${emoji}  ${msg}`);
}

// ─── Étape 1 : Dump MySQL ─────────────────────────────────────────────────────

async function dumpMySQL(filepath) {
  log('📦', 'Démarrage du dump MySQL…');

  const args = [
    `mysqldump`,
    `-h ${process.env.MYSQL_HOST}`,
    `-P ${process.env.MYSQL_PORT || 3306}`,
    `-u ${process.env.MYSQL_USER}`,
    `-p${process.env.MYSQL_PASSWORD}`,
    `--single-transaction`,
    `--routines`,
    `--triggers`,
    `--add-drop-table`,
    `--complete-insert`,
    process.env.MYSQL_DATABASE,
    `> ${filepath}`,
  ].join(' ');

  execSync(args, { stdio: 'inherit' });
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  log('✅', `Dump terminé — ${size} KB`);
}

// ─── Étape 2 : Compression Gzip ───────────────────────────────────────────────

function compressFile(filepath) {
  log('🗜️ ', 'Compression gzip…');
  execSync(`gzip -f ${filepath}`, { stdio: 'inherit' });
  const gzPath = `${filepath}.gz`;
  const size = (fs.statSync(gzPath).size / 1024).toFixed(1);
  log('✅', `Compression terminée — ${size} KB`);
  return gzPath;
}

// ─── Étape 3 : Upload vers Backblaze B2 ──────────────────────────────────────

async function uploadToB2(gzPath, key) {
  log('☁️ ', `Upload vers B2 : ${key}`);
  await s3.send(new PutObjectCommand({
    Bucket:      process.env.B2_BUCKET_NAME,
    Key:         key,
    Body:        fs.readFileSync(gzPath),
    ContentType: 'application/gzip',
    Metadata: {
      'backup-date': new Date().toISOString(),
      'database':    process.env.MYSQL_DATABASE,
    },
  }));
  log('✅', 'Upload B2 réussi');
}

// ─── Étape 4 : Nettoyage des anciennes sauvegardes (+30 jours) ───────────────

async function cleanOldBackups() {
  log('🗑️ ', `Nettoyage des sauvegardes de plus de ${RETENTION_DAYS} jours…`);

  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const list = await s3.send(new ListObjectsV2Command({
    Bucket: process.env.B2_BUCKET_NAME,
    Prefix: BACKUP_PREFIX,
  }));

  const toDelete = (list.Contents || []).filter(obj => obj.LastModified < cutoff);

  if (toDelete.length === 0) {
    log('✅', 'Aucune ancienne sauvegarde à supprimer');
    return;
  }

  for (const obj of toDelete) {
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key:    obj.Key,
    }));
    log('🗑️ ', `Supprimé : ${obj.Key}`);
  }

  log('✅', `${toDelete.length} ancienne(s) sauvegarde(s) supprimée(s)`);
}

// ─── Étape 5 : Nettoyage du fichier local temporaire ─────────────────────────

function cleanupLocal(gzPath) {
  if (fs.existsSync(gzPath)) {
    fs.unlinkSync(gzPath);
    log('🧹', 'Fichier temporaire local supprimé');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function backup() {
  const date     = new Date().toISOString().split('T')[0]; // ex: 2026-03-10
  const filename = `woodiz-backup-${date}.sql`;
  const filepath = path.join('/tmp', filename);
  const b2Key    = `${BACKUP_PREFIX}${filename}.gz`;
  let   gzPath   = null;

  console.log('');
  log('🍕', '=== WOODIZ — Sauvegarde automatique ===');
  console.log('');

  try {
    await dumpMySQL(filepath);
    gzPath = compressFile(filepath);
    await uploadToB2(gzPath, b2Key);
    await cleanOldBackups();
    console.log('');
    log('🎉', `Sauvegarde ${filename}.gz terminée avec succès !`);
    console.log('');
  } catch (err) {
    console.error('');
    console.error('❌ ERREUR lors de la sauvegarde :', err.message || err);
    console.error('');
    process.exit(1);
  } finally {
    if (gzPath) cleanupLocal(gzPath);
  }
}

backup();
