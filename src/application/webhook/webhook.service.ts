import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, Webhook } from '@prisma/client';
import {
  pathIsValid,
  pathToSearchablePath,
} from '../../helpers/parse-searchable-path/parse-searchable-path.helper';
import { PrismaService } from '../../infrastructure/prisma.service';
import { pubSub } from '../../infrastructure/pubsub';
import { mapWebhookSchemaToModel } from '../../interface/webhook.mapper';
import { WebhookModel } from '../../interface/webhook.model';
import { WebhookCreatedEvent } from './events/webhook-created.event';
import { WebhooksQueryArgs } from '../../interface/webhooks.query-args';
import { whUuid } from '../../helpers/uuid-generator/uuid-generator.helper';
import { WebhookBodyService } from './webhook-body.service';
import { array, task } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Json } from 'fp-ts/lib/Json';

export type CreateWebhookInput = Pick<
  Prisma.WebhookCreateInput,
  'body' | 'headers' | 'host' | 'path' | 'ip'
>;

@Injectable()
export class WebhookService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private readonly webhookBodyService: WebhookBodyService,
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

  async getWebhooksPath(host: string): Promise<{ path: string }[]> {
    const webhookSearchablePaths = await this.prisma.webhook.groupBy({
      where: { host },
      by: ['searchablePath'],
    });
    const webhookPaths = webhookSearchablePaths.map((obj) => {
      return { path: obj.searchablePath };
    });
    return webhookPaths;
  }

  handleIncomingWebhook(
    body: Json,
    files: Array<Express.Multer.File>,
    headers: Record<string, string>,
    ip: string,
    path: string,
    host: string,
  ): task.Task<Webhook> {
    return pipe(
      this.webhookBodyService.buildBodyWithFiles(body, files || []),
      task.chain((body) => this.addWebhook({ body, headers, ip, path, host })),
    );
  }

  private addWebhook(webhookInput: CreateWebhookInput): task.Task<Webhook> {
    return async () => {
      const data = Object.assign({}, webhookInput, {
        searchablePath: pathToSearchablePath(webhookInput.path),
        id: whUuid(),
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
    };
  }

  private findManyWebhook =
    (skip: number | undefined, take: number | undefined) =>
    (where: Prisma.WebhookWhereInput): task.Task<Webhook[]> =>
    () =>
      this.prisma.webhook.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        where,
      });

  getWebhooks(
    host: string,
    { first, offset, path }: WebhooksQueryArgs,
  ): task.Task<WebhookModel[]> {
    return pipe(
      whereConditionFactory(host, path),
      this.findManyWebhook(offset, first),
      task.map(array.map(mapWebhookSchemaToModel)),
    );
  }

  deleteWebhooks =
    (host: string): task.Task<Prisma.BatchPayload> =>
    () =>
      this.prisma.webhook.deleteMany({ where: { host } });
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
        searchablePath: { contains: validPath },
      },
      {
        host,
        path: { contains: validPath },
      },
    ],
  };
};
