-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "attributes" JSONB;
