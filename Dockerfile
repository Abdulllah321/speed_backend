# Stage 1: Dependencies (Bun for speed)
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Build Prisma Client
FROM oven/bun:1 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate

# Stage 3: Production (Node for stability)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/src ./src
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./

USER expressjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "src/server.js"]

