# Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .

# Set API URL for dev
ENV VITE_API_URL=http://localhost:5000/api/v1

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
