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
    if (storageLimitOfWebhook._tag === 'Some') {
      await this.deleteOldWebhooks(payload.host, storageLimitOfWebhook.value);
    }
  }

  async deleteOldWebhooks(host: WebhookModel['host'], limitToKeep: number) {
    const webhookIdsToKeep = await this.prisma.webhook.findMany({
      select: { id: true },
      where: { host },
      take: limitToKeep,
      orderBy: { createdAt: 'desc' },
    });
    await this.prisma.webhook.deleteMany({
      where: {
        id: { notIn: webhookIdsToKeep.map((webhook) => webhook.id) },
        host,
      },
    });
    await this.prisma.response.deleteMany({
      where: {
        webhookId: { notIn: webhookIdsToKeep.map((webhook) => webhook.id) },
        host,
      },
    });
  }
}
