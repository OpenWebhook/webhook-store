import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { ProxyService } from './proxy.service';
import { of, throwError } from 'rxjs';
import { right, left } from 'fp-ts/lib/Either';

describe('proxy.service.ts', () => {
  let proxyService: ProxyService;
  let httpService: HttpService;

  beforeAll(() => {
    httpService = new HttpService();
    proxyService = new ProxyService(httpService);
  });

  describe('Happy path', () => {
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
  });

  describe('Error path', () => {
    const mockPostToTrhowError = (err: any) => {
      jest
        .spyOn(httpService, 'post')
        .mockImplementationOnce(() => throwError(() => err));
    };

    it('should not throw if post fails with axios error', async () => {
      mockPostToTrhowError(new AxiosError('Page not found'));
      const res = await proxyService.sendWebhook('unkownUrl', {}, {}, '');
      expect(httpService.post).toHaveBeenCalled();
      expect(res).toEqual(left('err'));
    });

    it('should not throw if post fails with random error', async () => {
      mockPostToTrhowError(new Error("Network error can't connect to server"));
      const res = await proxyService.sendWebhook('invalidurl', {}, {}, '');
      expect(res).toEqual(left('err'));
    });
  });
});
