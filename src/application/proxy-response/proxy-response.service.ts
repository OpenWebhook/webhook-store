import { Injectable } from '@nestjs/common';
import { Prisma, Webhook } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';
import { rsUuid } from '../../helpers/uuid-generator/uuid-generator.helper';
import { PrismaService } from '../../infrastructure/prisma.service';

export type ProxyResponse = Either<'err', 'OK'>;

type CreateResponseInput = Omit<Prisma.ResponseUncheckedCreateInput, 'id'>;

@Injectable()
export class ProxyResponseService {
  constructor(private prisma: PrismaService) {}
  public async storeResponse(
    webhookId: Webhook['id'],
    response: ProxyResponse,
    target: string,
  ): Promise<void> {
    const data: CreateResponseInput = {
      webhookId,
      target,
      hasError: response._tag === 'Left',
    };
    await this.prisma.response.create({
      data: { ...data, id: rsUuid() },
    });
  }
}
