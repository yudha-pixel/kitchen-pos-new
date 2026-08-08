-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "auto_refresh" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "auto_report" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "backup_frequency" TEXT NOT NULL DEFAULT 'daily',
ADD COLUMN     "beverage_route" TEXT NOT NULL DEFAULT 'Bar Station',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'IDR',
ADD COLUMN     "default_cash_float" DOUBLE PRECISION NOT NULL DEFAULT 500000,
ADD COLUMN     "dessert_route" TEXT NOT NULL DEFAULT 'KDS Display 1',
ADD COLUMN     "email_manager" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "main_course_route" TEXT NOT NULL DEFAULT 'KDS Display 1',
ADD COLUMN     "manager_pin" TEXT NOT NULL DEFAULT '1234',
ADD COLUMN     "min_stock_ingredient" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "min_stock_menu" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "notify_low_stock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paper_width" TEXT NOT NULL DEFAULT '80',
ADD COLUMN     "printer_type" TEXT NOT NULL DEFAULT 'bluetooth',
ADD COLUMN     "receipt_footer" TEXT NOT NULL DEFAULT 'Silakan datang kembali',
ADD COLUMN     "receipt_header" TEXT NOT NULL DEFAULT 'TERIMA KASIH',
ADD COLUMN     "require_cash_float" TEXT NOT NULL DEFAULT 'yes',
ADD COLUMN     "require_pin_delete" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "require_pin_discount" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "require_pin_refund" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "require_pin_void" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "require_reconciliation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "service_charge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "show_cash_comparison" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_cashier_name" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_estimation" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_logo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_pos_warning" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_table_number" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sound_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "store_address" TEXT NOT NULL DEFAULT 'Jl. Contoh No. 123, Jakarta Selatan',
ADD COLUMN     "store_email" TEXT NOT NULL DEFAULT 'info@kitchenpos.com',
ADD COLUMN     "store_name" TEXT NOT NULL DEFAULT 'Kitchen POS Restaurant',
ADD COLUMN     "store_phone" TEXT NOT NULL DEFAULT '+62 21 1234 5678',
ADD COLUMN     "tax_rate" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customer_id" UUID;

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "points" INTEGER NOT NULL DEFAULT 0,
    "total_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount_percentage" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "minimum_purchase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_discount" DOUBLE PRECISION,
    "quota" INTEGER NOT NULL DEFAULT 100,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "position" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL DEFAULT 'permanent',
    "base_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hourly_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "check_in_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "check_out_time" TIMESTAMP(3),
    "photo_url" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "location_address" TEXT,
    "shift_type" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payrolls" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtime_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtime_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrolls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_phone_idx" ON "customers"("phone");

-- CreateIndex
CREATE INDEX "customers_tier_idx" ON "customers"("tier");

-- CreateIndex
CREATE INDEX "customers_is_active_idx" ON "customers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_code_idx" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_is_active_idx" ON "vouchers"("is_active");

-- CreateIndex
CREATE INDEX "vouchers_valid_from_idx" ON "vouchers"("valid_from");

-- CreateIndex
CREATE INDEX "vouchers_valid_until_idx" ON "vouchers"("valid_until");

-- CreateIndex
CREATE INDEX "employees_phone_idx" ON "employees"("phone");

-- CreateIndex
CREATE INDEX "employees_position_idx" ON "employees"("position");

-- CreateIndex
CREATE INDEX "employees_is_active_idx" ON "employees"("is_active");

-- CreateIndex
CREATE INDEX "attendances_employee_id_idx" ON "attendances"("employee_id");

-- CreateIndex
CREATE INDEX "attendances_check_in_time_idx" ON "attendances"("check_in_time");

-- CreateIndex
CREATE INDEX "payrolls_employee_id_idx" ON "payrolls"("employee_id");

-- CreateIndex
CREATE INDEX "payrolls_period_start_idx" ON "payrolls"("period_start");

-- CreateIndex
CREATE INDEX "payrolls_period_end_idx" ON "payrolls"("period_end");

-- CreateIndex
CREATE INDEX "payrolls_status_idx" ON "payrolls"("status");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
