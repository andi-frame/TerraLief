FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install

# Build & Run 
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["bun", "run", "dev"]
