-- CreateTable
CREATE TABLE "purchase_requisitions" (
    "id" UUID NOT NULL,
    "pr_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending Approval',
    "requested_by" TEXT NOT NULL,
    "total_estimated" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_requisition_items" (
    "id" UUID NOT NULL,
    "purchase_requisition_id" UUID NOT NULL,
    "ingredient_id" UUID NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "estimated_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "purchase_requisition_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "purchase_requisitions_pr_number_key" ON "purchase_requisitions"("pr_number");

-- CreateIndex
CREATE INDEX "purchase_requisitions_status_idx" ON "purchase_requisitions"("status");

-- CreateIndex
CREATE INDEX "purchase_requisitions_pr_number_idx" ON "purchase_requisitions"("pr_number");

-- CreateIndex
CREATE INDEX "purchase_requisition_items_purchase_requisition_id_idx" ON "purchase_requisition_items"("purchase_requisition_id");

-- CreateIndex
CREATE INDEX "purchase_requisition_items_ingredient_id_idx" ON "purchase_requisition_items"("ingredient_id");

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_purchase_requisition_id_fkey" FOREIGN KEY ("purchase_requisition_id") REFERENCES "purchase_requisitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "purchase_requisition_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
