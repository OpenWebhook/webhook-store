import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/prisma.service';
import * as xmlparser from 'express-xml-bodyparser';
import { clientProxy } from './client-proxy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(xmlparser());
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.use('/*', clientProxy);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
