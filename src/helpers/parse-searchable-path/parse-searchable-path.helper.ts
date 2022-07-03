export const pathToSearchablePath = (path: string): string => {
  const pathWithoutUUIDs = path.replace(
    /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//g,
    '/:id/',
  );

  const pathWithoutNumeralIds = pathWithoutUUIDs.replace(
    /\/[0-9]*\//g,
    '/:id/',
  );

  return pathWithoutNumeralIds;
};

export const pathIsValid = (path: string | undefined): path is `/${string}` => {
  if (path) {
    return path.startsWith('/');
  } else {
    return false;
  }
};

export const pathToPSQLTsQuery = (
  path: `/${string}` | undefined,
): string | undefined => {
  if (typeof path === 'string') {
    const pathWithoutFirstSlash = path.slice(1).split('/').join(' <-> ');
    return pathWithoutFirstSlash;
  }
};
