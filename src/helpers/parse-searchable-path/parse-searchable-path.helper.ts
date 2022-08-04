import { pipe } from 'fp-ts/function';

function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, '');
}

function removeUuids(str: string): string {
  return str.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//g,
    '/:id/',
  );
}

function removeNumeralIds(str: string): string {
  return str.replace(/\/[0-9]*\//g, '/:id/');
}

function addTrailingSlash(str: string): string {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}

export const pathToSearchablePath = (path: string): string => {
  return pipe(
    path,
    addTrailingSlash,
    removeUuids,
    removeNumeralIds,
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
