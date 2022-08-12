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

  it('Should handle mutliple /', () => {
    expect(pathToSearchablePath('/croute/lol/////')).toBe('/croute/lol');
    expect(pathToSearchablePath('/croute///lol/////')).toBe('/croute/lol');
  });

  it('Should handle empty path', () => {
    expect(pathToSearchablePath('')).toBe('/');
    expect(pathToSearchablePath('//////')).toBe('/');
  });
});
