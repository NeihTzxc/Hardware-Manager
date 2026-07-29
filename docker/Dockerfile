FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies based on yarn.lock
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy local code to the container image
COPY . .

# Generate Prisma Client rõ ràng
RUN npx prisma generate

# Build Nuxt
RUN yarn build


FROM node:24-alpine AS runtime

WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Copy Nuxt output trước
COPY --from=builder /app/.output /app/.output

# Sau đó bổ sung generated Prisma Client
COPY --from=builder /app/node_modules/.prisma \
  /app/.output/server/node_modules/.prisma

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]