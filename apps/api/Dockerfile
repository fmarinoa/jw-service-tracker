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

# Install dependencies (including devDependencies needed for compiling)
RUN pnpm install --frozen-lockfile

# Copy shared package and build it
COPY packages/shared ./packages/shared
RUN pnpm --filter @jw-tracker/shared build

# Copy api code
COPY apps/api ./apps/api

# Build NestJS API (outputs to apps/api/dist)
RUN pnpm --filter api build

# Stage 2: Production runtime stage
FROM node:24-alpine AS runner

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy pnpm and workspace configs
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/client/package.json ./apps/client/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built code from the builder stage
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["pnpm", "--filter", "api", "start:prod"]
