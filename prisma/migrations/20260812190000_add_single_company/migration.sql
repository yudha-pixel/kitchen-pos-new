CREATE TABLE "companies" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "logo_path" TEXT,
  "logo_mime_type" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "address" TEXT,
  "tax_id" TEXT,
  "company_registry" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  "currency" TEXT NOT NULL DEFAULT 'IDR',
  "tax_rate" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "service_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

INSERT INTO "companies" (
  "id", "name", "phone", "email", "address", "timezone", "currency", "tax_rate", "service_charge"
)
SELECT
  gen_random_uuid(),
  COALESCE(NULLIF(BTRIM("store_name"), ''), 'Kitchen POS'),
  NULLIF(BTRIM("store_phone"), ''),
  NULLIF(BTRIM("store_email"), ''),
  NULLIF(BTRIM("store_address"), ''),
  COALESCE(NULLIF(BTRIM("timezone"), ''), 'Asia/Jakarta'),
  COALESCE(NULLIF(UPPER(BTRIM("currency")), ''), 'IDR'),
  COALESCE("tax_rate", 10),
  COALESCE("service_charge", 0)
FROM "app_settings"
ORDER BY "created_at"
LIMIT 1;

INSERT INTO "companies" ("id", "name")
SELECT gen_random_uuid(), 'Kitchen POS'
WHERE NOT EXISTS (SELECT 1 FROM "companies");

ALTER TABLE "outlets" ADD COLUMN "company_id" UUID;

UPDATE "outlets"
SET "company_id" = (SELECT "id" FROM "companies" ORDER BY "created_at" LIMIT 1);

ALTER TABLE "outlets" ALTER COLUMN "company_id" SET NOT NULL;
CREATE INDEX "outlets_company_id_idx" ON "outlets"("company_id");
ALTER TABLE "outlets"
ADD CONSTRAINT "outlets_company_id_fkey"
FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
