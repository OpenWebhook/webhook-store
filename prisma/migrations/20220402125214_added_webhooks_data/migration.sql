/*
  Warnings:

  - Added the required column `body` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headers` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `Webhook` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "body" JSONB NOT NULL,
ADD COLUMN     "headers" JSONB NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
