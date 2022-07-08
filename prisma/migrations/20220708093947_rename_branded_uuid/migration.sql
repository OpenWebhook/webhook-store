/*
  Warnings:

  - The primary key for the `Webhook` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `branded_uuid` on the `Webhook` table. All the data in the column will be lost.
  - Added the required column `id` to the `Webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Webhook" RENAME COLUMN "branded_uuid" TO "id";