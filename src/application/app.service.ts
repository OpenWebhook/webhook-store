import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, Webhook } from '@prisma/client';
import {
  pathIsValid,
  pathToSearchablePath,
} from '../helpers/parse-searchable-path/parse-searchable-path.helper';
import { PrismaService } from '../infrastructure/prisma.service';
import { pubSub } from '../infrastructure/pubsub';
import { mapWebhookSchemaToModel } from '../interface/webhook.mapper';
import { WebhookModel } from '../interface/webhook.model';
import { WebhookCreatedEvent } from './webhook/events/webhook-created.event';
import { WebhooksQueryArgs } from '../interface/webhooks.query-args';

type CreateWebhookInput = Pick<
  Prisma.WebhookCreateInput,
  'body' | 'headers' | 'host' | 'path' | 'ip'
>;

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

  async addWebhook(webhookInput: CreateWebhookInput): Promise<Webhook> {
    const data = Object.assign({}, webhookInput, {
      searchablePath: pathToSearchablePath(webhookInput.path),
    });
    const webhook = await this.prisma.webhook.create({ data });
    pubSub.publish(`webhookAdded_${webhook.host}`, {
      webhookAdded: mapWebhookSchemaToModel(webhook),
    });

    this.eventEmitter.emit(
      WebhookCreatedEvent.name,
      new WebhookCreatedEvent(webhook.id, webhook.host),
    );

    return webhook;
  }

  async getWebhooks(
    host: string,
    queryArgs: WebhooksQueryArgs,
  ): Promise<WebhookModel[]> {
    const { first, offset, path } = queryArgs;
    const where = whereConditionFactory(host, path);
    const webhooks = await this.prisma.webhook.findMany({
      skip: offset,
      take: first,
      orderBy: { createdAt: 'desc' },
      where,
    });
    return webhooks.map(mapWebhookSchemaToModel);
  }

  async deleteWebhooks(host: string) {
    return this.prisma.webhook.deleteMany({ where: { host } });
  }
}

const whereConditionFactory = (
  host: string,
  path: string | undefined,
): Prisma.WebhookWhereInput => {
  const validPath = pathIsValid(path) ? path : undefined;
  if (validPath == undefined) {
    return { host };
  }
  return {
    OR: [
      {
        host,
        searchablePath: { startsWith: validPath },
      },
      {
        host,
        path: { startsWith: validPath },
      },
    ],
  };
};
