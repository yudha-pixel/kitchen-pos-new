-- CreateTable
CREATE TABLE "stock_approval_requests" (
    "id" UUID NOT NULL,
    "request_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "requester_name" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "manager_notes" TEXT,
    "processed_at" TIMESTAMP(3),
    "processed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_approval_requests_request_number_key" ON "stock_approval_requests"("request_number");

-- CreateIndex
CREATE INDEX "stock_approval_requests_status_idx" ON "stock_approval_requests"("status");

-- CreateIndex
CREATE INDEX "stock_approval_requests_request_number_idx" ON "stock_approval_requests"("request_number");
