export type CuePoint = {
  id: string;
  time: number; // in seconds
  subtitleText?: string;
  label?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any; // arbitrary metadata for interaction
};
