#!/bin/sh
set -e
echo "Running database migrations..."
node_modules/.bin/prisma db push --skip-generate || true
echo "Starting Cashlines..."
exec node server.js
