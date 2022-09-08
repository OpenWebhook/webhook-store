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
        const hasError = either.isLeft(response);
        const data = {
          id: rsUuid(),
          webhookId,
          target,
          host,
          hasError,
        };
        const storedResponse = await this.prisma.response.create({
          data,
        });
        return storedResponse;
      },
      (unkownError: unknown) => {
        const error =
          unkownError instanceof Error
            ? unkownError
            : new Error(String(unkownError));

        this.logger.error(error);
        return error;
      },
    );
  }
}
