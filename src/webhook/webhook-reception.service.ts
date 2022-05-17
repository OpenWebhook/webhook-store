import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { WebhookModel } from '../webhook.model';
import { PrismaService } from '../prisma.service';
import { WebhookCreatedEvent } from './events/webhook-created.event';

@Injectable()
export class WebhookReceptionService {
  constructor(private prisma: PrismaService) {}

  @OnEvent('webhook.created')
  async afterWebhookCreated(payload: WebhookCreatedEvent) {
    await this.deleteOldWebhooks(payload.host, 10);
  }

  async deleteOldWebhooks(host: WebhookModel['host'], limitToKeep: number) {
    const ids = await this.prisma.webhook.findMany({
      select: { id: true },
      where: { host },
      take: limitToKeep,
      orderBy: { createdAt: 'desc' },
    });
    await this.prisma.webhook.deleteMany({
      where: { id: { notIn: ids.map((webhook) => webhook.id) } },
    });
  }
}
