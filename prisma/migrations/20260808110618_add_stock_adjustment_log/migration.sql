-- CreateTable
CREATE TABLE "stock_adjustment_logs" (
    "id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "previous_stock" DOUBLE PRECISION NOT NULL,
    "new_stock" DOUBLE PRECISION NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "reason" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_adjustment_logs_ingredient_id_idx" ON "stock_adjustment_logs"("ingredient_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_logs_user_id_idx" ON "stock_adjustment_logs"("user_id");

-- CreateIndex
CREATE INDEX "stock_adjustment_logs_created_at_idx" ON "stock_adjustment_logs"("created_at");

-- AddForeignKey
ALTER TABLE "stock_adjustment_logs" ADD CONSTRAINT "stock_adjustment_logs_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
