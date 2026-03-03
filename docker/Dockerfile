FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies based on yarn.lock
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy local code to the container image
COPY . .

# Build the Nuxt application
RUN yarn build

# Production image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/.output /app/.output

# Expose Nuxt port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", ".output/server/index.mjs"]
