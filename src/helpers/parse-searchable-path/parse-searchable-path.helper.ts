import { pipe } from 'fp-ts/function';
import { string, array } from 'fp-ts';

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

const numeralIdRegex = /^[0-9]+$/g;

const randomCharIdRegex = /(?=.*?[A-Z])(?=.*?[0-9])[a-zA-Z0-9]{10,}/g;

const parsePathOnSlash = (path: string): string[] => {
  return path.split('/');
};

const joinPathWithSlash = (paths: string[]): string => {
  return '/' + paths.join('/');
};

const stringIsNotEmpty = (s: string): boolean => {
  return !string.isEmpty(s);
};

export const pathToSearchablePath = (path: string): string => {
  return pipe(
    path,
    parsePathOnSlash,
    array.filter(stringIsNotEmpty),
    array.map(string.replace(uuidRegex, ':id')),
    array.map(string.replace(numeralIdRegex, ':id')),
    array.map(string.replace(randomCharIdRegex, ':id')),
    joinPathWithSlash,
  );
};

export const pathIsValid = (path: string | undefined): path is `/${string}` => {
  if (path) {
    return path.startsWith('/');
  } else {
    return false;
  }
};
