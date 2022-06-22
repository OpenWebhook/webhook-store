import { pathToPSQLTsQuery } from './parse-searchable-path.helper';

describe('pathToPSQLTsQuery', () => {
  it('Should return undefined if given undefined', () => {
    expect(pathToPSQLTsQuery(undefined)).toBeUndefined();
  });

  it('Should return - / - except for the first character', () => {
    expect(pathToPSQLTsQuery('/croute/lol')).toBe('croute <-> lol');
  });
});
