import { Injectable } from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { Either } from 'fp-ts/lib/Either';

export type ProxyResponse = Either<'err', 'OK'>;

@Injectable()
export class ProxyResponseService {
  public storeResponse(
    webhookId: Webhook['id'],
    response: ProxyResponse,
  ): void {
    console.log(webhookId);
    console.log(response);
  }
}
