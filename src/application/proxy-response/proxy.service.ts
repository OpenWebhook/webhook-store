import { Injectable } from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { SendWebhookService } from '../../infrastructure/send-webhook.service';
import { ProxyResponseService } from './proxy-response.service';

@Injectable()
export class ProxyService {
  constructor(
    private readonly sendWebhookService: SendWebhookService,
    private readonly proxyResponseService: ProxyResponseService,
  ) {}

  public sendAndStoreWebhookToTargets(
    targets: string[],
    body: Readonly<Record<string, any>>,
    headers: Readonly<Record<string, string>>,
    path: string,
    webhookId: Webhook['id'],
    host: Webhook['host'],
  ): void {
    targets.forEach(async (target) => {
      const proxyResponse = await this.sendWebhookService.sendWebhook(
        target,
        body,
        headers,
        path,
      )();
      this.proxyResponseService.storeResponse(
        webhookId,
        proxyResponse,
        target,
        host,
      );
    });
  }
}
