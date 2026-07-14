-- CreateTable
CREATE TABLE "printers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ip_address" TEXT,
    "port" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_printers" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "printer_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_printers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_printers_category_id_idx" ON "category_printers"("category_id");

-- CreateIndex
CREATE INDEX "category_printers_printer_id_idx" ON "category_printers"("printer_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_printers_category_id_printer_id_key" ON "category_printers"("category_id", "printer_id");

-- AddForeignKey
ALTER TABLE "category_printers" ADD CONSTRAINT "category_printers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_printers" ADD CONSTRAINT "category_printers_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
