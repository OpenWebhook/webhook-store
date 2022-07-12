import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../app.module';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';

const hostname = 'webhook.resolver.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

describe('webhook-path.resolver.ts', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const gql = '/graphql';

  it('returns a value', () => {
    return request(app.getHttpServer())
      .post(gql)
      .send({
        query: 'query {webhookPaths {path}}',
      })
      .expect(200);
  });
});
