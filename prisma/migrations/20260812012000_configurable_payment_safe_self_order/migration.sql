-- Existing digital methods did not have trustworthy restaurant instructions.
-- Disable them during migration; owners can opt in again after supplying instructions.
ALTER TABLE "app_settings"
ADD COLUMN "selforder_payment_instructions" JSONB DEFAULT '{}'::jsonb;

UPDATE "app_settings"
SET "selforder_payment_methods" = '["cashier"]'::jsonb;

ALTER TABLE "customer_orders"
ADD COLUMN "payment_reference" TEXT,
ADD COLUMN "payment_verified_at" TIMESTAMPTZ(6),
ADD COLUMN "payment_verified_by" UUID;
