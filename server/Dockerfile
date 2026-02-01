# ---- Build stage ----
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/
RUN npx tsc

# ---- Production stage ----
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
    unzip \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh \
  && python3 -m pip install --break-system-packages -U bgutil-ytdlp-pot-provider \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# yt-dlp config — auto-read by yt-dlp, no code changes needed
RUN echo '--js-runtimes deno' > /etc/yt-dlp.conf

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh && sed -i 's/\r$//' docker-entrypoint.sh

RUN mkdir -p /app/downloads

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
