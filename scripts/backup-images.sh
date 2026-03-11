#!/bin/bash
# backup-images.sh — Sauvegarde des images uploadées
# Lancer depuis la racine du projet : bash scripts/backup-images.sh
#
# Crée une archive datée dans logs/ :
#   logs/images-backup-2025-01-15.tar.gz

DATE=$(date +%Y-%m-%d)
BACKUP_FILE="logs/images-backup-${DATE}.tar.gz"

echo "📦 Sauvegarde des images → ${BACKUP_FILE}"
tar -czf "${BACKUP_FILE}" public/uploads/

echo "✅ Sauvegarde terminée : $(du -sh ${BACKUP_FILE} | cut -f1)"
echo ""
echo "Pour restaurer :"
echo "  tar -xzf ${BACKUP_FILE}"
