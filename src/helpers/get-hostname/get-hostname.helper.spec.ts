import { getHostnameOrLocalhost } from './get-hostname.helper';
import { option } from 'fp-ts';

describe('getHostnameOrLocalhost', () => {
  it('throw an error in test conditions', () => {
    expect(() => {
      getHostnameOrLocalhost(option.of('127.0.0.1'));
    }).toThrowError('The function should be mocked in a test');
    expect(() => {
      getHostnameOrLocalhost(option.of('::1'));
    }).toThrowError('The function should be mocked in a test');
  });

  it('returns localhost if host is not defined', () => {
    const host = getHostnameOrLocalhost(option.none);
    expect(host).toBe('localhost');
  });

  it('returns localhost if host is has localhost and a port', () => {
    const host = getHostnameOrLocalhost(option.of('localhost:9000'));
    expect(host).toBe('localhost');
  });
});
