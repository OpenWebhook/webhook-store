-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "searchablePath" TEXT;
UPDATE "Webhook" SET "searchablePath" = REPLACE(path, '/', ' / ');
ALTER TABLE "Webhook" ALTER COLUMN "searchablePath" SET NOT NULL;
