import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma.service';
import { Prisma, Webhook } from '@prisma/client';
import { pathToSearchablePath } from '../helpers/parse-searchable-path/parse-searchable-path.helper';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { whUuid } from '../helpers/uuid-generator/uuid-generator.helper';

const hostname = 'app.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

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
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const { text } = await request(app.getHttpServer())
      .get('/count-webhooks')
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
    if (storedWebhook == null) throw new Error('Webhook not found in test');
    expect(storedWebhook.host).toBe(hostname);
  });

  it('/ gets only webhooks on same host', async () => {
    const webhook: Prisma.WebhookCreateInput = {
      id: whUuid(),
      host: 'not_localhost',
      path: '/somepath',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/somepath'),
    };
    await prismaService.webhook.create({ data: webhook });

    return request(app.getHttpServer())
      .get('/count-webhooks')
      .expect(200)
      .expect(`There are 0 webhooks on ${hostname}!`);
  });

  it('/* (POST) a multipart form data', () => {
    return request(app.getHttpServer())
      .post('/multipart-form-data')
      .field('api_key', 'abcd')
      .expect(201);
  });

  it('/ (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/store-metadata')
      .expect(200);
    console.log(res);
    expect(res.text).toMatch(/(authMetadata)/i);
  });
});
