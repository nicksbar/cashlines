# Dockerfile for Cashlines
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl openssl-dev
WORKDIR /app
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cashlines"
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (skip prisma db push - will run at runtime via entrypoint)
RUN npx next build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl dumb-init netcat-openbsd

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for database
RUN mkdir -p /app/data
RUN chown nextjs:nodejs /app/data

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy built application and necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Copy entrypoint script
RUN mkdir -p /app/scripts
COPY --chown=nextjs:nodejs scripts/entrypoint.sh /app/scripts/entrypoint.sh
RUN chmod +x /app/scripts/entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/scripts/entrypoint.sh"]
