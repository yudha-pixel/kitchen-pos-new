-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL,
    "hideTakeawayDelivery" BOOLEAN NOT NULL DEFAULT false,
    "hideCustomerName" BOOLEAN NOT NULL DEFAULT false,
    "hideKitchenButton" BOOLEAN NOT NULL DEFAULT false,
    "hideCancelButton" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
