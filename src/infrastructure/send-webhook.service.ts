import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TaskEither, tryCatch } from 'fp-ts/TaskEither';

import { firstValueFrom } from 'rxjs';
import { copySafeHeaders } from '../helpers/copy-safe-headers/copy-safe-headers.helper';

export type ProxyResponse = TaskEither<Error, string>;

@Injectable()
export class SendWebhookService {
  constructor(private readonly httpService: HttpService) {}
  sendWebhook(
    targetUrl: string,
    body: Readonly<Record<string, any>>,
    headers: Readonly<Record<string, string>>,
    path: string,
  ): ProxyResponse {
    return tryCatch<Error, string>(
      async () => {
        const safeHeaders = copySafeHeaders(headers);
        console.log(`Sending webhook to proxy ${targetUrl}${path}`);
        const response = await firstValueFrom(
          this.httpService.post(path, body, {
            headers: safeHeaders,
            baseURL: targetUrl,
          }),
        );
        console.log(`Proxy responded ${response.status}`);
        return 'OK';
      },
      (error) => {
        if (axios.isAxiosError(error)) {
          console.error(
            new Error('Could not send the webhook: ' + error.message),
          );
          return Error(String(error.message));
        } else {
          console.error(new Error('Could not send the webhook: ' + error));
          return Error(String(error));
        }
      },
    );
  }
}
