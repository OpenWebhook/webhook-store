import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { SendWebhookService } from './send-webhook.service';
import { of, throwError } from 'rxjs';
import { either } from 'fp-ts';

describe('proxy.service.ts', () => {
  let proxyService: SendWebhookService;
  let httpService: HttpService;

  beforeAll(() => {
    httpService = new HttpService();
    proxyService = new SendWebhookService(httpService);
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
      const res = await proxyService.sendWebhook('', {}, {}, '')();
      expect(httpService.post).toHaveBeenCalled();
      expect(res).toEqual(either.right('OK'));
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
      const res = await proxyService.sendWebhook('unkownUrl', {}, {}, '')();
      expect(httpService.post).toHaveBeenCalled();
      expect(res).toEqual(either.left(new Error('Page not found')));
    });

    it('should not throw if post fails with random error', async () => {
      mockPostToTrhowError("Network error can't connect to server");
      const res = await proxyService.sendWebhook('invalidurl', {}, {}, '')();
      expect(res).toEqual(
        either.left(new Error("Network error can't connect to server")),
      );
    });
  });
});
