FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time; .env is dockerignored, so
# the public site settings must arrive as build args (docker-compose.yml).
# Indexing stays off unless both are set (src/lib/brand.ts).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_INDEXABLE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_SITE_INDEXABLE=$NEXT_PUBLIC_SITE_INDEXABLE
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
