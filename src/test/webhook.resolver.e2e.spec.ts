import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../app.module';
import { PrismaService } from '../infrastructure/prisma.service';
import { Prisma } from '@prisma/client';
import { createClient } from 'graphql-ws';
import { WsAdapter } from '@nestjs/platform-ws';
import * as WebSocket from 'ws';
import { pathToSearchablePath } from '../helpers/parse-searchable-path/parse-searchable-path.helper';

jest.mock('../helpers/get-hostname/get-hostname.helper');
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';

const hostname = 'webhook.resolver.e2e.spec';
(getHostnameOrLocalhost as jest.Mock).mockImplementation(() => hostname);

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
        path: '/somepath',
        body: {},
        headers: {},
        ip: 'random.ip',
        searchablePath: pathToSearchablePath('/somepath'),
      };
      await prismaService.webhook.create({ data: webhook });
      const res = await request(app.getHttpServer())
        .post(gql)
        .send({
          query: 'query {webhooks {host}}',
        })
        .expect(200);
      expect(Array.isArray(res.body.data.webhooks)).toBe(true);
      for (const receivedWebhook of res.body.data.webhooks) {
        expect(receivedWebhook.host).not.toBe(webhook.host);
      }
    });

    it('should register to subscription based on the host', (done) => {
      const address = app.getHttpServer().listen().address();
      const baseAddress = `ws://[${address.address}]:${address.port}/graphql`;

      const client = createClient({
        url: baseAddress,
        webSocketImpl: WebSocket,
      });

      client.subscribe(
        {
          query: 'subscription {webhookAdded{id}}',
        },
        {
          next: (res) => {
            expect(res).toHaveProperty('data');
            expect(res).not.toHaveProperty('errors');
            client.dispose();
          },
          error: (err) => {
            console.error('Error on subscription', err);
            done.fail();
          },
          complete: () => {
            done();
          },
        },
      );

      client.on('connected', async () => {
        await request(app.getHttpServer())
          .post('/any-path/path-to/webhook')
          .expect(201);
      });
    });
  });
});
