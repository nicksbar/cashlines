#!/bin/sh
set -e

# Wait for database to be ready (if using PostgreSQL)
if [ ! -z "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -q "postgresql"; then
  echo "Waiting for PostgreSQL to be ready..."
  
  # Parse connection string to get host
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\).*/\1/p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  
  # Default values if parsing fails
  DB_HOST=${DB_HOST:-postgres}
  DB_PORT=${DB_PORT:-5432}
  
  # Wait up to 30 seconds
  for i in $(seq 1 30); do
    if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
      echo "✅ PostgreSQL is ready!"
      break
    fi
    echo "Attempt $i/30: Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
    sleep 1
  done
fi

echo "Running database migrations..."
node_modules/.bin/prisma db push --skip-generate || true

echo "Starting Cashlines..."
exec node server.js
