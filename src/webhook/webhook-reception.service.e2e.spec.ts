import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { Prisma, Webhook } from '@prisma/client';
import { WebhookReceptionService } from './webhook-reception.service';
import { PrismaService } from '../prisma.service';
import { pathToSearchablePath } from '../helpers/parse-searchable-path/parse-searchable-path.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let webhookReceptionService: WebhookReceptionService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    webhookReceptionService = app.get(WebhookReceptionService);
    await app.init();
    await prismaService.webhook.deleteMany();
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

    await webhookReceptionService.deleteOldWebhooks(storedWebhook.host, 10);

    const { text } = await request(app.getHttpServer())
      .get('/hello')
      .expect(200);

    expect(text).toBe('There are 0 webhooks on 127.0.0.1!');
  });

  it('Does not delete webhooks from other hosts', async () => {
    const webhookNotLocalhost: Prisma.WebhookCreateInput = {
      host: 'not_localhost',
      path: '/somepath',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/somepath'),
    };

    const webhook: Prisma.WebhookCreateInput = {
      host: 'localhost',
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
