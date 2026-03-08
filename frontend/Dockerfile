FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install

# Build & Run 
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV PORT=5173
ENV HOSTNAME=0.0.0.0
# Ensure vite binds to 0.0.0.0 so Docker can expose it
EXPOSE 5173

CMD ["bun", "run", "vite", "--host", "0.0.0.0", "--port", "5173"]
