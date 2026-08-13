-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "reservations" (
    "id" UUID NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "party_size" INTEGER NOT NULL,
    "reservation_date" TIMESTAMPTZ(6) NOT NULL,
    "reservation_time" TIMESTAMPTZ(6) NOT NULL,
    "duration_minutes" INTEGER,
    "area" TEXT NOT NULL,
    "special_requests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deposit_amount" DOUBLE PRECISION,
    "deposit_paid" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_notes" TEXT,
    "created_by" UUID,
    "confirmed_by" UUID,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_by" UUID,
    "cancelled_at" TIMESTAMPTZ(6),
    "cancellation_reason" TEXT,
    "table_id" UUID,
    "outlet_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservations_reservation_date_idx" ON "reservations"("reservation_date");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_area_idx" ON "reservations"("area");

-- CreateIndex
CREATE INDEX "reservations_table_id_idx" ON "reservations"("table_id");

-- CreateIndex
CREATE INDEX "reservations_outlet_id_idx" ON "reservations"("outlet_id");

-- CreateIndex
CREATE INDEX "reservations_created_by_idx" ON "reservations"("created_by");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
