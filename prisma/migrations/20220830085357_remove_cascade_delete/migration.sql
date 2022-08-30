-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_webhookId_fkey";

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
