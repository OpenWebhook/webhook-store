import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import webhookConfig from './config/webhook.config';
import s3BucketConfig from './config/s3-bucket.config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './interface/app.controller';
import { WebhookService } from './application/webhook/webhook.service';
import { getHostnameOrLocalhost } from './helpers/get-hostname/get-hostname.helper';
import { PrismaService } from './infrastructure/prisma.service';
import { WebhookResolver } from './interface/webhook.resolver';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebhookAfterReceptionService } from './application/webhook/webhook-after-reception.service';
import { SendWebhookService } from './infrastructure/send-webhook.service';
import { HttpModule } from '@nestjs/axios';
import { ProxyResponseService } from './application/proxy-response/proxy-response.service';
import { ProxyService } from './application/proxy-response/proxy.service';
import { WebhookPathResolver } from './interface/webhook-path.resolver';
import { FileUploadService } from './infrastructure/file-upload.service';
import { WebhookBodyService } from './application/webhook/webhook-body.service';
import { option } from 'fp-ts';
import { WsContext } from './interface/context.type';
import { ReplayWebhookResolver } from './interface/replay-webhook.resolver';
import { AuthModule } from './application/auth/auth.module';
import authConfig from './config/auth.config';

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
              option.fromNullable(extra?.request?.headers?.host),
            );
            return extra;
          },
        },
        'subscriptions-transport-ws': true,
      },
      context: ({ extra }): WsContext | void => {
        if (extra) {
          return { extractedHost: extra.extractedHost };
        }
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    ConfigModule.forRoot({ load: [webhookConfig, s3BucketConfig, authConfig] }),
    EventEmitterModule.forRoot(),
    HttpModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    FileUploadService,
    WebhookService,
    WebhookBodyService,
    ProxyResponseService,
    SendWebhookService,
    WebhookResolver,
    WebhookPathResolver,
    WebhookAfterReceptionService,
    ProxyService,
    ReplayWebhookResolver,
  ],
})
export class AppModule {}
