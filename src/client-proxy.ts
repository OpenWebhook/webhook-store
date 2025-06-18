import { createProxyMiddleware } from 'http-proxy-middleware';

const CLIENT_URL =
  process.env.CLIENT_URL || 'https://openwebhook.github.io/client/refs/tags/v1.0.8';

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
    '^(.(?!.*.css$|.*.js.map$|.*.svg$|.*.ico$|.*.js$|.*.html))*$': '',
  },
});
