import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhookModel } from '../../interface/webhook.model';
import { PrismaService } from '../../infrastructure/prisma.service';
import { WebhookCreatedEvent } from './events/webhook-created.event';
import webhookConfig from '../../config/webhook.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class WebhookAfterReceptionService {
  constructor(
    private prisma: PrismaService,
    @Inject(webhookConfig.KEY)
    private webhookStoreConfig: ConfigType<typeof webhookConfig>,
  ) {}

  @OnEvent(WebhookCreatedEvent.name)
  async afterWebhookCreated(payload: WebhookCreatedEvent) {
    const storageLimitOfWebhook =
      this.webhookStoreConfig.maxStoredWebhookPerHost;
    if (storageLimitOfWebhook) {
      await this.deleteOldWebhooks(payload.host, storageLimitOfWebhook);
    }
  }

  async deleteOldWebhooks(host: WebhookModel['host'], limitToKeep: number) {
    const ids = await this.prisma.webhook.findMany({
      select: { id: true },
      where: { host },
      take: limitToKeep,
      orderBy: { createdAt: 'desc' },
    });
    await this.prisma.webhook.deleteMany({
      where: { id: { notIn: ids.map((webhook) => webhook.id) }, host },
    });
  }
}
