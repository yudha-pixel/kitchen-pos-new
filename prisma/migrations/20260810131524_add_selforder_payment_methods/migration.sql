-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "selforder_payment_methods" JSONB DEFAULT '["cashier"]';
