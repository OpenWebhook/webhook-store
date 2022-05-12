export const getHostnameOrLocalhost = (host?: string): string => {
  if (!host) {
    return 'localhost';
  }
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'dev' ||
    process.env.NODE_ENV === undefined
  ) {
    return 'localhost';
  } else {
    return host;
  }
};
