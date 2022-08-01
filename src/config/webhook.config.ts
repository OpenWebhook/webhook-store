import { registerAs } from '@nestjs/config';
import { none, Option, some } from 'fp-ts/lib/Option';

export default registerAs(
  'webhookStore',
  (): {
    maxStoredWebhookPerHost: Option<number>;
    defaultHost: Option<string[]>;
  } => ({
    maxStoredWebhookPerHost: process.env.MAX_STORED_WEBHOOKS_PER_HOST
      ? some(parseInt(process.env.MAX_STORED_WEBHOOKS_PER_HOST, 10))
      : none,
    defaultHost:
      process.env.DEFAULT_HOST && process.env.DEFAULT_HOST.length
        ? some([process.env.DEFAULT_HOST])
        : process.env.DEFAULT_TARGETS && process.env.DEFAULT_TARGETS.length
        ? some(process.env.DEFAULT_TARGETS.split(','))
        : none,
  }),
);
