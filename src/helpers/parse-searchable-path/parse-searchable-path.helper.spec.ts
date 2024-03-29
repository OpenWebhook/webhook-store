import { pathToSearchablePath } from './parse-searchable-path.helper';

describe('pathToSearchablePath', () => {
  it('Should the same string for regular words', () => {
    expect(pathToSearchablePath('/croute/lol')).toBe('/croute/lol');
  });

  it('Should replace numeral ids with :id', () => {
    expect(pathToSearchablePath('/croute/1234/lol')).toBe('/croute/:id/lol');
    expect(pathToSearchablePath('/croute/1234985/lol')).toBe('/croute/:id/lol');
    expect(pathToSearchablePath('/1234985')).toBe('/:id');
    expect(pathToSearchablePath('/1234985/')).toBe('/:id');
    expect(pathToSearchablePath('/yolo/1234985/')).toBe('/yolo/:id');
  });

  it('Should not replace path with numbers', () => {
    expect(pathToSearchablePath('/yolo/w3ird-path/')).toBe('/yolo/w3ird-path');
  });

  it('Should replace uuids with :id', () => {
    expect(
      pathToSearchablePath('/croute/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/lol'),
    ).toBe('/croute/:id/lol');
    expect(
      pathToSearchablePath('/croute/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/lol/'),
    ).toBe('/croute/:id/lol');
    expect(pathToSearchablePath('/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2')).toBe(
      '/:id',
    );
    expect(pathToSearchablePath('/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/')).toBe(
      '/:id',
    );
  });

  it('Should replace branded uuids with :id', () => {
    expect(
      pathToSearchablePath(
        '/croute/wh-0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/lol',
      ),
    ).toBe('/croute/wh-:id/lol');
    expect(
      pathToSearchablePath(
        '/croute/wh-0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/lol/',
      ),
    ).toBe('/croute/wh-:id/lol');
    expect(
      pathToSearchablePath('/wh-0059b14c-5b01-47ac-8e65-c82fdb4fc6e2'),
    ).toBe('/wh-:id');
    expect(
      pathToSearchablePath('/wh-0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/'),
    ).toBe('/wh-:id');
  });

  it('Should replace random char ids with :id', () => {
    expect(
      pathToSearchablePath(
        '/pathWithStripeId/sk_test_4eC39HqLyjWDarjtT1zdp7dc/',
      ),
    ).toBe('/pathWithStripeId/sk_test_:id');
  });

  it('Should handle mutliple /', () => {
    expect(pathToSearchablePath('/croute/lol/////')).toBe('/croute/lol');
    expect(pathToSearchablePath('/croute///lol/////')).toBe('/croute/lol');
  });

  it('Should handle empty path', () => {
    expect(pathToSearchablePath('')).toBe('/');
    expect(pathToSearchablePath('//////')).toBe('/');
  });
});
