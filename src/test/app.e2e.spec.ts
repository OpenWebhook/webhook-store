import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma.service';

describe('AppController (e2e)', () => {
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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('0 Hello World!');
  });

  it('/* (POST)', () => {
    return request(app.getHttpServer())
      .post('/any-path/path-to/webhook')
      .expect(201);
  });

  it('/ (POST)', () => {
    return request(app.getHttpServer()).post('/').expect(201);
  });
});
