import { Decision, DecisionAdapter } from './types';

export class InMemoryDecisionAdapter implements DecisionAdapter {
  private decisions: Decision[] = [];

  async saveDecision(decision: Decision): Promise<void> {
    this.decisions.push(decision);
  }

  async getDecisionHistory(): Promise<Decision[]> {
    return [...this.decisions];
  }

  async clearDecisionHistory(): Promise<void> {
    this.decisions = [];
  }
}
