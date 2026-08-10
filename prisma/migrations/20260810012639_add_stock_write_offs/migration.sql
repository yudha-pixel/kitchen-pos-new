-- CreateTable
CREATE TABLE "stock_write_offs" (
    "id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity_written_off" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "proof_file" TEXT NOT NULL,
    "proof_file_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_by" UUID NOT NULL,
    "requested_by_name" TEXT NOT NULL,
    "approved_by" UUID,
    "approved_by_name" TEXT,
    "rejected_by" UUID,
    "rejected_by_name" TEXT,
    "rejection_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "stock_write_offs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_write_offs_ingredient_id_idx" ON "stock_write_offs"("ingredient_id");

-- CreateIndex
CREATE INDEX "stock_write_offs_status_idx" ON "stock_write_offs"("status");

-- AddForeignKey
ALTER TABLE "stock_write_offs" ADD CONSTRAINT "stock_write_offs_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
