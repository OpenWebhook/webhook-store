import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../app.module';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { PrismaService } from '../infrastructure/prisma.service';

const hostname = 'webhook-path.resolver.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

describe('replay-webhook.resolver', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);

    await app.init();
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
  });

  const gql = '/graphql';

  it('should return a 200 with errors', async () => {
    const res = await request(app.getHttpServer())
      .post(gql)
      .send({
        query: `mutation {replayWebhook(webhookId:"wh-croute", target: "coucou.lafrite") {id}}`,
      })
      .expect(200);
    expect(res.error).toBeDefined();
  });

  it('should return a 200', async () => {
    const testRequest = request(app.getHttpServer()).post(
      '/any-path/path-to/webhook',
    );
    const response = await testRequest.expect(201);
    const newWebhookId = response.body.id;

    const res = await request(app.getHttpServer())
      .post(gql)
      .send({
        query: `mutation {replayWebhook(webhookId:"${newWebhookId}", target: "coucou.lafrite") {webhookId, id}}`,
      })
      .expect(200);

    expect(res.body.data.replayWebhook.webhookId).toBe(newWebhookId);
    const responseId: string = res.body.data.replayWebhook.id;
    expect(responseId).toBeDefined();
    expect(responseId.startsWith('rs-')).toBeTruthy();
  });
});
