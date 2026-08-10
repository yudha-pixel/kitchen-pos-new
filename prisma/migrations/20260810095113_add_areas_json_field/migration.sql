-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "areas" JSONB DEFAULT '[{"id":"1","name":"Indoor","description":"Area dalam restoran","count":10},{"id":"2","name":"Outdoor","description":"Area luar restoran","count":8},{"id":"3","name":"VIP","description":"Area VIP khusus","count":4}]';
