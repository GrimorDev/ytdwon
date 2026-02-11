-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LISTING_CREATED', 'LISTING_PROMOTED', 'PROMOTION_EXPIRING', 'PROMOTION_EXPIRED', 'NEW_MESSAGE', 'NEW_REVIEW', 'LISTING_SOLD', 'LISTING_FAVORITED', 'SYSTEM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "titlePl" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "bodyPl" TEXT,
    "bodyEn" TEXT,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
