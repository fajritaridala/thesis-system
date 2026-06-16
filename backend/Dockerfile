# Stage 1: Install dependencies
FROM node:22-alpine AS deps

RUN corepack enable

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build TypeScript
FROM node:22-alpine AS build

RUN corepack enable

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src
RUN pnpm build

# Stage 3: Production runner
FROM node:22-alpine AS runner

RUN corepack enable

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3005

CMD ["node", "dist/index.js"]
