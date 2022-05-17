import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Prisma, Webhook } from '@prisma/client';
import { PaginationArgs } from './pagination';
import { PrismaService } from './prisma.service';
import { pubSub } from './pubsub';
import { mapWebhookSchemaToModel } from './webhook.mapper';
import { WebhookModel } from './webhook.model';
import { WebhookCreatedEvent } from './webhook/events/webhook-created.event';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getCount(host: string): Promise<string> {
    const webhooksCount = await this.prisma.webhook.count({ where: { host } });
    return `There are ${webhooksCount} webhooks on ${host}!`;
  }

  async getWebhooksPerHosts(): Promise<any> {
    const webhooksCount = await this.prisma.webhook.groupBy({
      by: ['host'],
      _count: {
        host: true,
      },
      orderBy: {
        _count: {
          host: 'desc',
        },
      },
    });
    return webhooksCount;
  }

  async addWebhook(data: Prisma.WebhookCreateInput): Promise<Webhook> {
    const webhook = await this.prisma.webhook.create({ data });
    pubSub.publish(`webhookAdded_${webhook.host}`, {
      webhookAdded: mapWebhookSchemaToModel(webhook),
    });

    this.eventEmitter.emit(
      'webhook.created',
      new WebhookCreatedEvent(webhook.id, webhook.host),
    );

    return webhook;
  }

  async getWebhooks(
    host: string,
    paginationArgs: PaginationArgs,
  ): Promise<WebhookModel[]> {
    const { first, offset } = paginationArgs;
    const webhooks = await this.prisma.webhook.findMany({
      skip: offset,
      take: first,
      orderBy: { createdAt: 'desc' },
      where: { host },
    });
    return webhooks.map(mapWebhookSchemaToModel);
  }

  async deleteWebhooks(host: string) {
    return this.prisma.webhook.deleteMany({ where: { host } });
  }

  @OnEvent('webhook.created')
  async afterWebhookCreated(payload: WebhookCreatedEvent) {
    await this.deleteOldWebhooks(payload.host, 100);
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
