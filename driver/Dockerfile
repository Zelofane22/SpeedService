FROM node:24-slim AS base
RUN npm install -g pnpm@10.34.3

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/
COPY driver/package.json ./driver/
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/package.json ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/driver/node_modules ./driver/node_modules
COPY packages ./packages
COPY driver ./driver
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm --filter speedservice-driver build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/driver/.next/standalone ./
COPY --from=builder /app/driver/.next/static ./driver/.next/static
COPY --from=builder /app/driver/public* ./driver/public/
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
WORKDIR /app/driver
CMD ["node", "server.js"]
