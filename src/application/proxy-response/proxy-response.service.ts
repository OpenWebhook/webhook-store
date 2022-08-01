import { Injectable } from '@nestjs/common';
import { Prisma, Webhook, Response } from '@prisma/client';
import { either } from 'fp-ts';
import { rsUuid } from '../../helpers/uuid-generator/uuid-generator.helper';
import { PrismaService } from '../../infrastructure/prisma.service';

type CreateResponseInput = Omit<Prisma.ResponseUncheckedCreateInput, 'id'>;

@Injectable()
export class ProxyResponseService {
  constructor(private prisma: PrismaService) {}
  public async storeResponse(
    webhookId: Webhook['id'],
    response: either.Either<Error, string>,
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
