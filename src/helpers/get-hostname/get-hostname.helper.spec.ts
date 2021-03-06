import { getHostnameOrLocalhost } from './get-hostname.helper';

describe('getHostnameOrLocalhost', () => {
  it('throw an error in test conditions', () => {
    expect(() => {
      getHostnameOrLocalhost('127.0.0.1');
    }).toThrowError('The function should be mocked in a test');
    expect(() => {
      getHostnameOrLocalhost('::1');
    }).toThrowError('The function should be mocked in a test');
  });

  it('returns localhost if host is not defined', () => {
    const host = getHostnameOrLocalhost();
    expect(host).toBe('localhost');
  });

  it('returns localhost if host is has localhost and a port', () => {
    const host = getHostnameOrLocalhost('localhost:9000');
    expect(host).toBe('localhost');
  });
});
