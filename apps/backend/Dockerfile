

# ===== Base Node Image =====
FROM node:22-alpine AS base

# ===== Builder Stage =====
FROM base AS builder

# Install glibc compatibility for Node.js ESM/env support on Alpine
RUN apk add --no-cache gcompat

# Set working directory
WORKDIR /app

# Copy root and workspace manifests
COPY package*json ./
# Copy backend and schemas sources
COPY apps/backend ./apps/backend
COPY packages ./packages

# Install dependencies and build all workspaces
RUN npm ci \
    && npm run build:schemas \
    && npm run build:backend \
    && npm prune --production

# ===== Runtime Stage =====
FROM base AS runner

# Set working directory
WORKDIR /app

# Create non-root user and group for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 hono

# Copy production node_modules and built backend
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/apps/backend/dist /app/dist

# Copy built schemas package (dist and package.json)
COPY --from=builder --chown=hono:nodejs /app/packages/schemas/dist /app/node_modules/@pinkka/schemas
COPY --from=builder --chown=hono:nodejs /app/packages/schemas/package.json /app/node_modules/@pinkka/schemas

# Set user permissions and expose backend port
USER hono
EXPOSE 3000

# Start the backend server
CMD ["node", "/app/dist/index.js"]