// /test/customer.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';

describe('CustomerResolver (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
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
          expect(res.body.data.webhooks).toEqual([]);
        });
    });
  });
});
