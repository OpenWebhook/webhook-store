import { pipe } from 'fp-ts/function';
import { string } from 'fp-ts';

const uuidRegexp =
  /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//g;

const numeralIdRegexp = /\/[0-9]+\//g;

function addTrailingSlash(str: string): string {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}
const removeTrailingSlash: (str: string) => string = string.replace(/\/+$/, '');

export const pathToSearchablePath = (path: string): string => {
  return pipe(
    path,
    addTrailingSlash,
    string.replace(uuidRegexp, '/:id/'),
    string.replace(numeralIdRegexp, '/:id/'),
    removeTrailingSlash,
  );
};

export const pathIsValid = (path: string | undefined): path is `/${string}` => {
  if (path) {
    return path.startsWith('/');
  } else {
    return false;
  }
};
