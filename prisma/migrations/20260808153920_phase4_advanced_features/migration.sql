-- CreateTable
CREATE TABLE "ocr_scans" (
    "id" UUID NOT NULL,
    "scan_type" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "extracted_text" JSONB,
    "extracted_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocr_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_stations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "outlet_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kitchen_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kitchen_station_categories" (
    "id" UUID NOT NULL,
    "kitchen_station_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "kitchen_station_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "database_backups" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "backup_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "database_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ocr_scans_user_id_idx" ON "ocr_scans"("user_id");

-- CreateIndex
CREATE INDEX "ocr_scans_scan_type_idx" ON "ocr_scans"("scan_type");

-- CreateIndex
CREATE INDEX "ocr_scans_status_idx" ON "ocr_scans"("status");

-- CreateIndex
CREATE INDEX "ocr_scans_created_at_idx" ON "ocr_scans"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_stations_code_key" ON "kitchen_stations"("code");

-- CreateIndex
CREATE INDEX "kitchen_stations_outlet_id_idx" ON "kitchen_stations"("outlet_id");

-- CreateIndex
CREATE INDEX "kitchen_stations_code_idx" ON "kitchen_stations"("code");

-- CreateIndex
CREATE INDEX "kitchen_station_categories_kitchen_station_id_idx" ON "kitchen_station_categories"("kitchen_station_id");

-- CreateIndex
CREATE INDEX "kitchen_station_categories_category_id_idx" ON "kitchen_station_categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "kitchen_station_categories_kitchen_station_id_category_id_key" ON "kitchen_station_categories"("kitchen_station_id", "category_id");

-- CreateIndex
CREATE INDEX "database_backups_backup_type_idx" ON "database_backups"("backup_type");

-- CreateIndex
CREATE INDEX "database_backups_status_idx" ON "database_backups"("status");

-- CreateIndex
CREATE INDEX "database_backups_created_at_idx" ON "database_backups"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "kitchen_stations" ADD CONSTRAINT "kitchen_stations_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_station_categories" ADD CONSTRAINT "kitchen_station_categories_kitchen_station_id_fkey" FOREIGN KEY ("kitchen_station_id") REFERENCES "kitchen_stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_station_categories" ADD CONSTRAINT "kitchen_station_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
