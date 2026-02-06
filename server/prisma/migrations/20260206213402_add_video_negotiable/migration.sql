-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "negotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoUrl" TEXT;
