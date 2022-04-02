import { Injectable } from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { pubSub } from './pubsub';
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    const webhooks = await this.prisma.webhook.findMany({});
    return `${webhooks.length} Hello World!`;
  }

  async addWebhook(): Promise<Webhook> {
    const webhook = await this.prisma.webhook.create({});
    pubSub.publish('webhookAdded', { webhookAdded: webhook });
    return webhook;
  }

  async getWebhooks() {
    return this.prisma.webhook.findMany({});
  }

  async deleteWebhooks() {
    return this.prisma.webhook.deleteMany({});
  }
}
