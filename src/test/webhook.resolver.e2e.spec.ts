// /test/customer.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

describe('CustomerResolver (e2e)', () => {
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

  const gql = '/graphql';

  describe('getWebhooks', () => {
    it('should get empty array', () => {
      return request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks {id}}',
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data.webhooks)).toBe(true);
        });
    });

    it('should get empty array with webhooks from other hosts in database', async () => {
      const webhook: Prisma.WebhookCreateInput = {
        host: 'not_localhost',
        path: 'somepath',
        body: {},
        headers: {},
        ip: '23.23.123.12',
      };
      await prismaService.webhook.create({ data: webhook });
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks {id}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks.length).toBe(0);
    });
  });
});
