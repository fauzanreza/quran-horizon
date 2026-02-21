# ─────────────────────────────────────────────
# Stage 1: Install dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc compat for Alpine (needed by some native modules)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install production + dev deps
COPY package.json package-lock.json* ./
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: Build the Next.js app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all project source files
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the app (produces .next/standalone)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Minimal production runner
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the standalone output (self-contained server bundle)
COPY --from=builder /app/.next/standalone ./

# Copy static assets (next/image optimisation, _next/static files)
COPY --from=builder /app/.next/static ./.next/static

# Copy public folder (fonts, icons, sw.js, manifest, etc.)
COPY --from=builder /app/public ./public

# Fix ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
