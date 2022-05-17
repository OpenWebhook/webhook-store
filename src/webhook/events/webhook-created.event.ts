import { WebhookModel } from 'src/webhook.model';

export class WebhookCreatedEvent {
  constructor(
    public readonly webhookId: WebhookModel['id'],
    public readonly host: WebhookModel['host'],
  ) {}
}
