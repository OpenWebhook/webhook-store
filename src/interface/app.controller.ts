import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Ip,
  Next,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Webhook } from '@prisma/client';
import { NextFunction } from 'express';
import { ProxyService } from '../application/proxy-response/proxy.service';
import { WebhookService } from '../application/webhook/webhook.service';
import { getHostnameOrLocalhost } from '../helpers/get-hostname/get-hostname.helper';
import { Request } from 'express';
import webhookConfig from '../config/webhook.config';
import { fromNullable } from 'fp-ts/Option';

@Controller()
export class AppController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly proxyService: ProxyService,
    @Inject(webhookConfig.KEY)
    private webhookStoreConfig: ConfigType<typeof webhookConfig>,
  ) {}

  @Get('/hello')
  getHello(@Req() req: any): Promise<string> {
    return this.webhookService.getCount(getHostnameOrLocalhost(req.hostname));
  }

  @Get('/webhooks-per-host')
  getWebhooksGroupByHosts(): Promise<any> {
    return this.webhookService.getWebhooksPerHosts();
  }

  @Post('/*')
  @UseInterceptors(AnyFilesInterceptor())
  async createWebhook(
    @Body() body: any,
    @UploadedFiles() files: Array<Express.Multer.File> | undefined,
    @Ip() ip: string,
    @Headers() headers: Record<string, string>,
    @Param() params: string[],
    @Next() next: NextFunction,
    @Res() res: any,
    @Req() req: Request,
  ): Promise<Webhook | void> {
    const path = params['0'] ? `/${params['0']}` : '/';
    if (path === '/graphql') {
      return next();
    }
    console.log(`Webhook received on ${path}`);
    const host = getHostnameOrLocalhost(fromNullable(req.hostname));
    const webhook = await this.webhookService.handleIncomingWebhook(
      body,
      files || [],
      headers,
      ip,
      path,
      host,
    );
    if (this.webhookStoreConfig.defaultHost._tag === 'Some') {
      this.proxyService.sendAndStoreWebhookToTargets(
        this.webhookStoreConfig.defaultHost.value,
        body,
        headers,
        path,
        webhook.id,
        host,
      );
    }
    return res.send(webhook);
  }

  @Delete()
  deleteWebhooks(@Req() req: Request): Promise<{ count: number }> {
    return this.webhookService.deleteWebhooks(
      getHostnameOrLocalhost(fromNullable(req.hostname)),
    );
  }
}
