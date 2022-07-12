import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { left, right } from 'fp-ts/lib/Either';
import { firstValueFrom } from 'rxjs';
import { ProxyResponse } from '../application/proxy-response/proxy-response.service';
import { copySafeHeaders } from '../helpers/copy-safe-headers/copy-safe-headers.helper';

@Injectable()
export class SendWebhookService {
  constructor(private readonly httpService: HttpService) {}
  async sendWebhook(
    targetUrl: string,
    body: Readonly<Record<string, any>>,
    headers: Readonly<Record<string, string>>,
    path: string,
  ): Promise<ProxyResponse> {
    try {
      const safeHeaders = copySafeHeaders(headers);
      console.log(`Sending webhook to proxy ${targetUrl} ${path}`);
      const response = await firstValueFrom(
        this.httpService.post(path, body, {
          headers: safeHeaders,
          baseURL: targetUrl,
        }),
      );
      console.log(`Proxy responded ${response.status}`);
      return right('OK');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          new Error('Could not send the webhook: ' + error.message),
        );
        return left('err');
      } else {
        console.error(new Error('Could not send the webhook: ' + error));
        return left('err');
      }
    }
  }
}
