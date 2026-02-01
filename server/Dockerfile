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
    netcat-openbsd \
    ca-certificates \
    unzip \
  && curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh \
  && python3 -m pip install --break-system-packages -U "yt-dlp[default]" bgutil-ytdlp-pot-provider \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Verify plugin installation (build-time check)
RUN echo "=== Build: yt-dlp path ===" && which yt-dlp \
  && echo "=== Build: yt-dlp version ===" && yt-dlp --version \
  && echo "=== Build: pip packages ===" && python3 -m pip list 2>/dev/null | grep -iE "yt.dlp|bgutil" \
  && echo "=== Build: plugin import test ===" && python3 -c "import bgutil_ytdlp_pot_provider; print('OK')" \
  && echo "=== Build: yt_dlp_plugins ===" && python3 -c "import yt_dlp_plugins; print(yt_dlp_plugins.__path__)" 2>/dev/null || true

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
