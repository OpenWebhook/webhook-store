import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Ip,
  Param,
  Post,
} from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Post('/webhook/*')
  createWebhook(
    @Param() params,
    @Body() body,
    @Ip() ip,
    @Headers() headers,
  ): Promise<Webhook> {
    const path = params['0'];
    return this.appService.addWebhook({ body, headers, ip, path });
  }

  @Delete()
  deleteWebhooks(): Promise<{ count: number }> {
    return this.appService.deleteWebhooks();
  }
}
