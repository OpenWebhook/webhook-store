import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './infrastructure/prisma.service';
import * as xmlparser from 'express-xml-bodyparser';
import { createProxyMiddleware } from 'http-proxy-middleware';

const CLIENT_URL = 'https://demo.openwebhook.io/';

const pathFilter = function (path: string, req: any) {
  return req.method === 'GET' && path !== '/graphql' && path !== '/playground';
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(xmlparser());
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  app.use(
    '/*',
    createProxyMiddleware(pathFilter, {
      target: CLIENT_URL,
      changeOrigin: true,
      // eslint-disable-next-line prettier/prettier
      pathRewrite: { '^(.(?!.*.css$|.*.js.map$|.*.js$|.*.html))*$': '' },
    }),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
