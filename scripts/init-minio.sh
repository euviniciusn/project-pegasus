#!/bin/sh
set -e

ALIAS="local"
ENDPOINT="http://${MINIO_ENDPOINT}:${MINIO_PORT}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "Waiting for MinIO at ${ENDPOINT}..."

retries=0
until mc alias set "${ALIAS}" "${ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --api S3v4 > /dev/null 2>&1; do
  retries=$((retries + 1))
  if [ "${retries}" -ge "${MAX_RETRIES}" ]; then
    echo "ERROR: MinIO not ready after $((MAX_RETRIES * RETRY_INTERVAL))s — aborting"
    exit 1
  fi
  echo "  Attempt ${retries}/${MAX_RETRIES} — retrying in ${RETRY_INTERVAL}s..."
  sleep "${RETRY_INTERVAL}"
done

echo "MinIO is ready."

if mc ls "${ALIAS}/${MINIO_BUCKET}" > /dev/null 2>&1; then
  echo "Bucket '${MINIO_BUCKET}' already exists — skipping creation."
else
  echo "Creating bucket '${MINIO_BUCKET}'..."
  mc mb "${ALIAS}/${MINIO_BUCKET}"
fi

echo "Setting bucket policy to private..."
mc anonymous set none "${ALIAS}/${MINIO_BUCKET}"

echo "MinIO init complete."
