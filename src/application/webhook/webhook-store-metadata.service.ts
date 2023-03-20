import { ConfigType } from '@nestjs/config';
import webhookConfig from '../../config/webhook.config';
import { option } from 'fp-ts';
import { Inject } from '@nestjs/common';

export type WebhookStoreMetadata = {
  maxNumberOfWebhookPerHost: number | null;
  defaultTarget: string[] | null;
};

export class WebhookStoreMetadatService {
  constructor(
    @Inject(webhookConfig.KEY)
    private readonly webhookStoreConfig: ConfigType<typeof webhookConfig>,
  ) {}
  getWebbookStoreMetadata(): WebhookStoreMetadata {
    return WebhookStoreMetadatService.getWebbookStoreMetadata(
      this.webhookStoreConfig,
    );
  }

  static getWebbookStoreMetadata(
    config: ConfigType<typeof webhookConfig>,
  ): WebhookStoreMetadata {
    return {
      maxNumberOfWebhookPerHost: option.isSome(config.maxStoredWebhookPerHost)
        ? config.maxStoredWebhookPerHost.value
        : null,
      defaultTarget: option.isSome(config.defaultHost)
        ? config.defaultHost.value
        : null,
    };
  }
}
