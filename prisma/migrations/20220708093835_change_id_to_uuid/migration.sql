/*
  Warnings:

  - The primary key for the `Webhook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Webhook` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Webhook_branded_uuid_key";

-- AlterTable
ALTER TABLE "Webhook" DROP CONSTRAINT "Webhook_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Webhook_pkey" PRIMARY KEY ("branded_uuid");
