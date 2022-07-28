import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../app.module';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { PrismaService } from '../infrastructure/prisma.service';

const hostname = 'webhook-path.resolver.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

describe('webhook-path.resolver.ts', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const prismaService = app.get(PrismaService);

    await app.init();
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
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

  it('returns the list of path', async () => {
    const path1 = '/any-path/path-to/webhook';
    const path2 = '/second-path/path-to/webhook';
    await request(app.getHttpServer()).post(path1);
    await request(app.getHttpServer()).post(path1);
    await request(app.getHttpServer()).post(path1);
    await request(app.getHttpServer()).post(path1);
    await request(app.getHttpServer()).post(path2);

    return request(app.getHttpServer())
      .post(gql)
      .send({
        query: 'query {webhookPaths {path}}',
      })
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data.webhookPaths)).toBe(true);
        expect(res.body.data.webhookPaths).toHaveLength(2);
        expect(res.body.data.webhookPaths).toContainEqual({
          path: path1,
        });
        expect(res.body.data.webhookPaths).toContainEqual({
          path: path2,
        });
      });
  });
});
