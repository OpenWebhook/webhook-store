// /test/customer.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma.service';
import { Prisma } from '@prisma/client';
import { WsAdapter } from '@nestjs/platform-ws';
import { pathToSearchablePath } from '../helpers/parse-searchable-path/parse-searchable-path.helper';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { whUuid } from '../helpers/uuid-generator/uuid-generator.helper';

const hostname = 'webhook.resolver.filters.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

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
    await prismaService.webhook.deleteMany({ where: { host: hostname } });
    const webhookPath1 = {
      host: hostname,
      path: '/path1',
      body: {},
      headers: {},
      ip: 'random.ip',
      searchablePath: pathToSearchablePath('/path1'),
    };
    const webhookPath2 = Object.assign({}, webhookPath1, {
      path: '/path2',
      searchablePath: pathToSearchablePath('/path2'),
    });
    await prismaService.webhook.createMany({
      data: new Array(2).fill(undefined).map(() => {
        return { id: whUuid(), ...webhookPath2 };
      }),
    });
    await prismaService.webhook.createMany({
      data: new Array(5).fill(undefined).map(() => {
        return { id: whUuid(), ...webhookPath1 };
      }),
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
          query: 'query {webhooks(path: "/path2") {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.path).toBe('/path2');
      }
    });

    it('should get only 2 the webhooks with path = path2 with first = 3', async () => {
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(path: "/path2", first: 3) {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.path).toBe('/path2');
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
        expect(receivedWebhook.path).toBe('/path2');
      }
    });
  });

  describe('Search in path', () => {
    it('should find the webhook that starts with the search param', async () => {
      const paths = [
        '/path/to/search/for/this/path',
        '/path/to/search/for/that/path',
        '/path/not/to/search/for/that/path',
      ];
      const webhookWithComplexPath: Prisma.WebhookCreateInput[] = paths.map(
        (path) => ({
          id: whUuid(),
          host: hostname,
          path,
          body: {},
          headers: {},
          ip: 'random.ip',
          searchablePath: pathToSearchablePath(path),
        }),
      );
      await prismaService.webhook.createMany({ data: webhookWithComplexPath });
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(path: "/path/to/search") {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
    });
    it('should find webhooks with id instead of wildcard', async () => {
      const paths = [
        '/organisation/1234/invoice/5432',
        '/organisation/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/invoice/05108a6f-d8ac-43b0-92d1-bb16d4c79c25',
        '/sould/not/be/in/path',
      ];
      const webhookWithComplexPath: Prisma.WebhookCreateInput[] = paths.map(
        (path) => ({
          id: whUuid(),
          host: hostname,
          path,
          body: {},
          headers: {},
          ip: 'random.ip',
          searchablePath: pathToSearchablePath(path),
        }),
      );
      await prismaService.webhook.createMany({ data: webhookWithComplexPath });
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query:
            'query {webhooks(path: "/organisation/:id/invoice/:id") {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(2);
    });

    it('should find webhooks with exact id', async () => {
      const paths = [
        '/organisation/123432/update',
        '/organisation/123432/create',
        '/organisation/123432/delete',
      ];
      const webhookWithComplexPath: Prisma.WebhookCreateInput[] = paths.map(
        (path) => ({
          id: whUuid(),
          host: hostname,
          path,
          body: {},
          headers: {},
          ip: 'random.ip',
          searchablePath: pathToSearchablePath(path),
        }),
      );
      await prismaService.webhook.createMany({ data: webhookWithComplexPath });
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks(path: "/123432") {path}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      expect(res.body.data.webhooks).toHaveLength(3);
    });
  });
});
