FROM node:20-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod +x /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

# App deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

# ENV
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# build + run W RUNTIME
CMD npx prisma generate && npm run build && node dist/index.js
