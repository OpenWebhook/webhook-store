import { Webhook } from '@prisma/client';
import { WebhookModel } from './webhook.model';

export const mapWebhookSchemaToModel = (webhook: Webhook): WebhookModel => {
  return {
    ...webhook,
    body: JSON.stringify(webhook.body),
    headers: JSON.stringify(webhook.headers),
    receivedAt: webhook.createdAt,
  };
};
