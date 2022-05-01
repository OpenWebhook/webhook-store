/*
  Warnings:

  - Added the required column `host` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "host" TEXT;
UPDATE "Webhook" SET host = headers::json->>'host';
