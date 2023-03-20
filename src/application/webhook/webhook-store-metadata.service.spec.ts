import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { option } from 'fp-ts';
import webhookConfig from '../../config/webhook.config';
import { WebhookStoreMetadatService } from './webhook-store-metadata.service';

describe('WebhookStoreMetadatService', () => {
  let service: WebhookStoreMetadatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ load: [webhookConfig] })],
      providers: [WebhookStoreMetadatService],
    }).compile();

    service = module.get<WebhookStoreMetadatService>(
      WebhookStoreMetadatService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct metadata', () => {
    const config = {
      maxStoredWebhookPerHost: option.some(10),
      defaultHost: option.some(['http://localhost:3000']),
    };
    const metadata = WebhookStoreMetadatService.getWebbookStoreMetadata(config);
    expect(metadata).toEqual({
      maxNumberOfWebhookPerHost: 10,
      defaultTarget: ['http://localhost:3000'],
    });
  });
});
