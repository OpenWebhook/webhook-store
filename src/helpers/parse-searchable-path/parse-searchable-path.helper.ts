export const pathToSearchablePath = (path: string): string => {
  return path.split('/').join(' / ');
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
    const pathWithoutFirstSlash = path.slice(1).split('/').join(' - ');
    return pathWithoutFirstSlash;
  }
};
