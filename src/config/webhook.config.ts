import { registerAs } from '@nestjs/config';
import { option } from 'fp-ts';

export default registerAs(
  'webhookStore',
  (): {
    maxStoredWebhookPerHost: option.Option<number>;
    defaultHost: option.Option<string[]>;
  } => ({
    maxStoredWebhookPerHost: process.env.MAX_STORED_WEBHOOKS_PER_HOST
      ? option.some(parseInt(process.env.MAX_STORED_WEBHOOKS_PER_HOST, 10))
      : option.none,
    defaultHost:
      process.env.DEFAULT_HOST && process.env.DEFAULT_HOST.length
        ? option.some([process.env.DEFAULT_HOST])
        : process.env.DEFAULT_TARGETS && process.env.DEFAULT_TARGETS.length
        ? option.some(process.env.DEFAULT_TARGETS.split(','))
        : option.none,
  }),
);
