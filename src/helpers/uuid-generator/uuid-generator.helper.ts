import { v4 as uuidv4 } from 'uuid';

export const whUuid = (): `wh-${string}` => {
  return `wh-${uuidv4()}`;
};
