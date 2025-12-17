# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app

# Build-time API URL for Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Install deps and build
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Serve built assets using Vite preview
EXPOSE 5173
CMD ["npm","run","preview","--","--port","5173","--strictPort"]
