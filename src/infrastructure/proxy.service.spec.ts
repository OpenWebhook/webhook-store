import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { ProxyService } from './proxy.service';
import { of, throwError } from 'rxjs';

describe('proxy.servce.ts', () => {
  let proxyService: ProxyService;
  let httpService: HttpService;

  beforeAll(() => {
    httpService = new HttpService();
    proxyService = new ProxyService(httpService);
  });

  it('should call postmethod', async () => {
    const result: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(result));
    expect(proxyService).toBeDefined();
    await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
  });

  it('should not throw if post fails with axios error', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce(() =>
        throwError(() => new AxiosError('Page not found')),
      );
    expect(proxyService).toBeDefined();
    await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
  });

  it('should not throw if post fails with random error', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce(() =>
        throwError(() => new Error("Network error can't connect to server")),
      );
    expect(proxyService).toBeDefined();
    await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
  });
});
