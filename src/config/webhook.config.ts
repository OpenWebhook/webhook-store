export default () => ({
  maxStoredWebhookPerHost: process.env.MAX_STORED_WEBHOOKS_PER_HOST
    ? parseInt(process.env.MAX_STORED_WEBHOOKS_PER_HOST, 10)
    : null,
  defaultHost: process.env.DEFAULT_HOST,
});
