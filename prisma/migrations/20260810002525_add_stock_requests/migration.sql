-- CreateTable
CREATE TABLE "stock_requests" (
    "id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity_requested" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "supplier_name" TEXT,
    "proof_file" TEXT,
    "proof_file_name" TEXT,
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

    CONSTRAINT "stock_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_requests_ingredient_id_idx" ON "stock_requests"("ingredient_id");

-- CreateIndex
CREATE INDEX "stock_requests_status_idx" ON "stock_requests"("status");

-- AddForeignKey
ALTER TABLE "stock_requests" ADD CONSTRAINT "stock_requests_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
