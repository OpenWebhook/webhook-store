import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getHostnameOrLocalhost } from './get-hostname';
import { PrismaService } from './prisma.service';
import { WebhookResolver } from './webhook.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
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
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService, WebhookResolver],
})
export class AppModule {}
