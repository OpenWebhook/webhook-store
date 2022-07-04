export const getHostnameOrLocalhost = (host?: string): string => {
  if (!host) {
    return 'localhost';
  }
  if (host.includes('localhost:')) {
    return 'localhost';
  }
  if (process.env.NODE_ENV === 'test') {
    throw new Error('The function should be mocked in a test');
  } else {
    return host;
  }
};
