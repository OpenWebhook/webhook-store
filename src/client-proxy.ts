import { createProxyMiddleware } from 'http-proxy-middleware';

const CLIENT_URL =
  process.env.CLIENT_URL || 'https://demo.openwebhook.io/refs/tags/v1.0.3';

const pathFilter = function (path: string, req: any) {
  return (
    req.method === 'GET' &&
    path !== '/graphql' &&
    path !== '/playground' &&
    path !== '/hello-protected' &&
    path !== '/hello' &&
    path !== '/webhooks-per-host'
  );
};

export const clientProxy = createProxyMiddleware(pathFilter, {
  target: CLIENT_URL,
  changeOrigin: true,
  followRedirects: true,
  pathRewrite: {
    '^(.(?!.*.css$|.*.js.map$|.*.js$|.*.html))*$': '',
  },
});
