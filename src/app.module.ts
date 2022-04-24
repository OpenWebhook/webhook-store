import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { WebhookResolver } from './webhook.resolver';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import authConfiguration from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [authConfiguration] }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      introspection: true,
      playground: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
        },
        'subscriptions-transport-ws': true,
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService, WebhookResolver],
})
export class AppModule {}
