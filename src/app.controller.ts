import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Next,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from '@prisma/client';
import { NextFunction } from 'express';
import { AppService } from './app.service';
import { getHostnameOrLocalhost } from './get-hostname';
import { ProxyService } from './proxy.service';

@Controller()
export class AppController {
  private readonly defaultHost: string | null;
  constructor(
    private readonly appService: AppService,
    private readonly proxyService: ProxyService,
    configService: ConfigService,
  ) {
    this.defaultHost = configService.get('defaultHost');
  }

  @Get('/hello')
  getHello(@Req() req): Promise<string> {
    return this.appService.getCount(req.hostname);
  }

  @Get('/webhooks-per-host')
  getWebhooksGroupByHosts(): Promise<any> {
    return this.appService.getWebhooksPerHosts();
  }

  @Post('/*')
  async createWebhookWithoutPath(
    @Body() body,
    @Ip() ip,
    @Headers() headers,
    @Param() params: string[],
    @Next() next: NextFunction,
    @Res() res,
    @Req() req,
  ): Promise<Webhook | void> {
    const path = params['0'] ? `/${params['0']}` : '/';
    if (path === '/graphql') {
      return next();
    }
    console.log(`Webhook received on ${path}`);
    if (this.defaultHost) {
      this.proxyService.sendWebhook(this.defaultHost, body, headers, path);
    }

    const webhook = await this.appService.addWebhook({
      body,
      headers,
      ip,
      path,
      host: getHostnameOrLocalhost(req.hostname),
    });
    return res.send(webhook);
  }

  @Delete()
  deleteWebhooks(@Req() req): Promise<{ count: number }> {
    return this.appService.deleteWebhooks(req.hostname);
  }
}
