export const getHostnameOrLocalhost = (host?: string): string => {
  if (!host) {
    return 'localhost';
  }
  if (host.includes('localhost')) {
    return 'localhost';
  }
  if (process.env.NODE_ENV === 'test') {
    return 'localhost';
  } else {
    return host;
  }
};
