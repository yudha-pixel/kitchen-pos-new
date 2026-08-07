/*
  Warnings:

  - You are about to drop the column `hideCancelButton` on the `app_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hideCustomerName` on the `app_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hideKitchenButton` on the `app_settings` table. All the data in the column will be lost.
  - You are about to drop the column `hideTakeawayDelivery` on the `app_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "app_settings" DROP COLUMN "hideCancelButton",
DROP COLUMN "hideCustomerName",
DROP COLUMN "hideKitchenButton",
DROP COLUMN "hideTakeawayDelivery",
ADD COLUMN     "card_style" TEXT NOT NULL DEFAULT 'rounded',
ADD COLUMN     "primary_color" TEXT NOT NULL DEFAULT 'blue',
ADD COLUMN     "theme_mode" TEXT NOT NULL DEFAULT 'light';
