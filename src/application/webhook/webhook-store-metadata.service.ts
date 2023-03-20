export type WebhookStoreMetadata = {
  maxNumberOfWebhookPerHost: number;
  defaultTarget: string | null;
};

export class WebhookStoreMetadatService {
  getWebbookStoreMetadata(): WebhookStoreMetadata {
    return {
      maxNumberOfWebhookPerHost: 100,
      defaultTarget: null,
    };
  }
}
