-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "card_view" TEXT NOT NULL DEFAULT 'grid',
ADD COLUMN     "cart_position" TEXT NOT NULL DEFAULT 'right-sidebar',
ADD COLUMN     "layout_density" TEXT NOT NULL DEFAULT 'spacious';
