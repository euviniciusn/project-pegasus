#!/bin/sh
set -e

MIGRATIONS_DIR="/migrations"

echo "Running migrations against ${POSTGRES_DB}..."

for file in "${MIGRATIONS_DIR}"/*.sql; do
  filename=$(basename "${file}")
  echo "  Applying ${filename}..."
  psql "${DATABASE_URL}" -f "${file}"
done

echo "All migrations applied."
