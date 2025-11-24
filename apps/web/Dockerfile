# Multi-stage build for RiseUp Africa Web App
FROM node:20-alpine AS base
# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
# Set working directory
WORKDIR /app
# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
# Copy workspace packages
COPY packages/ ./packages/
# Copy web app package.json
COPY apps/web/package.json ./apps/web/
# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
# Copy source code
COPY apps/web/ ./apps/web/
COPY packages/ ./packages/
# Set build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Build the application
WORKDIR /app/apps/web
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Copy static files to the correct location within standalone structure
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "apps/web/server.js"]