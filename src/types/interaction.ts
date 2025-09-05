export type InteractionResponse = {
  cueId: string;
  choice: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};

export type ChoiceVideoSegmentChangeOption = {
  level: string;
  video: string;
};

type BaseInteraction = {
  title?: string;
  description?: string;
  question: string;
};

export type ChoiceInteraction = BaseInteraction & {
  type: 'choice';
  options: string[];
  correctAnswer?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type TextInteraction = BaseInteraction & {
  type: 'text';
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type RatingInteraction = BaseInteraction & {
  type: 'rating';
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type ChoiceVideoSegmentChangeInteraction = BaseInteraction & {
  type: 'choice-video-segment-change';
  options: ChoiceVideoSegmentChangeOption[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  response?: Record<string, any>;
};

export type InteractionPayload =
  | ChoiceInteraction
  | TextInteraction
  | RatingInteraction
  | ChoiceVideoSegmentChangeInteraction;

export type InteractionSegment = {
  id: string;
  cueId: string;
  payload: InteractionPayload;
  triggerTime?: number;
};
