import { registerAs } from '@nestjs/config';

export default registerAs('webhookStore', () => ({
  maxStoredWebhookPerHost: process.env.MAX_STORED_WEBHOOKS_PER_HOST
    ? parseInt(process.env.MAX_STORED_WEBHOOKS_PER_HOST, 10)
    : null,
  defaultHost:
    process.env.DEFAULT_HOST && process.env.DEFAULT_HOST.length
      ? [process.env.DEFAULT_HOST]
      : process.env.DEFAULT_TARGETS && process.env.DEFAULT_TARGETS.length
      ? process.env.DEFAULT_TARGETS.split(',')
      : null,
}));
