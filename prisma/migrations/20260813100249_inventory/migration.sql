-- CreateTable
CREATE TABLE "stock_batches" (
    "id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "batch_code" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_logs" (
    "id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "reference_id" TEXT,
    "reference_type" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_batches_batch_code_key" ON "stock_batches"("batch_code");

-- CreateIndex
CREATE INDEX "stock_batches_ingredient_id_idx" ON "stock_batches"("ingredient_id");

-- CreateIndex
CREATE INDEX "stock_batches_expiry_date_idx" ON "stock_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "stock_batches_created_at_idx" ON "stock_batches"("created_at");

-- CreateIndex
CREATE INDEX "stock_logs_ingredient_id_idx" ON "stock_logs"("ingredient_id");

-- CreateIndex
CREATE INDEX "stock_logs_type_idx" ON "stock_logs"("type");

-- CreateIndex
CREATE INDEX "stock_logs_created_at_idx" ON "stock_logs"("created_at");

-- CreateIndex
CREATE INDEX "stock_logs_reference_id_idx" ON "stock_logs"("reference_id");

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
