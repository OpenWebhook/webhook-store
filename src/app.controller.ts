import { Controller, Get, Post } from '@nestjs/common';
import { Webhook } from '@prisma/client';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Post()
  createWebhook(): Promise<Webhook> {
    return this.appService.addWebhook();
  }
}
