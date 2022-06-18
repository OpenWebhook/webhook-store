import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}
  async sendWebhook(
    host: string,
    body: Readonly<Record<string, any>>,
    headers: Readonly<Record<string, string>>,
    path: string | null,
  ) {
    try {
      const safeHeader = Object.assign({}, headers, { host: null });
      await this.httpService
        .post(path, body, { baseURL: host, headers: safeHeader })
        .toPromise();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          new Error('Could not send the webhook: ' + error.message),
        );
      } else {
        console.error(new Error('Could not send the webhook: ' + error));
      }
    }
  }
}
