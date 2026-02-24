# Stage 1: Build dependencies
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Install ALL dependencies (including devDependencies if any were present)
RUN npm ci

# Stage 2: Final image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Only copy production dependencies from builder
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Use a non-root user for security
USER node

EXPOSE 5001

CMD ["node", "index.js"]
