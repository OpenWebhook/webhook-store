import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { Prisma, Webhook } from '@prisma/client';
import { pathToSearchablePath } from '../helpers/parse-searchable-path/parse-searchable-path.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    await app.init();
    await prismaService.webhook.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const { text } = await request(app.getHttpServer())
      .get('/hello')
      .expect(200);
    expect(text).toMatch(/(There are)/i);
    expect(text).toMatch(/(webhooks on)/i);
  });

  it('/* (POST)', () => {
    return request(app.getHttpServer())
      .post('/any-path/path-to/webhook')
      .expect(201);
  });

  it('/ (POST)', () => {
    return request(app.getHttpServer()).post('/').expect(201);
  });

  it('/* (POST) with hostname', async () => {
    const testRequest = request(app.getHttpServer()).post(
      '/any-path/path-to/webhook',
    );
    const response = await testRequest.expect(201);
    const newWebhook: Webhook = response.body;
    const storedWebhook = await prismaService.webhook.findUnique({
      where: { id: newWebhook.id },
    });

    expect(storedWebhook.host).toBe('localhost');
  });

  it('/ gets only webhooks on same host', async () => {
    const webhook: Prisma.WebhookCreateInput = {
      host: 'not_localhost',
      path: '/somepath',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/somepath'),
    };
    await prismaService.webhook.create({ data: webhook });

    return request(app.getHttpServer())
      .get('/hello')
      .expect(200)
      .expect('There are 0 webhooks on 127.0.0.1!');
  });
});
