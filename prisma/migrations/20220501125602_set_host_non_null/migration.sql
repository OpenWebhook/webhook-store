/*
  Warnings:

  - Made the column `host` on table `Webhook` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Webhook" ALTER COLUMN "host" SET NOT NULL;
