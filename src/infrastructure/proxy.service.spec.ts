import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { ProxyService } from './proxy.service';
import { of, throwError } from 'rxjs';
import { right, left } from 'fp-ts/lib/Either';

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
    const res = await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
    expect(res).toEqual(right('OK'));
  });

  it('should not throw if post fails with axios error', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce(() =>
        throwError(() => new AxiosError('Page not found')),
      );
    expect(proxyService).toBeDefined();
    const res = await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
    expect(res).toEqual(left('err'));
  });

  it('should not throw if post fails with random error', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockImplementationOnce(() =>
        throwError(() => new Error("Network error can't connect to server")),
      );
    expect(proxyService).toBeDefined();
    const res = await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
    expect(res).toEqual(left('err'));
  });
});
