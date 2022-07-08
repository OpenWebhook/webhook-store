import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ProxyService } from './proxy.service';
import { of } from 'rxjs';

describe('proxy.servce.ts', () => {
  let proxyService: ProxyService;
  let httpService: HttpService;
  beforeAll(() => {
    httpService = new HttpService();
    const result: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };
    jest.spyOn(httpService, 'post').mockImplementationOnce(() => of(result));
    proxyService = new ProxyService(httpService);
  });
  it('should call postmethod', async () => {
    expect(proxyService).toBeDefined();
    await proxyService.sendWebhook('', {}, {}, '');
    expect(httpService.post).toHaveBeenCalled();
  });
});
