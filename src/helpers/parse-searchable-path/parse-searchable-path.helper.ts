export const pathToSearchablePath = (path: string): string => {
  return path.split('/').join(' / ');
};
