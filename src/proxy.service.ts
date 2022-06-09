import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  constructor(private readonly httpService: HttpService) {}
  async sendWebhook(
    host: string,
    body: Record<string, any>,
    headers: Record<string, string>,
    path: string | null,
  ) {
    try {
      delete headers.host;
      await this.httpService
        .post(path, body, { baseURL: host, headers })
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
