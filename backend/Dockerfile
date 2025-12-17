# Backend Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source and build (skip prisma generate for now)
COPY tsconfig.json ./
COPY src/ src/
COPY prisma/ prisma/
COPY prisma.config.ts ./
RUN npm run build

EXPOSE 5000
# Generate client, apply migrations, then start
CMD ["sh","-c","npx prisma generate && npx prisma migrate deploy && node dist/index.js"]
