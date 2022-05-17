import { Injectable } from '@nestjs/common';
import { Prisma, Webhook } from '@prisma/client';
import { PaginationArgs } from './pagination';
import { PrismaService } from './prisma.service';
import { pubSub } from './pubsub';
import { mapWebhookSchemaToModel } from './webhook.mapper';
import { WebhookModel } from './webhook.model';
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

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
}
