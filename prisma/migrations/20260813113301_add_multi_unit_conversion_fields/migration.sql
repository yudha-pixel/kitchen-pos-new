-- AlterTable
ALTER TABLE "ingredients" ADD COLUMN     "base_unit" TEXT,
ADD COLUMN     "conversion_factor" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "secondary_conversion_factor" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "secondary_unit" TEXT;
