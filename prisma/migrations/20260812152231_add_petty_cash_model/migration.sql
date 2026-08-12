-- CreateTable
CREATE TABLE "petty_cash" (
    "id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "receipt_url" TEXT,
    "expense_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ingredient_id" UUID,
    "shift_id" UUID,

    CONSTRAINT "petty_cash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "petty_cash_created_by_idx" ON "petty_cash"("created_by");

-- CreateIndex
CREATE INDEX "petty_cash_expense_date_idx" ON "petty_cash"("expense_date");

-- CreateIndex
CREATE INDEX "petty_cash_ingredient_id_idx" ON "petty_cash"("ingredient_id");

-- CreateIndex
CREATE INDEX "petty_cash_shift_id_idx" ON "petty_cash"("shift_id");

-- AddForeignKey
ALTER TABLE "petty_cash" ADD CONSTRAINT "petty_cash_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "petty_cash" ADD CONSTRAINT "petty_cash_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
