import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { Prisma, Webhook } from '@prisma/client';
import { WebhookAfterReceptionService } from './webhook-after-reception.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { pathToSearchablePath } from '../../helpers/parse-searchable-path/parse-searchable-path.helper';

jest.mock('../../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../../helpers/get-hostname/get-hostname.helper';
import { whUuid } from '../../helpers/uuid-generator/uuid-generator.helper';

const hostname = 'webhook-reception.service.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let webhookReceptionService: WebhookAfterReceptionService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    webhookReceptionService = app.get(WebhookAfterReceptionService);
    await app.init();
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
  });

  afterEach(async () => {
    await app.close();
  });

  it('/* (POST) 20 webhooks but keep 10', async () => {
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    await request(app.getHttpServer()).post('/any-path/path-to/webhook');
    const testRequest = request(app.getHttpServer()).post(
      '/any-path/path-to/webhook',
    );
    const response = await testRequest.expect(201);
    const newWebhook: Webhook = response.body;
    const storedWebhook = await prismaService.webhook.findUnique({
      where: { id: newWebhook.id },
    });
    if (storedWebhook == null) throw new Error('Webhook not found in test');
    await webhookReceptionService.deleteOldWebhooks(storedWebhook.host, 10);

    const { text } = await request(app.getHttpServer())
      .get('/count-webhooks')
      .expect(200);

    expect(text).toBe(`There are 10 webhooks on ${hostname}!`);
  });

  it('Does not delete webhooks from other hosts', async () => {
    const webhookNotLocalhost: Prisma.WebhookCreateInput = {
      id: whUuid(),
      host: 'not_localhost',
      path: '/somepath',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/somepath'),
    };

    const webhook: Prisma.WebhookCreateInput = {
      id: whUuid(),
      host: hostname,
      path: '/somepath',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/somepath'),
    };
    const storedWebhookNotLocalhost = await prismaService.webhook.create({
      data: webhookNotLocalhost,
    });
    const storedWebhook = await prismaService.webhook.create({ data: webhook });

    await webhookReceptionService.deleteOldWebhooks(storedWebhook.host, 10);
    const stillPresentWebhook = await prismaService.webhook.findUnique({
      where: { id: storedWebhookNotLocalhost.id },
    });

    expect(stillPresentWebhook).not.toBeNull();
  });
});
