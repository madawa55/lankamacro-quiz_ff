# Stage 1: Build frontend assets
FROM node:20-alpine AS builder

# Install build tools required for native addons (better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Copy all node_modules from builder (includes tsx for running TypeScript)
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source files needed at runtime
COPY server.ts ./
COPY src/types.ts ./src/
COPY src/questions.ts ./src/
COPY tsconfig.json ./
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node_modules/.bin/tsx", "server.ts"]
