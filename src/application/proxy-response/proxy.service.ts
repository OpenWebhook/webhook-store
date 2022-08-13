import { Injectable } from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { Json } from 'fp-ts/lib/Json';
import { SendWebhookService } from '../../infrastructure/send-webhook.service';
import { ProxyResponseService } from './proxy-response.service';

@Injectable()
export class ProxyService {
  constructor(
    private readonly sendWebhookService: SendWebhookService,
    private readonly proxyResponseService: ProxyResponseService,
  ) {}

  public async sendAndStoreWebhookToTarget(
    target: string,
    body: Readonly<Json>,
    headers: Readonly<Record<string, string>>,
    path: string,
    webhookId: Webhook['id'],
    host: Webhook['host'],
  ) {
    const proxyResponse = await this.sendWebhookService.sendWebhook(
      target,
      body,
      headers,
      path,
    )();
    const response = await this.proxyResponseService.storeResponse(
      webhookId,
      proxyResponse,
      target,
      host,
    )();
    return response;
  }

  public sendAndStoreWebhookToTargets(
    targets: string[],
    body: Readonly<Json>,
    headers: Readonly<Record<string, string>>,
    path: string,
    webhookId: Webhook['id'],
    host: Webhook['host'],
  ): void {
    targets.forEach(async (target) => {
      await this.sendAndStoreWebhookToTarget(
        target,
        body,
        headers,
        path,
        webhookId,
        host,
      );
    });
  }
}
