import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { taskEither } from 'fp-ts';

import { firstValueFrom } from 'rxjs';
import { copySafeHeaders } from '../helpers/copy-safe-headers/copy-safe-headers.helper';

export type ProxyResponse = taskEither.TaskEither<Error, string>;

@Injectable()
export class SendWebhookService {
  private readonly logger = new Logger(SendWebhookService.name);
  constructor(private readonly httpService: HttpService) {}
  sendWebhook(
    targetUrl: string,
    body: Readonly<Record<string, any>>,
    headers: Readonly<Record<string, string>>,
    path: string,
  ): ProxyResponse {
    return taskEither.tryCatch<Error, string>(
      async () => {
        const safeHeaders = copySafeHeaders(headers);
        this.logger.verbose(`Sending webhook to proxy ${targetUrl}${path}`);
        const response = await firstValueFrom(
          this.httpService.post(path, body, {
            headers: safeHeaders,
            baseURL: targetUrl,
          }),
        );
        this.logger.verbose(`Proxy responded ${response.status}`);
        return 'OK';
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          this.logger.warn(
            new Error('Could not send the webhook: ' + error.message),
          );
          return Error(String(error.message));
        } else {
          this.logger.error(new Error('Could not send the webhook: ' + error));
          return Error(String(error));
        }
      },
    );
  }
}
