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
import { AppService } from '../application/app.service';
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { ProxyService } from '../infrastructure/proxy.service';

@Controller()
export class AppController {
  private readonly proxyTargets: [string] | null;
  constructor(
    private readonly appService: AppService,
    private readonly proxyService: ProxyService,
    configService: ConfigService,
  ) {
    this.proxyTargets = configService.get('defaultHost') || null;
  }

  @Get('/hello')
  getHello(@Req() req: any): Promise<string> {
    return this.appService.getCount(getHostnameOrLocalhost(req.hostname));
  }

  @Get('/webhooks-per-host')
  getWebhooksGroupByHosts(): Promise<any> {
    return this.appService.getWebhooksPerHosts();
  }

  @Post('/*')
  async createWebhookWithoutPath(
    @Body() body: any,
    @Ip() ip: string,
    @Headers() headers: Record<string, string>,
    @Param() params: string[],
    @Next() next: NextFunction,
    @Res() res: any,
    @Req() req: any,
  ): Promise<Webhook | void> {
    const path = params['0'] ? `/${params['0']}` : '/';
    if (path === '/graphql') {
      return next();
    }
    console.log(`Webhook received on ${path}`);
    if (this.proxyTargets) {
      this.proxyTargets.forEach((target) => {
        this.proxyService.sendWebhook(target, body, headers, path);
      });
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
  deleteWebhooks(@Req() req: any): Promise<{ count: number }> {
    return this.appService.deleteWebhooks(getHostnameOrLocalhost(req.hostname));
  }
}
