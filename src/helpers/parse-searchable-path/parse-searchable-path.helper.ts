import { pipe } from 'fp-ts/function';
import { string, array } from 'fp-ts';

const uuidRegexp =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const numeralIdRegexp = /[0-9]+/g;

const parsePathOnSlash = (path: string): string[] => {
  return path.split('/');
};

const joinPath = (paths: string[]): string => {
  return '/' + paths.join('/');
};

export const pathToSearchablePath = (path: string): string => {
  return pipe(
    path,
    parsePathOnSlash,
    array.filter((s): boolean => {
      return !string.isEmpty(s);
    }),
    array.map(string.replace(uuidRegexp, ':id')),
    array.map(string.replace(numeralIdRegexp, ':id')),
    joinPath,
  );
};

export const pathIsValid = (path: string | undefined): path is `/${string}` => {
  if (path) {
    return path.startsWith('/');
  } else {
    return false;
  }
};
