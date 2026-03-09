# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
# Install all dependencies including dev (Tailwind, PostCSS)
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS build
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time args for Next.js public env vars
ARG NEXT_PUBLIC_COGNITO_USER_POOL_ID=""
ARG NEXT_PUBLIC_COGNITO_CLIENT_ID=""
ARG NEXT_PUBLIC_COGNITO_REGION=""
ARG NEXT_PUBLIC_APP_URL=""
ARG NEXT_PUBLIC_AUTH_URL=""

ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=$NEXT_PUBLIC_COGNITO_USER_POOL_ID \
    NEXT_PUBLIC_COGNITO_CLIENT_ID=$NEXT_PUBLIC_COGNITO_CLIENT_ID \
    NEXT_PUBLIC_COGNITO_REGION=$NEXT_PUBLIC_COGNITO_REGION \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0 HOSTNAME=0.0.0.0 NODE_OPTIONS="--enable-source-maps"

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

# Remove devDependencies to slim final image
RUN npm prune --production || true

EXPOSE 3000

# JSON form CMD fails fast if process dies (better for health checks)
CMD ["npx", "next", "start", "-p", "3000"]
