import { getHostnameOrLocalhost } from './get-hostname.helper';

describe('getHostnameOrLocalhost', () => {
  it('returns localhost in test conditions', () => {
    const host = getHostnameOrLocalhost('yolocroutelol');
    expect(host).toBe('localhost');
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
