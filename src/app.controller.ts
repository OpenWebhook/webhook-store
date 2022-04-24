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
  Res,
} from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { NextFunction } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Post('/*')
  async createWebhookWithoutPath(
    @Body() body,
    @Ip() ip,
    @Headers() headers,
    @Param() params: string[],
    @Next() next: NextFunction,
    @Res() res,
  ): Promise<Webhook | void> {
    const path = params['0'];
    if (path === 'graphql') {
      return next();
    }

    const webhook = await this.appService.addWebhook({
      body,
      headers,
      ip,
      path,
    });
    return res.send(webhook);
  }

  @Delete()
  deleteWebhooks(): Promise<{ count: number }> {
    return this.appService.deleteWebhooks();
  }
}
