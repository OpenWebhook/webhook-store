import { Injectable } from '@nestjs/common';
import { Prisma, Webhook, Response } from '@prisma/client';
import { rsUuid } from '../../helpers/uuid-generator/uuid-generator.helper';
import { PrismaService } from '../../infrastructure/prisma.service';
import { ProxyResponse } from '../../infrastructure/send-webhook.service';

type CreateResponseInput = Omit<Prisma.ResponseUncheckedCreateInput, 'id'>;

@Injectable()
export class ProxyResponseService {
  constructor(private prisma: PrismaService) {}
  public async storeResponse(
    webhookId: Webhook['id'],
    response: ProxyResponse,
    target: string,
    host: Webhook['host'],
  ): Promise<Response> {
    const data: CreateResponseInput = {
      webhookId,
      target,
      host,
      hasError: response._tag === 'Left',
    };
    const storedResponse = await this.prisma.response.create({
      data: { ...data, id: rsUuid() },
    });
    return storedResponse;
  }
}
