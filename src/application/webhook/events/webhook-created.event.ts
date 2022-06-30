import { WebhookModel } from 'src/interface/webhook.model';

export class WebhookCreatedEvent {
  constructor(
    public readonly webhookId: WebhookModel['id'],
    public readonly host: WebhookModel['host'],
  ) {}
}
