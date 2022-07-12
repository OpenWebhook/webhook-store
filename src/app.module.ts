import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import webhookConfig from './config/webhook.config';

import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './interface/app.controller';
import { AppService } from './application/webhook/webhook.service';
import { getHostnameOrLocalhost } from './helpers/get-hostname/get-hostname.helper';
import { PrismaService } from './infrastructure/prisma.service';
import { WebhookResolver } from './interface/webhook.resolver';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebhookReceptionService } from './application/webhook/webhook-reception.service';
import { SendWebhookService } from './infrastructure/send-webhook.service';
import { HttpModule } from '@nestjs/axios';
import { ProxyResponseService } from './application/proxy-response/proxy-response.service';
import { ProxyService } from './application/proxy-response/proxy.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/interface/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
          onConnect: (context: any) => {
            const { extra } = context;
            extra.extractedHost = getHostnameOrLocalhost(
              extra?.request?.headers?.host,
            );
            return extra;
          },
        },
        'subscriptions-transport-ws': true,
      },
      context: ({ extra }) => {
        if (extra) {
          return { extractedHost: extra.extractedHost };
        }
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({ load: [webhookConfig] }),
    EventEmitterModule.forRoot(),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AppService,
    ProxyResponseService,
    SendWebhookService,
    WebhookResolver,
    WebhookReceptionService,
    ProxyService,
  ],
})
export class AppModule {}
