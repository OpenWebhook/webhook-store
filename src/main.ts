import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/prisma.service';
import * as xmlparser from 'express-xml-bodyparser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(xmlparser());
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
