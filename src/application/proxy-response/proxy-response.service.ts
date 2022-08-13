import { Injectable, Logger } from '@nestjs/common';
import { Webhook, Response } from '@prisma/client';
import { either, taskEither } from 'fp-ts';
import { rsUuid } from '../../helpers/uuid-generator/uuid-generator.helper';
import { PrismaService } from '../../infrastructure/prisma.service';

@Injectable()
export class ProxyResponseService {
  private readonly logger = new Logger(ProxyResponseService.name);
  constructor(private prisma: PrismaService) {}

  public storeResponse(
    webhookId: Webhook['id'],
    response: either.Either<Error, string>,
    target: string,
    host: Webhook['host'],
  ): taskEither.TaskEither<Error, Response> {
    return taskEither.tryCatch(
      async () => {
        const data = {
          id: rsUuid(),
          webhookId,
          target,
          host,
          hasError: response._tag === 'Left',
        };
        const storedResponse = await this.prisma.response.create({
          data,
        });
        return storedResponse;
      },
      (error: unknown) => {
        if (error instanceof Error) {
          this.logger.error(error);
          return error;
        }
        this.logger.error(String(error));
        return new Error(String(error));
      },
    );
  }
}
