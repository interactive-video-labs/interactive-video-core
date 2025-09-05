export type Decision = {
  cueId: string;
  choice: string;
  timestamp: number;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
};

export interface DecisionAdapter {
  saveDecision(decision: Decision): Promise<void>;
  getDecisionHistory(): Promise<Decision[]>;
  clearDecisionHistory(): Promise<void>;
}
