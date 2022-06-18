// /test/customer.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { WsAdapter } from '@nestjs/platform-ws';

describe('CustomerResolver (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get(PrismaService);
    app.useWebSocketAdapter(new WsAdapter(app));
    await app.init();
    await prismaService.webhook.deleteMany();
    const webhookPath1: Prisma.WebhookCreateInput = {
      host: '127.0.0.1',
      path: 'path1',
      body: {},
      headers: {},
      ip: 'random.ip',
    };
    const webhookPath2 = Object.assign({}, webhookPath1, { path: 'path2' });
    await prismaService.webhook.createMany({
      data: [
        webhookPath1,
        webhookPath1,
        webhookPath1,
        webhookPath1,
        webhookPath1,
        webhookPath2,
        webhookPath2,
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const gql = '/graphql';

  describe('pagination and filters', () => {
    it('should get all webhooks if there is no filters', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks {host}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(7);
    });
    it('should get the first 3 webhooks if there is first = 3', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(first: 3) {host}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(3);
    });

    it('should get the webhooks with path = path2 only', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(path: "path2") {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.path).toBe('path2');
      }
    });

    it('should get only 2 the webhooks with path = path2 with first = 3', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(path: "path2", first: 3) {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.path).toBe('path2');
      }
    });

    it('should get the 2 webhooks with path2 with an offset of 5', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(first: 3, offset: 5) {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.path).toBe('path2');
      }
    });
  });
});
