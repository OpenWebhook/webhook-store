import { v4 as uuidv4 } from 'uuid';
import { io } from 'fp-ts';

export const whUuid: io.IO<`wh-${string}`> = () => {
  return `wh-${uuidv4()}`;
};

export const rsUuid: io.IO<`rs-${string}`> = () => {
  return `rs-${uuidv4()}`;
};
