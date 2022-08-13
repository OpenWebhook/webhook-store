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

  it('should return a 200', async () => {
    await request(app.getHttpServer())
      .post(gql)
      .send({
        query: `mutation {replayWebhook(webhookId:"wh-croute", target: "coucou.lafrite") {id}}`,
      })
      .expect(200);
  });

  xit('should return a 200', async () => {
    const testRequest = request(app.getHttpServer()).post(
      '/any-path/path-to/webhook',
    );
    const response = await testRequest.expect(201);
    const newWebhookId = response.body.id;

    const res = await request(app.getHttpServer())
      .post(gql)
      .send({
        query: `mutation {replayWebhooks(webhookIds:["${newWebhookId}"]) {webhookId}}`,
      })
      .expect(200);
    console.log(res);
    // create a webhook
    // call mutation to replay the webhook on the proxy target
    // check that a Response was created and return response status and id
  });
});
