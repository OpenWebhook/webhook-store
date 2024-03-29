jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';

jest.mock('../config/webhook.config');
import config from '../config/webhook.config';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma.service';
import { SendWebhookService } from '../infrastructure/send-webhook.service';
import { ProxyResponseService } from '../application/proxy-response/proxy-response.service';
import { either } from 'fp-ts';
import { none, some } from 'fp-ts/lib/Option';
import { ProxyService } from '../application/proxy-response/proxy.service';

const hostname = 'proxy-response.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

(config as unknown as jest.Mock).mockReturnValue({
  maxStoredWebhookPerHost: none,
  defaultHost: some(['target1']),
});

describe('Proxy service (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let proxyResponseService: ProxyResponseService;
  const sendWebhookMock = jest.fn();
  const sendAndStoreWebhookToTargets = jest.fn();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SendWebhookService)
      .useValue({ sendWebhook: sendWebhookMock })
      .overrideProvider(ProxyService)
      .useValue({ sendAndStoreWebhookToTargets: sendAndStoreWebhookToTargets })
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    proxyResponseService = app.get(ProxyResponseService);
    await app.init();
    await prismaService.response.deleteMany({ where: { host: hostname } });
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Calls the sendWebhook method if there are targets defined in env', async () => {
    await request(app.getHttpServer())
      .post('/any-path/path-to/webhook')
      .expect(201);

    expect(sendAndStoreWebhookToTargets).toHaveBeenCalled();
  });

  it('Stores a response with hasError false if there are no errors', async () => {
    const proxyResponse = either.right('OK');
    const webhook = await request(app.getHttpServer())
      .post('/any-path/path-to/webhook')
      .expect(201);

    const result = await proxyResponseService.storeResponse(
      webhook.body.id,
      proxyResponse,
      'target1',
      hostname,
    )();

    if (either.isLeft(result)) {
      throw result.left;
    }

    const response = result.right;
    expect(response.id).toBeDefined();
    expect(response.hasError).toBeFalsy();
  });

  it('Stores a response with hasError false if there are no errors', async () => {
    const proxyResponse = either.left(new Error('err'));
    const webhook = await request(app.getHttpServer())
      .post('/any-path/path-to/webhook')
      .expect(201);

    const result = await proxyResponseService.storeResponse(
      webhook.body.id,
      proxyResponse,
      'target1',
      hostname,
    )();

    if (either.isLeft(result)) {
      throw result.left;
    }

    const response = result.right;
    expect(response.id).toBeDefined();
    expect(response.hasError).toBeTruthy();
  });
});
