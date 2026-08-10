-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "default_login_redirect" TEXT NOT NULL DEFAULT '/apps';
