import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    await this.prisma.webhook.create({});
    const webhooks = await this.prisma.webhook.findMany({});
    await this.prisma.webhook.deleteMany({});
    return `${webhooks} Hello World!`;
  }
}
