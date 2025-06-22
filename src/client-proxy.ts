import { createProxyMiddleware } from 'http-proxy-middleware';

const CLIENT_URL =
  process.env.CLIENT_URL || 'https://openwebhook.github.io/client';

const pathFilter = function (path: string, req: any) {
  return (
    req.method === 'GET' &&
    path !== '/graphql' &&
    path !== '/health' &&
    path !== '/playground' &&
    path !== '/store-metadata' &&
    path !== '/auth-metadata' &&
    path !== '/count-webhooks' &&
    path !== '/webhooks-per-host'
  );
};

export const clientProxy = createProxyMiddleware(pathFilter, {
  target: CLIENT_URL,
  changeOrigin: true,
  followRedirects: true,
  pathRewrite: {
    // For root path, rewrite to empty string to get the client index
    '^/$': '',
    // For paths starting with /client, remove the /client prefix since target already includes it
    '^/client': '',
  },
});
