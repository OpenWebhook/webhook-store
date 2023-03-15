import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma.service';
import { WsAdapter } from '@nestjs/platform-ws';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
jest.mock('../config/auth.config');
import authConfig from '../config/auth.config';

const hostname = 'webhook.resolver.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

(authConfig as unknown as jest.Mock).mockReturnValue({
  jwksUri:
    process.env.JWKS_URI ||
    `https://openwebhook-auth.herokuapp.com/.well-known/jwks.json`,
  isProtected: true,
  adminPassword: 'adminPassword',
});

describe('CustomerResolver (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
  });

  afterEach(async () => {
    await app.close();
  });

  const gql = '/graphql';

  describe('getWebhooks', () => {
    it('should get an error if un authenticated', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks {id}}',
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBeFalsy();
          expect(res.body.errors[0].message).toBe('Unauthorized');
        });
    });

    it('/webhooks-per-host (GET) returns an error if not admin', async () => {
      return request(app.getHttpServer()).get('/webhooks-per-host').expect(401);
    });

    it('/webhooks-per-host (GET) returns an error if not admin', async () => {
      request(app.getHttpServer())
        .get('/webhooks-per-host')
        .set('Authorization', 'Basic admin:adminPassword')
        .expect(201);
    });
  });
});
