/*
  Warnings:

  - A unique constraint covering the columns `[branded_uuid]` on the table `Webhook` will be added. If there are existing duplicate values, this will fail.
  - The required column `branded_uuid` was added to the `Webhook` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "branded_uuid" TEXT;
UPDATE "Webhook" SET branded_uuid = CONCAT('wh-',gen_random_uuid());
ALTER TABLE "Webhook" ALTER COLUMN  "branded_uuid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Webhook_branded_uuid_key" ON "Webhook"("branded_uuid");
