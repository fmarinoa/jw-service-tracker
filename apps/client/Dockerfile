# Stage 1: Build stage
FROM node:24-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy pnpm and workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/

# Install dependencies (frozen lockfile to ensure reproducible builds)
RUN pnpm install --frozen-lockfile

# Copy shared package (needed for client compilation as it imports from packages/shared/src)
COPY packages/shared ./packages/shared

# Copy client source code
COPY apps/client ./apps/client

# Export Expo Web static files (outputs to apps/client/dist)
# NODE_PATH is set to the virtual store node_modules to let Babel resolve symlinked packages
ENV NODE_PATH=/app/node_modules/.pnpm/node_modules
RUN pnpm --filter @jw-tracker/client build

# Stage 2: Serve stage
FROM nginx:alpine AS runner

# Copy custom nginx configuration to handle client-side routing (SPA fallback)
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files exported from Expo Web
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
