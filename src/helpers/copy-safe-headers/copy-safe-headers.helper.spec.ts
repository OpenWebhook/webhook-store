import { copySafeHeaders } from './copy-safe-headers.helper';

describe('copySafeHeaders', () => {
  it('does not alter the headers', () => {
    const headers = { host: 'localhost' };
    const safeHeaders = copySafeHeaders(headers);
    expect(headers).toBe(headers);
    expect(safeHeaders).toStrictEqual({});
  });

  it('keeps authorization headers', () => {
    const headers = { authorization: 'bearer token' };
    const safeHeaders = copySafeHeaders(headers);
    expect(safeHeaders.authorization).toBe(headers.authorization);
  });

  it('keeps specific x- headers', () => {
    const headers = {
      'x-myheader': 'header 1',
      'X-my-other-header': 'header 2',
    };
    const safeHeaders = copySafeHeaders(headers);
    expect(safeHeaders).toStrictEqual(headers);
  });

  it('reomves network headers', () => {
    const headers = {
      'x-scheme': 'croute',
      'x-real-ip': 'croute',
      'cf-ipcountry': 'croute',
      'x-request-id': 'croute',
      'x-forwarded-for': 'croute',
      'cf-connecting-ip': 'croute',
      'x-forwarded-host': 'croute',
      'x-forwarded-port': 'croute',
      'x-forwarded-proto': 'croute',
      'x-forwarded-scheme': 'croute',
      'x-original-forwarded-for': 'croute',
    };
    const safeHeaders = copySafeHeaders(headers);
    expect(safeHeaders['x-scheme']).toBe(undefined);
    expect(safeHeaders['x-real-ip']).toBe(undefined);
    expect(safeHeaders['cf-ipcountry']).toBe(undefined);
    expect(safeHeaders['x-request-id']).toBe(undefined);
    expect(safeHeaders['x-forwarded-for']).toBe(undefined);
    expect(safeHeaders['cf-connecting-ip']).toBe(undefined);
    expect(safeHeaders['x-forwarded-host']).toBe(undefined);
    expect(safeHeaders['x-forwarded-port']).toBe(undefined);
    expect(safeHeaders['x-forwarded-proto']).toBe(undefined);
    expect(safeHeaders['x-forwarded-scheme']).toBe(undefined);
    expect(safeHeaders['x-original-forwarded-for']).toBe(undefined);
  });
});
