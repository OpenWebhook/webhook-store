import { Option } from 'fp-ts/Option';

export const getHostnameOrLocalhost = (host: Option<string>): string => {
  if (host._tag === 'None') {
    return 'localhost';
  } else {
    if (host.value.includes('localhost:')) {
      return 'localhost';
    }
    if (process.env.NODE_ENV === 'test') {
      throw new Error('The function should be mocked in a test');
    } else {
      return host.value;
    }
  }
};
