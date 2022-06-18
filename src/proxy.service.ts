import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';

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
      const safeHeaders = this.copySafeHeaders(headers);
      console.log(`Sending webhook to proxy ${host} ${path}`);
      const response = await firstValueFrom(
        this.httpService.post(path, body, {
          headers: safeHeaders,
          baseURL: host,
        }),
      );
      console.log(`Proxy responded ${response.status}`);
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

  private copySafeHeaders(
    headers: Readonly<Record<string, string>>,
  ): Record<string, string> {
    const UNSAFE_HEADERS_REGEXP =
      /^(?:host|origin|cookie|user-agent|content-length|version|cdn-loop|cf-ray|x-scheme|x-real-ip|cf-ipcountry|x-request-id|x-forwarded-for|cf-connecting-ip|x-forwarded-host|x-forwarded-port|x-forwarded-proto|x-forwarded-scheme|x-original-forwarded-for)$/i;
    const safeHeaders = Object.entries(headers).reduce((acc, [key, value]) => {
      if (!key.match(UNSAFE_HEADERS_REGEXP)) {
        acc[key] = value;
      }

      return acc;
    }, {});
    return safeHeaders;
  }
}
