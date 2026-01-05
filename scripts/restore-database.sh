#!/bin/bash

# Database restore script
# Usage: ./restore-database.sh <backup_file.sql.gz> [database_name]

set -e  # Exit on error

BACKUP_FILE="${1}"
DATABASE_NAME="${2:-termin_calendar_pwa}"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file.sql.gz> [database_name]"
    echo "Example: $0 /backups/postgres/termin_2026-01-05_0200.sql.gz termin_calendar_pwa"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "========================================="
echo "Database Restore Script"
echo "========================================="
echo "Backup file: $BACKUP_FILE"
echo "Database: $DATABASE_NAME"
echo "========================================="
echo ""

# Check if running as root or postgres user
if [ "$EUID" -ne 0 ] && [ "$USER" != "postgres" ]; then
    echo "Warning: This script should be run as root or postgres user"
    echo "Some operations may require sudo"
fi

# Step 1: Drop existing database (if it exists)
echo "Step 1: Dropping existing database (if exists)..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DATABASE_NAME;" || {
    echo "Warning: Could not drop database (might not exist)"
}

# Step 2: Create fresh database
echo "Step 2: Creating fresh database..."
sudo -u postgres psql -c "CREATE DATABASE $DATABASE_NAME;" || {
    echo "Error: Failed to create database"
    exit 1
}

# Step 3: Restore from backup
echo "Step 3: Restoring from backup..."
echo "This may take a few minutes..."

gunzip < "$BACKUP_FILE" | sudo -u postgres psql "$DATABASE_NAME" 2>&1 | tee /tmp/restore.log

# Check for critical errors
if grep -q "ERROR" /tmp/restore.log; then
    echo ""
    echo "========================================="
    echo "WARNING: Some errors occurred during restore"
    echo "========================================="
    echo "Check /tmp/restore.log for details"
    echo ""
    echo "Common non-critical errors that can be ignored:"
    echo "  - 'already exists' errors for types/tables (if restoring to existing schema)"
    echo "  - 'Permission denied' for directory changes (harmless)"
    echo ""
    echo "Critical errors to check:"
    echo "  - Foreign key constraint violations"
    echo "  - Data insertion failures"
    echo ""
else
    echo ""
    echo "========================================="
    echo "Restore completed successfully!"
    echo "========================================="
fi

# Step 4: Verify restore
echo ""
echo "Step 4: Verifying restore..."
TABLE_COUNT=$(sudo -u postgres psql -d "$DATABASE_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "Tables found: $TABLE_COUNT"

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✓ Database restore appears successful"
else
    echo "✗ Warning: No tables found in database"
fi

echo ""
echo "Restore process completed. Check /tmp/restore.log for full details."

