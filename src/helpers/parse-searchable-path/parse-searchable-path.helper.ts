function removeTrailingSlash(str: string): string {
  return str.replace(/\/+$/, '');
}

export const pathToSearchablePath = (path: string): string => {
  const pathWithATrailingSlash =
    path[path.length - 1] === '/' ? path : `${path}/`;
  const pathWithoutUUIDs = pathWithATrailingSlash.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//g,
    '/:id/',
  );

  const pathWithoutNumeralIds = pathWithoutUUIDs.replace(
    /\/[0-9]*\//g,
    '/:id/',
  );

  const pathWithoutTrailingSlash = removeTrailingSlash(pathWithoutNumeralIds);
  return pathWithoutTrailingSlash;
};

export const pathIsValid = (path: string | undefined): path is `/${string}` => {
  if (path) {
    return path.startsWith('/');
  } else {
    return false;
  }
};
