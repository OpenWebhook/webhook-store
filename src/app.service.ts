import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, Webhook } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { pubSub } from './pubsub';
import { mapWebhookSchemaToModel } from './webhook.mapper';
import { WebhookModel } from './webhook.model';
import { WebhookCreatedEvent } from './webhook/events/webhook-created.event';
import { WebhooksQueryArgs } from './webhooks.query-args';

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
    paginationArgs: WebhooksQueryArgs,
  ): Promise<WebhookModel[]> {
    const { first, offset, path } = paginationArgs;

    const webhooks = await this.prisma.webhook.findMany({
      skip: offset,
      take: first,
      orderBy: { createdAt: 'desc' },
      where: { host, path },
    });

    return webhooks.map(mapWebhookSchemaToModel);
  }

  async deleteWebhooks(host: string) {
    return this.prisma.webhook.deleteMany({ where: { host } });
  }
}
