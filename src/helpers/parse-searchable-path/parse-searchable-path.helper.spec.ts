import {
  pathToPSQLTsQuery,
  pathToSearchablePath,
} from './parse-searchable-path.helper';

describe('pathToPSQLTsQuery', () => {
  it('Should return undefined if given undefined', () => {
    expect(pathToPSQLTsQuery(undefined)).toBeUndefined();
  });

  it('Should return - / - except for the first character', () => {
    expect(pathToPSQLTsQuery('/croute/lol')).toBe('croute <-> lol');
  });
});

describe('pathToSearchablePath', () => {
  it('Should the same string for regular words', () => {
    expect(pathToSearchablePath('/croute/lol')).toBe('/croute/lol');
  });

  it('Should replace numeral ids with :id', () => {
    expect(pathToSearchablePath('/croute/1234/lol')).toBe('/croute/:id/lol');
    expect(pathToSearchablePath('/croute/1234985/lol')).toBe('/croute/:id/lol');
  });

  it('Should replace uuids with :id', () => {
    expect(
      pathToSearchablePath('/croute/0059b14c-5b01-47ac-8e65-c82fdb4fc6e2/lol'),
    ).toBe('/croute/:id/lol');
  });
});
